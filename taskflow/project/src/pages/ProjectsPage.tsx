import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectContext } from '../contexts/ProjectContext';
import { Project } from '../types';
import ProjectForm from '../components/projects/ProjectForm';

const ProjectsPage = () => {
  const { projects, loading, deleteProject } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const openProjectForm = () => {
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
    setActiveMenu(null);
  };

  const closeProjectForm = () => {
    setIsFormOpen(false);
    setProjectToEdit(null);
  };

  const handleDeleteProject = async (projectId: number) => {
    await deleteProject(projectId);
    setActiveMenu(null);
  };

  const toggleMenu = (projectId: number) => {
    setActiveMenu(activeMenu === projectId ? null : projectId);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Projects</h1>
          <p className="mt-1 text-gray-500">Manage and organize your projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openProjectForm}
          className="mt-4 flex items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </motion.button>
      </div>

      {/* Search bar */}
      <div className="mt-6 mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
              >
                <div 
                  className="h-3" 
                  style={{ backgroundColor: project.color }}
                ></div>
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Link to={`/projects/${project.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                        {project.name}
                      </h3>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(project.id)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === project.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                          >
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEditProject(project)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Project
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <p className="mb-4 text-gray-600">{project.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderKanban className="mr-2 h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Created {project.created_at}
                      </span>
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
              <FolderKanban className="mb-3 h-12 w-12 text-gray-400" />
              <h3 className="mb-1 text-lg font-medium text-gray-800">No projects found</h3>
              <p className="mb-4 text-gray-500">
                {searchQuery ? 'No projects match your search criteria' : 'You have no projects yet'}
              </p>
              <button
                onClick={openProjectForm}
                className="flex items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Project form modal */}
      <AnimatePresence>
        {isFormOpen && (
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
                project={projectToEdit} 
                onClose={closeProjectForm} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;