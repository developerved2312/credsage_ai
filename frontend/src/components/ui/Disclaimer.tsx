import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Disclaimer: React.FC = () => (
  <div className="flex items-start gap-3 px-4 py-3 rounded border border-amber-200 bg-amber-50 text-sm text-text-secondary">
    <AlertTriangle size={15} className="text-risk-medium shrink-0 mt-0.5" strokeWidth={1.75} />
    <p>
      These recommendations and projections are generated for educational and demonstration purposes
      only, using simulated data. This is{' '}
      <span className="font-medium text-text-primary">not regulated financial advice.</span>
    </p>
  </div>
);

export default Disclaimer;
