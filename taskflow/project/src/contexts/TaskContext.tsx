import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { Task, Priority } from '../types';
import api from '../services/api';
import toast from 'react-hot-toast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<Task | null>;
  updateTask: (id: number, task: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: number) => Promise<boolean>;
  completeTask: (id: number) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock tasks for initial development (will be replaced with API)
  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Complete project proposal',
      description: 'Write and submit the project proposal with budget estimates',
      priority: Priority.HIGH,
      due_date: format(new Date(2025, 5, 15), 'yyyy-MM-dd'),
      completed: false,
      project_id: 1,
      created_at: format(new Date(2025, 5, 1), 'yyyy-MM-dd'),
    },
    {
      id: 2,
      title: 'Set up development environment',
      description: 'Install necessary tools and configure the development environment',
      priority: Priority.MEDIUM,
      due_date: format(new Date(2025, 5, 10), 'yyyy-MM-dd'),
      completed: true,
      project_id: 1,
      created_at: format(new Date(2025, 5, 2), 'yyyy-MM-dd'),
    },
    {
      id: 3,
      title: 'Design user interface mockups',
      description: 'Create wireframes and mockups for the application',
      priority: Priority.HIGH,
      due_date: format(new Date(2025, 5, 20), 'yyyy-MM-dd'),
      completed: false,
      project_id: 2,
      created_at: format(new Date(2025, 5, 3), 'yyyy-MM-dd'),
    },
    {
      id: 4,
      title: 'Research competitor products',
      description: 'Analyze similar products in the market',
      priority: Priority.LOW,
      due_date: format(new Date(2025, 5, 25), 'yyyy-MM-dd'),
      completed: false,
      project_id: 2,
      created_at: format(new Date(2025, 5, 4), 'yyyy-MM-dd'),
    },
    {
      id: 5,
      title: 'Schedule team meeting',
      description: 'Coordinate with team members for weekly sync-up',
      priority: Priority.MEDIUM,
      due_date: format(new Date(2025, 5, 8), 'yyyy-MM-dd'),
      completed: false,
      project_id: 1,
      created_at: format(new Date(2025, 5, 5), 'yyyy-MM-dd'),
    },
  ];

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // For development, using mock data until backend is connected
      // const response = await api.get('/tasks');
      // setTasks(response.data);
      setTasks(mockTasks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    try {
      // For development, using mock logic until backend is connected
      // const response = await api.post('/tasks', task);
      // const newTask = response.data;
      const newTask: Task = {
        ...task,
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        created_at: format(new Date(), 'yyyy-MM-dd'),
      };
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully');
      return newTask;
    } catch (err) {
      toast.error('Failed to add task');
      return null;
    }
  };

  const updateTask = async (id: number, taskUpdate: Partial<Task>) => {
    try {
      // For development, using mock logic until backend is connected
      // await api.put(`/tasks/${id}`, taskUpdate);
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...taskUpdate } : task
      ));
      toast.success('Task updated successfully');
      return true;
    } catch (err) {
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      // For development, using mock logic until backend is connected
      // await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete task');
      return false;
    }
  };

  const completeTask = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return false;
      
      // For development, using mock logic until backend is connected
      // await api.put(`/tasks/${id}`, { completed: !task.completed });
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
      return true;
    } catch (err) {
      toast.error('Failed to update task status');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};