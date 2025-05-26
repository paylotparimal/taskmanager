import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Calendar, CheckCircle2, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore, parseISO, startOfToday } from 'date-fns';
import { useTaskContext } from '../contexts/TaskContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { Priority, Task } from '../types';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

const TasksPage = () => {
  const { tasks, loading } = useTaskContext();
  const { projects } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active'>('all');
  const [filterProject, setFilterProject] = useState<number | 'all'>('all');
  const [filterDueDate, setFilterDueDate] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const openTaskForm = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const closeTaskForm = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const filteredTasks = useMemo(() => {
    if (loading) return [];

    const today = startOfToday();

    return tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // Status filter
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'active' && task.completed) return false;

      // Project filter
      if (filterProject !== 'all' && task.project_id !== filterProject) return false;

      // Due date filter
      if (filterDueDate === 'today') {
        const taskDate = parseISO(task.due_date);
        return format(taskDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      }
      
      if (filterDueDate === 'upcoming') {
        const taskDate = parseISO(task.due_date);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return isAfter(taskDate, today) && isBefore(taskDate, nextWeek);
      }
      
      if (filterDueDate === 'overdue') {
        return !task.completed && isBefore(parseISO(task.due_date), today);
      }

      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterStatus, filterProject, filterDueDate, loading]);

  const filterVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' }
  };

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: Priority.HIGH, label: 'High Priority' },
    { value: Priority.MEDIUM, label: 'Medium Priority' },
    { value: Priority.LOW, label: 'Low Priority' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Due Today' },
    { value: 'upcoming', label: 'Due This Week' },
    { value: 'overdue', label: 'Overdue' },
  ];

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
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Tasks</h1>
          <p className="mt-1 text-gray-500">Manage and organize your tasks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openTaskForm}
          className="mt-4 flex items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </motion.button>
      </div>

      {/* Search and filter bar */}
      <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilters 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
            {filteredTasks.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>
        </div>

        {/* Filter options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={filterVariants}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Tag className="mr-1 h-4 w-4" />
                      Priority
                    </div>
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Status
                    </div>
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'active')}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Due Date
                    </div>
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={filterDueDate}
                    onChange={(e) => setFilterDueDate(e.target.value as 'all' | 'today' | 'upcoming' | 'overdue')}
                  >
                    {dueDateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Project
                    </div>
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={filterProject === 'all' ? 'all' : filterProject}
                    onChange={(e) => setFilterProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      ) : (
        <TaskList tasks={filteredTasks} onEdit={handleEditTask} />
      )}

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
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;