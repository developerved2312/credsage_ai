import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 20,
  className = '',
  fullPage = false,
}) => {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 size={size} className={`animate-spin text-primary ${className}`} />
      </div>
    );
  }
  return <Loader2 size={size} className={`animate-spin text-primary ${className}`} />;
};

export default LoadingSpinner;
