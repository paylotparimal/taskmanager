import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  CheckSquare, 
  FolderKanban, 
  Calendar, 
  BarChart2, 
  Settings, 
  X, 
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <ClipboardList className="h-7 w-7 text-primary-500" />
          <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
        </Link>
        <button
          onClick={closeSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={`group relative flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                active
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-primary-500 rounded-r-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  active ? 'text-primary-500' : 'text-gray-500 group-hover:text-gray-900'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          to="/settings"
          onClick={closeSidebar}
          className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-500" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;