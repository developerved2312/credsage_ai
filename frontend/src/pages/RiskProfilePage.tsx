import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: number; sub?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'goal',
    text: 'What is your primary investment goal?',
    options: [
      { label: 'Preserve my money (low growth, low risk)', value: 1 },
      { label: 'Steady growth over time', value: 2 },
      { label: 'Maximize long-term returns', value: 3 },
    ],
  },
  {
    id: 'horizon',
    text: 'How long do you plan to keep this money invested?',
    options: [
      { label: 'Less than 1 year', value: 1 },
      { label: '1–3 years', value: 2 },
      { label: '3–5 years', value: 3 },
      { label: '5+ years', value: 4 },
    ],
  },
  {
    id: 'loss_reaction',
    text: 'If your investment fell 20% in value next month, you would:',
    options: [
      { label: 'Withdraw everything immediately', value: 1 },
      { label: 'Feel anxious but hold', value: 2 },
      { label: 'Hold — it will recover eventually', value: 3 },
      { label: 'Invest more at the lower price', value: 4 },
    ],
  },
  {
    id: 'income_stability',
    text: 'How stable is your monthly income?',
    options: [
      { label: 'Very unstable — irregular work', value: 1 },
      { label: 'Somewhat stable — varies month to month', value: 2 },
      { label: 'Stable — salaried / regular gig income', value: 3 },
    ],
  },
  {
    id: 'savings',
    text: 'Do you have an emergency fund (3–6 months of expenses)?',
    options: [
      { label: 'No — I live month to month', value: 1 },
      { label: 'Partially — 1–2 months saved', value: 2 },
      { label: 'Yes — 3+ months saved', value: 3 },
    ],
  },
  {
    id: 'experience',
    text: 'What is your prior investment experience?',
    options: [
      { label: 'None — completely new to investing', value: 1 },
      { label: 'Some — I have a savings account / FD', value: 2 },
      { label: "Moderate — I've tried mutual funds or SIPs", value: 3 },
      { label: 'Active — I manage stocks or crypto regularly', value: 4 },
    ],
  },
  {
    id: 'amount',
    text: 'How much can you invest per month?',
    options: [
      { label: '₹500', value: 500, sub: 'Great start' },
      { label: '₹1,000', value: 1000 },
      { label: '₹2,000', value: 2000 },
      { label: '₹5,000', value: 5000, sub: 'Power investor' },
    ],
  },
  {
    id: 'age',
    text: 'Which age bracket are you in?',
    options: [
      { label: 'Under 25', value: 4 },
      { label: '25–35', value: 3 },
      { label: '35–50', value: 2 },
      { label: '50+', value: 1 },
    ],
  },
];

// The last question is for amount — extract its value separately
const SCORING_QUESTIONS = QUESTIONS.filter((q) => q.id !== 'amount' && q.id !== 'horizon');
const MAX_SCORE = SCORING_QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.value)), 0);

function computeRiskTolerance(answers: Record<string, number>): 'low' | 'medium' | 'high' {
  const score = SCORING_QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  const pct = score / MAX_SCORE;
  if (pct < 0.4) return 'low';
  if (pct < 0.7) return 'medium';
  return 'high';
}

function computeHorizon(horizonValue: number): 'short' | 'medium' | 'long' {
  if (horizonValue <= 1) return 'short';
  if (horizonValue <= 3) return 'medium';
  return 'long';
}

export interface RiskProfile {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentHorizon: 'short' | 'medium' | 'long';
  investmentAmount: number;
  horizonYears: number;
}

const RiskProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;
  const isLast = currentIndex === total - 1;
  const selected = answers[currentQuestion.id];
  const progress = ((currentIndex + 1) / total) * 100;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!selected && selected !== 0) return;
    if (isLast) {
      // Compute profile
      const horizonVal = answers['horizon'] ?? 2;
      const profile: RiskProfile = {
        riskTolerance: computeRiskTolerance(answers),
        investmentHorizon: computeHorizon(horizonVal),
        investmentAmount: answers['amount'] ?? 1000,
        horizonYears:
          horizonVal === 1 ? 1 : horizonVal === 2 ? 2 : horizonVal === 3 ? 4 : 7,
      };
      // Navigate to recommendations with profile state
      navigate('/investment/recommendations', { state: { profile } });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Risk Profile</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Answer a few questions so we can match you with the right investments.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="card space-y-5">
        <h2 className="text-base font-medium text-text-primary leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="space-y-2">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt.value}
              id={`option-${currentQuestion.id}-${opt.value}`}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-4 py-3 rounded border text-sm transition-colors ${
                selected === opt.value
                  ? 'border-primary bg-green-50 text-text-primary font-medium'
                  : 'border-border-color bg-surface text-text-secondary hover:border-primary hover:bg-green-50'
              }`}
            >
              <span className="block font-medium text-text-primary">{opt.label}</span>
              {opt.sub && (
                <span className="block text-xs text-text-secondary mt-0.5">{opt.sub}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="btn btn-secondary disabled:opacity-40"
        >
          <ChevronLeft size={15} />
          Back
        </button>
        <button
          id="next-question-btn"
          onClick={handleNext}
          disabled={selected === undefined}
          className="btn btn-primary disabled:opacity-40"
        >
          {isLast ? 'See Recommendations' : 'Next'}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default RiskProfilePage;
