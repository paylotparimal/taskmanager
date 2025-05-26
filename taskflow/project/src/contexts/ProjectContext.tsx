import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { Project } from '../types';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<Project | null>;
  updateProject: (id: number, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: number) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock projects for initial development (will be replaced with API)
  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding',
      color: '#0D9488',
      created_at: format(new Date(2025, 4, 15), 'yyyy-MM-dd'),
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Create a new mobile application for customer engagement',
      color: '#4F46E5',
      created_at: format(new Date(2025, 4, 20), 'yyyy-MM-dd'),
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      description: 'Q3 marketing campaign for product launch',
      color: '#F59E0B',
      created_at: format(new Date(2025, 4, 25), 'yyyy-MM-dd'),
    },
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // For development, using mock data until backend is connected
      // const response = await api.get('/projects');
      // setProjects(response.data);
      setProjects(mockProjects);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'created_at'>) => {
    try {
      // For development, using mock logic until backend is connected
      // const response = await api.post('/projects', project);
      // const newProject = response.data;
      const newProject: Project = {
        ...project,
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        created_at: format(new Date(), 'yyyy-MM-dd'),
      };
      setProjects([...projects, newProject]);
      toast.success('Project created successfully');
      return newProject;
    } catch (err) {
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: number, projectUpdate: Partial<Project>) => {
    try {
      // For development, using mock logic until backend is connected
      // await api.put(`/projects/${id}`, projectUpdate);
      setProjects(projects.map(project => 
        project.id === id ? { ...project, ...projectUpdate } : project
      ));
      toast.success('Project updated successfully');
      return true;
    } catch (err) {
      toast.error('Failed to update project');
      return false;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      // For development, using mock logic until backend is connected
      // await api.delete(`/projects/${id}`);
      setProjects(projects.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete project');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};