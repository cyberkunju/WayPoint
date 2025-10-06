import { useEffect, useRef } from 'react';
import { useTaskStore } from './use-store';
import { sampleTasks, sampleProjects, sampleLabels } from '../lib/sample-data';

export function useInitializeData() {
  const { tasks, projects, labels, addTask, addProject, addLabel } = useTaskStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    
    // Wait for all data to be loaded from useKV (even if empty)
    if (tasks === undefined || projects === undefined || labels === undefined) {
      return;
    }

    const tasksArray = tasks || [];
    const projectsArray = projects || [];
    const labelsArray = labels || [];
    
    // Only initialize if no data exists
    const hasAnyData = tasksArray.length > 0 || projectsArray.length > 0 || labelsArray.length > 0;
    
    if (!hasAnyData) {
      try {
        // Add projects first
        sampleProjects.forEach(project => {
          addProject(project);
        });
        
        // Add labels
        sampleLabels.forEach(label => {
          addLabel(label);
        });
        
        // Add tasks
        sampleTasks.forEach(task => {
          addTask(task);
        });
        
        hasInitialized.current = true;
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    } else {
      hasInitialized.current = true;
    }
  }, [tasks, projects, labels, addTask, addProject, addLabel]);
}