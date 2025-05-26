import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Priority } from '../../types';
import { format, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Flag, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Circle 
} from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useProjectContext } from '../../contexts/ProjectContext';

interface TaskListProps {
  tasks: Task[];
  projectFilter?: number;
  onEdit?: (task: Task) => void;
}

const TaskList = ({ tasks, projectFilter, onEdit }: TaskListProps) => {
  const navigate = useNavigate();
  const { completeTask, deleteTask } = useTaskContext();
  const { projects } = useProjectContext();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const filteredTasks = useMemo(() => {
    if (projectFilter) {
      return tasks.filter(task => task.project_id === projectFilter);
    }
    return tasks;
  }, [tasks, projectFilter]);

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const toggleTaskCompletion = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    completeTask(taskId);
  };

  const handleEditTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
    setActiveMenu(null);
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    await deleteTask(taskId);
    setActiveMenu(null);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'text-error-500';
      case Priority.MEDIUM:
        return 'text-warning-500';
      case Priority.LOW:
        return 'text-success-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDueDateColor = (dueDate: string, completed: boolean) => {
    if (completed) return 'text-gray-400';
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) return 'text-error-500';
    if (isToday(new Date(dueDate))) return 'text-warning-500';
    return 'text-gray-500';
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getProjectColor = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.color : '#CBD5E1';
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <div className="mb-3 rounded-full bg-gray-100 p-3">
          <CheckCircle2 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-800">No tasks found</h3>
        <p className="text-gray-500">You have no tasks at the moment. Add a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-200">
        <AnimatePresence initial={false}>
          {filteredTasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative cursor-pointer ${
                task.completed ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => toggleTaskCompletion(e, task.id)}
                      className="focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`truncate text-sm font-medium ${
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      <div className="ml-2 flex flex-shrink-0 items-center space-x-1">
                        <Flag 
                          className={`h-4 w-4 ${getPriorityColor(task.priority)}`} 
                        />
                        {!projectFilter && (
                          <span
                            className="ml-1 h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: getProjectColor(task.project_id) }}
                          ></span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p className="truncate">
                          {task.description && task.description.length > 60
                            ? `${task.description.substring(0, 60)}...`
                            : task.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs">
                        <Clock className={`mr-1 h-3.5 w-3.5 ${getDueDateColor(task.due_date, task.completed)}`} />
                        <span className={getDueDateColor(task.due_date, task.completed)}>
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                        
                        {!projectFilter && (
                          <span className="ml-3 text-gray-500">
                            {getProjectName(task.project_id)}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === task.id ? null : task.id);
                          }}
                          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === task.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => handleEditTask(e, task)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Task
                              </button>
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={(e) => handleDeleteTask(e, task.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default TaskList;