import type { Project } from '@/services/project.service';
import type { Epic } from '@/services/epic.service';
import type { TaskDependency } from '@/services/task-dependencies.service';
import type { Task } from '@/services/task.service';

export type RoadmapItem = {
  id: string;
  type: 'project' | 'epic';
  startDate: string | undefined;
  endDate: string | undefined;
};

export type RoadmapDependency = {
  from: string; // ID of the project or epic that has a dependency
  to: string;   // ID of the project or epic it depends on
};

export function inferRoadmapDependencies(
  projects: Project[],
  epics: Epic[],
  tasks: Task[],
  taskDependencies: TaskDependency[]
): RoadmapDependency[] {
  const taskToRoadmapItem = new Map<string, string>();

  tasks.forEach(task => {
    if (task.projectId) {
      taskToRoadmapItem.set(task.$id, `project-${task.projectId}`);
    } else if (task.epicId) {
      taskToRoadmapItem.set(task.$id, `epic-${task.epicId}`);
    }
  });

  const roadmapDependencies = new Map<string, RoadmapDependency>();

  taskDependencies.forEach(dep => {
    const fromItem = taskToRoadmapItem.get(dep.taskId);
    const toItem = taskToRoadmapItem.get(dep.dependsOnTaskId);

    if (fromItem && toItem && fromItem !== toItem) {
      const key = `${fromItem}->${toItem}`;
      if (!roadmapDependencies.has(key)) {
        roadmapDependencies.set(key, { from: fromItem, to: toItem });
      }
    }
  });

  return Array.from(roadmapDependencies.values());
}
