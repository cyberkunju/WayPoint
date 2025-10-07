import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash, PencilSimple, Target, CheckCircle, Minus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '../hooks/use-store';
import { toast } from 'sonner';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
  children: string[];
  isEditing?: boolean;
  isTask?: boolean;
}

interface Connection {
  from: string;
  to: string;
}

export function MindMapView() {
  const { addTask } = useTaskStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Record<string, MindMapNode>>({
    'root': {
      id: 'root',
      text: 'Ideas & Tasks',
      x: 400,
      y: 300,
      level: 0,
      children: [],
      isTask: false
    }
  });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Generate node positions in a radial layout
  const generateNodePosition = useCallback((parentNode: MindMapNode, childIndex: number, totalChildren: number) => {
    const radius = 150 + (parentNode.level * 50);
    const angleStep = (2 * Math.PI) / Math.max(totalChildren, 1);
    const angle = angleStep * childIndex - Math.PI / 2;

    return {
      x: parentNode.x + Math.cos(angle) * radius,
      y: parentNode.y + Math.sin(angle) * radius
    };
  }, []);

  // Add a new child node
  const addChildNode = useCallback((parentId: string) => {
    const parentNode = nodes[parentId];
    if (!parentNode) return;

    const newNodeId = `node_${Date.now()}`;
    const childIndex = parentNode.children.length;
    const totalChildren = parentNode.children.length + 1;
    const position = generateNodePosition(parentNode, childIndex, totalChildren);

    const newNode: MindMapNode = {
      id: newNodeId,
      text: 'New Idea',
      x: position.x,
      y: position.y,
      level: parentNode.level + 1,
      parentId,
      children: [],
      isEditing: true,
      isTask: false
    };

    setNodes(prev => {
      const newNodes = {
        ...prev,
        [newNodeId]: newNode,
        [parentId]: {
          ...parentNode,
          children: [...parentNode.children, newNodeId]
        }
      };

      // Re-layout children of the parent node to ensure they are evenly spaced
      const updatedParent = newNodes[parentId];
      updatedParent.children.forEach((childId, index) => {
        const childNode = newNodes[childId];
        if (childNode) {
          const newPosition = generateNodePosition(updatedParent, index, totalChildren);
          newNodes[childId] = { ...childNode, ...newPosition };
        }
      });

      return newNodes;
    });

    setConnections(prev => [...prev, { from: parentId, to: newNodeId }]);
    setSelectedNode(newNodeId);
  }, [nodes, generateNodePosition]);

  // Update node text
  const updateNodeText = useCallback((nodeId: string, text: string) => {
    setNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        text,
        isEditing: false
      }
    }));
  }, []);

  // Delete a node and its children
  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'root') return;

    let nodesToDelete: string[] = [];
    const findChildren = (id: string) => {
      nodesToDelete.push(id);
      const node = nodes[id];
      if (node) {
        node.children.forEach(findChildren);
      }
    };
    findChildren(nodeId);

    setNodes(prev => {
      const newNodes = { ...prev };
      const nodeToDelete = newNodes[nodeId];

      // Remove from parent's children array
      if (nodeToDelete?.parentId) {
        const parent = newNodes[nodeToDelete.parentId];
        if (parent) {
          parent.children = parent.children.filter(childId => childId !== nodeId);
        }
      }

      // Delete the node and all its descendants
      nodesToDelete.forEach(id => {
        delete newNodes[id];
      });

      return newNodes;
    });

    setConnections(prev => prev.filter(conn => !nodesToDelete.includes(conn.from) && !nodesToDelete.includes(conn.to)));
    setSelectedNode(null);
  }, [nodes]);

  // Convert node to task
  const convertToTask = useCallback((nodeId: string) => {
    const node = nodes[nodeId];
    if (!node || node.isTask) return;

    addTask({ title: node.text });

    setNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        isTask: true
      }
    }));

    toast.success('Idea converted to task!');
  }, [nodes, addTask]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;

    const node = nodes[nodeId];
    if (!node) return;

    setDraggedNode(nodeId);
    setSelectedNode(nodeId);

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const svgX = (clientX - rect.left) / zoom + pan.x;
      const svgY = (clientY - rect.top) / zoom + pan.y;

      setDragOffset({
        x: svgX - node.x,
        y: svgY - node.y
      });
    }
  }, [nodes, zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const svgX = (clientX - rect.left) / zoom + pan.x;
      const svgY = (clientY - rect.top) / zoom + pan.y;

      const newX = svgX - dragOffset.x;
      const newY = svgY - dragOffset.y;

      setNodes(prev => ({
        ...prev,
        [draggedNode]: {
          ...prev[draggedNode],
          x: newX,
          y: newY
        }
      }));
    }
  }, [draggedNode, dragOffset, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Zoom and pan controls
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.2, Math.min(3, prev + delta)));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const width = 800 / zoom;
    const height = 600 / zoom;
    const x = -pan.x;
    const y = -pan.y;
    setViewBox(`${x} ${y} ${width} ${height}`);
  }, [zoom, pan]);


  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="heading-2 text-foreground">Mind Map</h1>
          <Badge variant="outline" className="text-xs">
            Brainstorm & Convert to Tasks
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.1)}
            disabled={zoom >= 3}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            disabled={zoom <= 0.2}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            Reset View
          </Button>
          <span className="text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-hidden bg-background">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Connections */}
          <g>
            {connections.map((conn) => {
              const fromNode = nodes[conn.from];
              const toNode = nodes[conn.to];
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5 / zoom}
                  opacity="0.6"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {Object.values(nodes).map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => setSelectedNode(node.id)}
                className="cursor-pointer"
              >
                <circle
                  r={node.level === 0 ? 40 : 30}
                  fill={
                    node.isTask
                      ? "hsl(var(--success))"
                      : node.level === 0
                        ? "hsl(var(--primary))"
                        : "hsl(var(--secondary))"
                  }
                  stroke={selectedNode === node.id ? "hsl(var(--ring))" : "transparent"}
                  strokeWidth={3 / zoom}
                  className="hover:opacity-90 transition-opacity"
                />

                {node.isEditing ? (
                  <foreignObject
                    x={-50}
                    y={-12}
                    width="100"
                    height="24"
                    transform={`scale(${1 / zoom})`}
                  >
                    <Input
                      className="text-xs text-center p-1"
                      defaultValue={node.text}
                      autoFocus
                      onBlur={(e) => updateNodeText(node.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateNodeText(node.id, e.currentTarget.value);
                        }
                      }}
                    />
                  </foreignObject>
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--primary-foreground))"
                    fontSize={node.level === 0 ? 14 : 12}
                    fontWeight="500"
                    className="pointer-events-none select-none"
                  >
                    {node.text.length > 12 ? `${node.text.slice(0, 12)}...` : node.text}
                  </text>
                )}

                {node.isTask && (
                  <g transform={`translate(20, -20)`}>
                    <circle r="10" fill="hsl(var(--success-foreground))" />
                    <CheckCircle size={12} fill="hsl(var(--success))" className="text-white" />
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Node Controls */}
        {selectedNode && nodes[selectedNode] && (
          <Card className="absolute top-4 right-4 p-4 w-64 shadow-lg bg-card/90 backdrop-blur-sm">
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              Node Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => addChildNode(selectedNode)}
              >
                <Plus className="w-4 h-4" />
                Add Child Idea
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setNodes(prev => ({
                    ...prev,
                    [selectedNode]: {
                      ...prev[selectedNode],
                      isEditing: true
                    }
                  }));
                }}
              >
                <PencilSimple className="w-4 h-4" />
                Edit Text
              </Button>

              {!nodes[selectedNode].isTask && selectedNode !== 'root' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => convertToTask(selectedNode)}
                >
                  <Target className="w-4 h-4" />
                  Convert to Task
                </Button>
              )}

              {selectedNode !== 'root' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => deleteNode(selectedNode)}
                >
                  <Trash className="w-4 h-4" />
                  Delete Node
                </Button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Drag nodes to reposition them. Click to select.
              </p>
            </div>
          </Card>
        )}

        {/* Instructions overlay for empty state */}
        {Object.keys(nodes).length === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Card className="p-6 max-w-md text-center bg-card/80 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Start Brainstorming
              </h3>
              <p className="text-muted-foreground mb-4">
                Select the central node and use the "Node Actions" panel to add your first idea.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Click • Drag • Create • Convert</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}