import { format, formatDistanceToNow } from 'date-fns';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM d, yyyy');
};

// Format datetime
export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Get score category color
export const getScoreCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Excellent: 'text-green-600 bg-green-100',
    'Very Good': 'text-blue-600 bg-blue-100',
    Good: 'text-cyan-600 bg-cyan-100',
    Fair: 'text-yellow-600 bg-yellow-100',
    Poor: 'text-red-600 bg-red-100',
  };
  return colors[category] || 'text-gray-600 bg-gray-100';
};

// Get risk level color
export const getRiskLevelColor = (riskLevel: string): string => {
  const colors: Record<string, string> = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };
  return colors[riskLevel.toLowerCase()] || 'text-gray-600 bg-gray-100';
};

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
