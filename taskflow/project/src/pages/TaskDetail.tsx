import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Flag, 
  Edit2, 
  Trash2, 
  CheckSquare,
  ClockIcon,
  FolderKanban
} from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskContext } from '../contexts/TaskContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { Priority } from '../types';
import TaskForm from '../components/tasks/TaskForm';

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, completeTask, deleteTask } = useTaskContext();
  const { projects } = useProjectContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const task = useMemo(() => 
    tasks.find(t => t.id === Number(taskId)), 
    [tasks, taskId]
  );

  const project = useMemo(() => 
    task ? projects.find(p => p.id === task.project_id) : null, 
    [task, projects]
  );

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Task not found</h2>
          <p className="mb-6 text-gray-500">The task you're looking for doesn't exist or has been removed</p>
          <Link 
            to="/tasks" 
            className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-error-500 text-white';
      case Priority.MEDIUM:
        return 'bg-warning-500 text-white';
      case Priority.LOW:
        return 'bg-success-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'High';
      case Priority.MEDIUM:
        return 'Medium';
      case Priority.LOW:
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  const getDueDateClass = () => {
    if (task.completed) return 'text-gray-500';
    if (isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))) return 'text-error-600';
    if (isToday(parseISO(task.due_date))) return 'text-warning-600';
    return 'text-gray-700';
  };

  const handleTaskToggle = async () => {
    await completeTask(task.id);
  };

  const openEditForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteTask = async () => {
    const success = await deleteTask(task.id);
    if (success) {
      navigate('/tasks');
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
      {/* Task header */}
      <div>
        <div className="mb-6 flex items-center">
          <Link 
            to="/tasks" 
            className="mr-4 flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-start sm:space-y-0">
            <div className="flex-1">
              <div className="mb-4 flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTaskToggle}
                  className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  {task.completed ? (
                    <CheckSquare className="h-5 w-5 text-primary-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-sm border border-gray-400" />
                  )}
                </motion.button>
                <h1 className={`text-xl font-bold text-gray-900 sm:text-2xl ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h1>
              </div>
              
              <div className="mb-6 text-gray-700">
                <p>{task.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Priority badge */}
                <div className="flex items-center rounded-full border border-gray-200 px-3 py-1">
                  <Flag className="mr-2 h-4 w-4 text-gray-500" />
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                
                {/* Due date */}
                <div className="flex items-center rounded-full border border-gray-200 px-3 py-1">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${getDueDateClass()}`}>
                    {format(parseISO(task.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {/* Project badge */}
                {project && (
                  <div className="flex items-center rounded-full border border-gray-200 px-3 py-1">
                    <FolderKanban className="mr-2 h-4 w-4 text-gray-500" />
                    <div className="flex items-center">
                      <span 
                        className="mr-1.5 inline-block h-2 w-2 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      ></span>
                      <Link to={`/projects/${project.id}`} className="text-sm text-primary-600 hover:underline">
                        {project.name}
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Created date */}
                <div className="flex items-center rounded-full border border-gray-200 px-3 py-1">
                  <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Created {format(parseISO(task.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 sm:ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openEditForm}
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
      </div>

      {/* Task status */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Task Status</h2>
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
            <div 
              className={`h-full rounded-full ${task.completed ? 'bg-success-500' : 'bg-primary-500'}`}
              style={{ width: task.completed ? '100%' : '50%' }}
            ></div>
          </div>
          <div className="text-center">
            <span className={`text-lg font-medium ${task.completed ? 'text-success-600' : 'text-primary-600'}`}>
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
            <p className="text-sm text-gray-500">
              {task.completed 
                ? 'This task has been marked as complete' 
                : 'This task is currently in progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Task form modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={closeForm}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl rounded-t-xl bg-white p-6 shadow-lg sm:bottom-auto sm:top-1/2 sm:w-full sm:-translate-y-1/2 sm:rounded-xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formContainerVariants}
            >
              <TaskForm 
                task={task} 
                onClose={closeForm} 
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Delete Task</h3>
                  <p className="text-gray-500">
                    Are you sure you want to delete this task? This action cannot be undone.
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
                    onClick={handleDeleteTask}
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

export default TaskDetail;