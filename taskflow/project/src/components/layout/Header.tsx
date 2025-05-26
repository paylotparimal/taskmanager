import { ReactNode } from 'react';
import { Bell, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (true) {
      case location.pathname === '/':
        return 'Dashboard';
      case location.pathname === '/tasks':
        return 'Tasks';
      case location.pathname.startsWith('/tasks/'):
        return 'Task Details';
      case location.pathname === '/projects':
        return 'Projects';
      case location.pathname.startsWith('/projects/'):
        return 'Project Details';
      default:
        return 'TaskFlow';
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center">
        {children}
        <h1 className="ml-2 text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Bell size={20} />
        </button>
        <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Settings size={20} />
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <span className="font-medium text-sm">AB</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;