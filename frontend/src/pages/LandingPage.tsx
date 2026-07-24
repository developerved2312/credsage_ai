import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, BarChart2, MessageSquare, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Transparent Credit Scoring',
    description:
      'AI-powered scoring built on alternative data — mobile usage, bill patterns, and payment history — with plain-language explanations of every factor.',
  },
  {
    icon: BarChart2,
    title: 'Personalized Risk Profiling',
    description:
      'A short questionnaire maps your goals, timeline, and comfort with risk into a concrete investment profile — no financial jargon required.',
  },
  {
    icon: MessageSquare,
    title: 'Plain-Language Investment Guidance',
    description:
      'An AI advisor explains what your score means, suggests micro-investment options, and answers follow-up questions in everyday language.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border-color sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-base font-semibold text-primary tracking-tight">CredSage AI</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-secondary text-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary text-sm">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold text-text-primary leading-tight text-balance">
              Credit scoring and micro-investment guidance for people the system usually ignores.
            </h1>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed max-w-xl">
              Built on alternative data, not just your credit history. Understand your financial
              standing, get a risk profile, and start investing with as little as ₹500 a month.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/signup"
                id="hero-cta"
                className="btn btn-primary px-6 py-2.5 text-base"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="border-t border-border-color bg-surface">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="w-9 h-9 rounded bg-green-50 border border-green-200 flex items-center justify-center">
                    <Icon size={17} className="text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-xs font-medium text-primary">CredSage AI</span>
          <p className="text-xs text-text-secondary">
            Educational prototype — not regulated financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
