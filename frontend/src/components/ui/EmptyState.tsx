import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-text-secondary" strokeWidth={1.5} />
      </div>
    )}
    <p className="text-sm font-medium text-text-primary">{title}</p>
    {description && <p className="text-sm text-text-secondary mt-1 max-w-xs">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="btn btn-primary mt-4">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
