import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Task, Priority } from '../../types';
import { useTaskContext } from '../../contexts/TaskContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { format } from 'date-fns';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  defaultProjectId?: number;
}

const TaskForm = ({ task, onClose, defaultProjectId }: TaskFormProps) => {
  const { addTask, updateTask } = useTaskContext();
  const { projects } = useProjectContext();
  const isEditing = !!task;
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || Priority.MEDIUM,
      due_date: task?.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      project_id: task?.project_id || defaultProjectId || (projects.length > 0 ? projects[0].id : 1),
    }
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description);
      setValue('priority', task.priority);
      setValue('due_date', format(new Date(task.due_date), 'yyyy-MM-dd'));
      setValue('project_id', task.project_id);
    } else if (defaultProjectId) {
      setValue('project_id', defaultProjectId);
    }
  }, [task, defaultProjectId, setValue]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          ...data,
          project_id: Number(data.project_id),
        });
      } else {
        await addTask({
          ...data,
          completed: false,
          project_id: Number(data.project_id),
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Task' : 'Create New Task'}
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
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            className={`block w-full rounded-lg border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
            placeholder="Enter task title"
            {...register('title', { required: 'Task title is required' })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message?.toString()}</p>
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
            placeholder="Enter task description"
            {...register('description')}
          ></textarea>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              {...register('priority')}
            >
              <option value={Priority.LOW}>Low</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.HIGH}>High</option>
            </select>
          </div>

          <div>
            <label htmlFor="due_date" className="mb-1 block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              id="due_date"
              type="date"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              {...register('due_date', { required: 'Due date is required' })}
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600">{errors.due_date.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="project_id" className="mb-1 block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            id="project_id"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            {...register('project_id')}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;