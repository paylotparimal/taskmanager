import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Project } from '../../types';
import { useProjectContext } from '../../contexts/ProjectContext';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
}

const ProjectForm = ({ project, onClose }: ProjectFormProps) => {
  const { addProject, updateProject } = useProjectContext();
  const isEditing = !!project;
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      color: project?.color || '#0D9488',
    }
  });
  
  const [selectedColor, setSelectedColor] = useState(project?.color || '#0D9488');
  
  const colorOptions = [
    { value: '#0D9488', name: 'Teal' },
    { value: '#4F46E5', name: 'Indigo' },
    { value: '#F59E0B', name: 'Amber' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#6366F1', name: 'Violet' },
    { value: '#EF4444', name: 'Red' },
    { value: '#3B82F6', name: 'Blue' },
  ];

  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('description', project.description);
      setValue('color', project.color);
      setSelectedColor(project.color);
    }
  }, [project, setValue]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && project) {
        await updateProject(project.id, data);
      } else {
        await addProject(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Project Name *
          </label>
          <input
            id="name"
            type="text"
            className={`block w-full rounded-lg border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
            placeholder="Enter project name"
            {...register('name', { required: 'Project name is required' })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message?.toString()}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Enter project description"
            {...register('description')}
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Project Color
          </label>
          <input
            type="hidden"
            {...register('color')}
            value={selectedColor}
          />
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`h-8 w-8 rounded-full border-2 ${
                  selectedColor === color.value ? 'border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:bg-primary-300"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;