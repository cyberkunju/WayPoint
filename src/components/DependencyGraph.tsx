import { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { taskDependenciesService, type TaskDependency } from '@/services/task-dependencies.service';
import { useTaskStore } from '@/hooks/use-store';
import { account } from '@/lib/appwrite';

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  level: number;
}

interface Edge {
  from: string;
  to: string;
  type: string;
}

export function DependencyGraph({ projectId }: { projectId?: string }) {
  const { tasks } = useTaskStore();
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [userId, setUserId] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        
        const deps = await taskDependenciesService.getAllDependencies(user.$id);
        setDependencies(deps);
      } catch (err) {
        console.error('Error loading dependencies:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!tasks || !dependencies.length) return;

    // Filter tasks by project if specified
    const filteredTasks = projectId 
      ? tasks.filter(t => t.projectId === projectId)
      : tasks;

    // Build graph structure
    const taskIds = new Set(filteredTasks.map(t => t.id));
    const relevantDeps = dependencies.filter(d => 
      taskIds.has(d.taskId) && taskIds.has(d.dependsOnTaskId)
    );

    // Calculate levels using topological sort
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    
    filteredTasks.forEach(task => {
      inDegree.set(task.id, 0);
      graph.set(task.id, []);
    });

    relevantDeps.forEach(dep => {
      graph.get(dep.dependsOnTaskId)?.push(dep.taskId);
      inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1);
    });

    // Assign levels
    const levels = new Map<string, number>();
    const queue: string[] = [];

    filteredTasks.forEach(task => {
      if (inDegree.get(task.id) === 0) {
        levels.set(task.id, 0);
        queue.push(task.id);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current) || 0;
      const neighbors = graph.get(current) || [];

      neighbors.forEach(neighbor => {
        const newInDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newInDegree);

        const newLevel = Math.max(levels.get(neighbor) || 0, currentLevel + 1);
        levels.set(neighbor, newLevel);

        if (newInDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Position nodes
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, taskId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)?.push(taskId);
    });

    const nodeWidth = 200;
    const nodeHeight = 60;
    const horizontalSpacing = 100;
    const verticalSpacing = 100;

    const newNodes: Node[] = [];
    levelGroups.forEach((taskIds, level) => {
      taskIds.forEach((taskId, index) => {
        const task = filteredTasks.find(t => t.id === taskId);
        if (task) {
          newNodes.push({
            id: taskId,
            title: task.title,
            x: level * (nodeWidth + horizontalSpacing) + 50,
            y: index * (nodeHeight + verticalSpacing) + 50,
            level
          });
        }
      });
    });

    const newEdges: Edge[] = relevantDeps.map(dep => ({
      from: dep.dependsOnTaskId,
      to: dep.taskId,
      type: dep.dependencyType
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [tasks, dependencies, projectId]);

  useEffect(() => {
    if (!canvasRef.current || !nodes.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const maxX = Math.max(...nodes.map(n => n.x)) + 250;
    const maxY = Math.max(...nodes.map(n => n.y)) + 100;
    canvas.width = Math.max(maxX, 800);
    canvas.height = Math.max(maxY, 600);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x + 200, fromNode.y + 30);
        ctx.lineTo(toNode.x, toNode.y + 30);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x - 200);
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(toNode.x, toNode.y + 30);
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle - Math.PI / 6),
          toNode.y + 30 - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toNode.x, toNode.y + 30);
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle + Math.PI / 6),
          toNode.y + 30 - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node background
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, 200, 60, 8);
      ctx.fill();
      ctx.stroke();

      // Node text
      ctx.fillStyle = '#000';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Truncate text if too long
      const maxWidth = 180;
      let text = node.title;
      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text + '...').width > maxWidth && text.length > 0) {
          text = text.slice(0, -1);
        }
        text += '...';
      }
      
      ctx.fillText(text, node.x + 10, node.y + 30);
    });
  }, [nodes, edges]);

  if (!nodes.length) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>No task dependencies to visualize.</p>
          <p className="text-sm mt-2">Add dependencies to tasks to see the dependency graph.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Dependency Graph</h3>
        <p className="text-sm text-muted-foreground">
          Visual representation of task dependencies
        </p>
      </div>
      <div className="overflow-auto border rounded-lg bg-muted/20">
        <canvas ref={canvasRef} className="min-w-full" />
      </div>
    </Card>
  );
}
