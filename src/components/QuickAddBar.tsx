import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, CalendarBlank, Tag, User, Hash, Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { parseNaturalLanguage } from '../lib/utils-tasks';
import { useTaskStore } from '../hooks/use-store';
import { toast } from 'sonner';

export const QuickAddBar = memo(function QuickAddBar() {
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const { addTask } = useTaskStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const parsed = useMemo(() => parseNaturalLanguage(input), [input]);

  // Check for speech recognition support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecordingSupported(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          toast.success('Voice captured successfully!');
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast.error('Voice recognition failed. Please try again.');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startVoiceRecording = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        toast.info('Listening... Speak your task now.');
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        toast.error('Could not start voice recognition.');
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const taskData = {
        title: parsed.title,
        description: undefined,
        priority: (parsed.priority || 4) as 1 | 2 | 3 | 4,
        dueDate: parsed.dueDate,
        projectId: parsed.projectId,
        labels: parsed.labels,
        assignee: parsed.assignee,
      };
      
      const addedTask = addTask(taskData);
      
      setInput('');
      setShowPreview(false);
      
      toast.success('Task created successfully!');
      
      // Add highlight animation
      setTimeout(() => {
        const element = document.querySelector(`[data-task-id="${addedTask.id}"]`);
        if (element) {
          element.classList.add('highlight-fade');
        }
      }, 100);
    }
  };

  useEffect(() => {
    setShowPreview(input.length > 0);
  }, [input]);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border pb-4 mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
          <Plus size={20} className="text-muted-foreground ml-3" />
          <Input
            ref={inputRef}
            placeholder="Add a task... Try 'Buy groceries tomorrow #personal !p2 +shopping' or use voice 🎤"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="pl-2 text-base"
            aria-label="Add new task input"
            aria-describedby={showPreview ? "task-preview" : undefined}
          />
          
          {/* Voice Recording Button */}
          {isRecordingSupported && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={isListening ? stopVoiceRecording : startVoiceRecording}
              disabled={isListening}
              className="px-3"
            >
              {isListening ? (
                <MicrophoneSlash size={16} className="animate-pulse" />
              ) : (
                <Microphone size={16} />
              )}
            </Button>
          )}
          
          <Button type="submit" disabled={!input.trim()}>
            Add Task
          </Button>
        </div>

        {showPreview && input.trim() && (
          <div 
            id="task-preview"
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-20"
            role="region"
            aria-label="Task preview"
          >
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Task: </span>
                <span className="font-medium">{parsed.title}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {parsed.projectId && (
                  <Badge variant="outline" className="gap-1">
                    <Hash size={12} />
                    {parsed.projectId}
                  </Badge>
                )}
                
                {parsed.labels.map((label) => (
                  <Badge key={label} variant="outline" className="gap-1">
                    <Tag size={12} />
                    {label}
                  </Badge>
                ))}
                
                {parsed.priority && parsed.priority < 4 && (
                  <Badge variant="outline" className={`gap-1 ${
                    parsed.priority === 1 ? 'border-red-500 text-red-500' :
                    parsed.priority === 2 ? 'border-orange-500 text-orange-500' :
                    'border-blue-500 text-blue-500'
                  }`}>
                    P{parsed.priority}
                  </Badge>
                )}
                
                {parsed.dueDate && (
                  <Badge variant="outline" className="gap-1">
                    <CalendarBlank size={12} />
                    {parsed.dueDate}
                  </Badge>
                )}
                
                {parsed.assignee && (
                  <Badge variant="outline" className="gap-1">
                    <User size={12} />
                    {parsed.assignee}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
});