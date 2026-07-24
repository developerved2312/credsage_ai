import { format, formatDistanceToNow } from 'date-fns';

// Format currency (USD)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format Indian Rupees
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

// Get score category Tailwind classes (aligned with design system tokens)
export const getScoreCategoryColor = (category: string): string => {
  const classes: Record<string, string> = {
    Excellent: 'text-risk-low bg-green-50',
    'Very Good': 'text-risk-low bg-green-50',
    Good: 'text-risk-low bg-green-50',
    Fair: 'text-risk-medium bg-amber-50',
    Poor: 'text-risk-high bg-red-50',
  };
  return classes[category] || 'text-text-secondary bg-gray-100';
};

// Get risk level Tailwind classes (aligned with design system tokens)
export const getRiskLevelColor = (riskLevel: string): string => {
  const classes: Record<string, string> = {
    low: 'text-risk-low bg-green-50',
    medium: 'text-risk-medium bg-amber-50',
    high: 'text-risk-high bg-red-50',
  };
  return classes[riskLevel.toLowerCase()] || 'text-text-secondary bg-gray-100';
};

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
