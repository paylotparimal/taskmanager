import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Edit2, 
  Plus, 
  Trash2, 
  BarChart2,
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isAfter, isBefore, startOfToday } from 'date-fns';
import { useProjectContext } from '../contexts/ProjectContext';
import { useTaskContext } from '../contexts/TaskContext';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import ProjectForm from '../components/projects/ProjectForm';
import { Task } from '../types';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjectContext();
  const { tasks } = useTaskContext();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const project = useMemo(() => 
    projects.find(p => p.id === Number(projectId)), 
    [projects, projectId]
  );

  const projectTasks = useMemo(() => 
    tasks.filter(task => task.project_id === Number(projectId)),
    [tasks, projectId]
  );

  const stats = useMemo(() => {
    const today = startOfToday();
    const completed = projectTasks.filter(task => task.completed).length;
    const total = projectTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const overdue = projectTasks.filter(
      task => !task.completed && isBefore(parseISO(task.due_date), today)
    ).length;
    
    const upcoming = projectTasks.filter(
      task => !task.completed && isAfter(parseISO(task.due_date), today)
    ).length;
    
    return { total, completed, completionRate, overdue, upcoming };
  }, [projectTasks]);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Project not found</h2>
          <p className="mb-6 text-gray-500">The project you're looking for doesn't exist or has been removed</p>
          <Link 
            to="/projects" 
            className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const openTaskForm = () => {
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const closeTaskForm = () => {
    setIsTaskFormOpen(false);
    setTaskToEdit(null);
  };

  const openProjectForm = () => {
    setIsProjectFormOpen(true);
  };

  const closeProjectForm = () => {
    setIsProjectFormOpen(false);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteProject = async () => {
    const success = await deleteProject(project.id);
    if (success) {
      navigate('/projects');
    }
  };

  const formContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="container mx-auto">
      {/* Project header */}
      <div>
        <div className="mb-6 flex items-center">
          <Link 
            to="/projects" 
            className="mr-4 flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="mb-8 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center">
            <div 
              className="mr-4 h-12 w-3 rounded-full" 
              style={{ backgroundColor: project.color }}
            ></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{project.name}</h1>
              <p className="text-gray-500">{project.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openProjectForm}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openDeleteConfirm}
              className="flex items-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </motion.button>
          </div>
        </div>
      </div>

      {/* Project stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-primary-100 p-2">
              <CheckCircle2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-secondary-100 p-2">
              <BarChart2 className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-success-100 p-2">
              <CheckCircle2 className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-error-100 p-2">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tasks section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Project Tasks</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openTaskForm}
            className="flex items-center rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </motion.button>
        </div>
        
        <div className="mt-4">
          <TaskList 
            tasks={projectTasks} 
            projectFilter={project.id} 
            onEdit={handleEditTask}
          />
        </div>
      </div>

      {/* Created date */}
      <div className="mb-8 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center">
          <Calendar className="mr-1.5 h-4 w-4" />
          <span>Project created on {project.created_at}</span>
        </div>
      </div>

      {/* Task form modal */}
      <AnimatePresence>
        {isTaskFormOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={closeTaskForm}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl rounded-t-xl bg-white p-6 shadow-lg sm:bottom-auto sm:top-1/2 sm:w-full sm:-translate-y-1/2 sm:rounded-xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formContainerVariants}
            >
              <TaskForm 
                task={taskToEdit} 
                onClose={closeTaskForm}
                defaultProjectId={project.id}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Project form modal */}
      <AnimatePresence>
        {isProjectFormOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={closeProjectForm}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-xl bg-white p-6 shadow-lg sm:bottom-auto sm:top-1/2 sm:w-full sm:-translate-y-1/2 sm:rounded-xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formContainerVariants}
            >
              <ProjectForm 
                project={project} 
                onClose={closeProjectForm} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={closeDeleteConfirm}
            />
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formContainerVariants}
            >
              <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Delete Project</h3>
                  <p className="text-gray-500">
                    Are you sure you want to delete this project? This action cannot be undone and will also delete all tasks associated with this project.
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteConfirm}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;