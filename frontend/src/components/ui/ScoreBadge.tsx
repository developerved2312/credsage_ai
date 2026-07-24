import React from 'react';

type RiskLevel = 'low' | 'medium' | 'high';

const categoryToRisk: Record<string, RiskLevel> = {
  Excellent: 'low',
  'Very Good': 'low',
  Good: 'low',
  Fair: 'medium',
  Poor: 'high',
};

const riskClasses: Record<RiskLevel, string> = {
  low: 'badge badge-low',
  medium: 'badge badge-medium',
  high: 'badge badge-high',
};

interface ScoreBadgeProps {
  category: string;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ category }) => {
  const risk = categoryToRisk[category] ?? 'medium';
  return <span className={riskClasses[risk]}>{category}</span>;
};

export default ScoreBadge;
