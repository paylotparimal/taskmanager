import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { TaskProvider } from './contexts/TaskContext';
import { ProjectProvider } from './contexts/ProjectContext';

function App() {
  return (
    <Router>
      <TaskProvider>
        <ProjectProvider>
          <Layout>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                }
              }}
            />
          </Layout>
        </ProjectProvider>
      </TaskProvider>
    </Router>
  );
}

export default App;