import { useState, useEffect } from 'react';
import { X, Calendar, Target, Flag } from '@phosphor-icons/react';
import { sprintService, type Sprint, type CreateSprintData, type UpdateSprintData } from '@/services/sprint.service';

interface SprintFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  projectId?: string;
  sprint?: Sprint | null;
}

export function SprintFormDialog({
  isOpen,
  onClose,
  onSuccess,
  userId,
  projectId,
  sprint
}: SprintFormDialogProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    goals: string;
    status: 'planning' | 'active' | 'completed' | 'cancelled';
  }>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    goals: '',
    status: 'planning'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        description: sprint.description || '',
        startDate: sprint.startDate.split('T')[0],
        endDate: sprint.endDate.split('T')[0],
        goals: sprint.goals || '',
        status: sprint.status
      });
    } else {
      // Set default dates (2 weeks from today)
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      
      setFormData({
        name: '',
        description: '',
        startDate: today.toISOString().split('T')[0],
        endDate: twoWeeksLater.toISOString().split('T')[0],
        goals: '',
        status: 'planning'
      });
    }
  }, [sprint, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        setError('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      if (sprint) {
        // Update existing sprint
        const updateData: UpdateSprintData = {
          name: formData.name,
          description: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          goals: formData.goals,
          status: formData.status
        };
        await sprintService.updateSprint(sprint.$id, updateData);
      } else {
        // Create new sprint
        const createData: CreateSprintData = {
          userId,
          projectId,
          name: formData.name,
          description: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          goals: formData.goals,
          status: formData.status
        };
        await sprintService.createSprint(createData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving sprint:', err);
      setError('Failed to save sprint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {sprint ? 'Edit Sprint' : 'Create New Sprint'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sprint Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 1, Q1 Sprint, Feature Release Sprint"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this sprint aims to achieve..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag size={16} className="inline mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Sprint Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target size={16} className="inline mr-1" />
              Sprint Goals
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="What are the key objectives for this sprint?"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Status (only show for existing sprints) */}
          {sprint && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : sprint ? 'Update Sprint' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
