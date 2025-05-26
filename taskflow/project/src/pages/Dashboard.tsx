import { useMemo } from 'react';
import { format, parseISO, isAfter, isBefore, startOfToday } from 'date-fns';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  List, 
  BarChart2, 
  Calendar,
  Plus,
  FolderKanban
} from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Component for stat cards
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`rounded-lg border bg-white p-6 shadow-sm transition-all`}
  >
    <div className="flex items-center">
      <div className={`mr-4 rounded-full ${color} p-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-semibold text-gray-900">{value}</h4>
      </div>
    </div>
  </motion.div>
);

// Component for upcoming tasks
const UpcomingTask = ({ 
  title, 
  dueDate, 
  projectName, 
  projectColor 
}: { 
  title: string; 
  dueDate: string; 
  projectName: string; 
  projectColor: string;
}) => (
  <motion.div 
    whileHover={{ x: 4 }}
    className="mb-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary-100"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <div className="flex items-center">
            <span 
              className="mr-2 inline-block h-2 w-2 rounded-full" 
              style={{ backgroundColor: projectColor }}
            ></span>
            <span className="text-xs text-gray-500">{projectName}</span>
          </div>
        </div>
      </div>
      <div>
        <span className="rounded-full bg-warning-50 px-2 py-1 text-xs font-medium text-warning-700">
          {format(parseISO(dueDate), 'MMM d')}
        </span>
      </div>
    </div>
  </motion.div>
);

// Component for project progress
const ProjectProgress = ({ 
  name, 
  color, 
  progress 
}: { 
  name: string; 
  color: string; 
  progress: number;
}) => (
  <div className="mb-4">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <span className="text-sm text-gray-500">{progress}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { tasks } = useTaskContext();
  const { projects } = useProjectContext();
  
  const stats = useMemo(() => {
    const today = startOfToday();
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const overdue = tasks.filter(
      task => !task.completed && isBefore(parseISO(task.due_date), today)
    ).length;
    const upcoming = tasks.filter(
      task => !task.completed && isAfter(parseISO(task.due_date), today)
    ).length;
    
    return { total, completed, overdue, upcoming };
  }, [tasks]);
  
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);
  
  // Get upcoming tasks (due within the next 7 days)
  const upcomingTasks = useMemo(() => {
    const today = startOfToday();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks
      .filter(task => 
        !task.completed && 
        isAfter(parseISO(task.due_date), today) && 
        isBefore(parseISO(task.due_date), nextWeek)
      )
      .sort((a, b) => {
        return parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime();
      })
      .slice(0, 5);
  }, [tasks]);
  
  // Calculate project progress
  const projectProgress = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const completedTasks = projectTasks.filter(task => task.completed).length;
      const progress = projectTasks.length 
        ? Math.round((completedTasks / projectTasks.length) * 100) 
        : 0;
      
      return {
        id: project.id,
        name: project.name,
        color: project.color,
        progress
      };
    });
  }, [projects, tasks]);
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back! Here's your productivity overview.</p>
        </div>
        <Link
          to="/tasks/new"
          className="mt-4 flex items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Link>
      </div>
      
      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Tasks" 
          value={stats.total} 
          icon={<List className="h-6 w-6 text-white" />} 
          color="bg-secondary-500"
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          icon={<CheckCircle className="h-6 w-6 text-white" />} 
          color="bg-success-500"
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdue} 
          icon={<AlertTriangle className="h-6 w-6 text-white" />} 
          color="bg-error-500"
        />
        <StatCard 
          title="Upcoming" 
          value={stats.upcoming} 
          icon={<Clock className="h-6 w-6 text-white" />} 
          color="bg-warning-500"
        />
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Completion rate */}
        <div className="col-span-1 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Completion Rate</h2>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-4 flex h-36 w-36 items-center justify-center rounded-full">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={completionRate > 75 ? '#22C55E' : completionRate > 40 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-bold">{completionRate}%</span>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600">
              {completionRate < 40 
                ? "You're falling behind. Let's focus on completing tasks!" 
                : completionRate < 75 
                  ? "Making good progress! Keep going." 
                  : "Excellent work! You're crushing your tasks."}
            </p>
          </div>
        </div>
        
        {/* Upcoming tasks */}
        <div className="col-span-1 rounded-lg border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-primary-500 hover:text-primary-600">
              View all
            </Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div>
              {upcomingTasks.map(task => {
                const project = projects.find(p => p.id === task.project_id);
                return (
                  <UpcomingTask
                    key={task.id}
                    title={task.title}
                    dueDate={task.due_date}
                    projectName={project?.name || 'No Project'}
                    projectColor={project?.color || '#CBD5E1'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
              <Calendar className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-center text-gray-500">No upcoming tasks for the next 7 days</p>
              <Link 
                to="/tasks/new" 
                className="mt-2 text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                Create a new task
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Project progress */}
      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
          <Link to="/projects" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View all projects
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projectProgress.length > 0 ? (
            projectProgress.map(project => (
              <ProjectProgress
                key={project.id}
                name={project.name}
                color={project.color}
                progress={project.progress}
              />
            ))
          ) : (
            <div className="col-span-2 flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
              <FolderKanban className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-center text-gray-500">No projects found</p>
              <Link 
                to="/projects" 
                className="mt-2 text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                Create a new project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;