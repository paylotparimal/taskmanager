export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
  completed: boolean;
  project_id: number;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  upcoming: number;
}

export interface ProjectStats {
  total: number;
  tasksCount: number;
  completionRate: number;
}