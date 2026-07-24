import React from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../lib/auth';
import { useCredit } from '@hooks/useCredit';
import { useInvestment } from '@hooks/useInvestment';
import { useAuth } from '@hooks/useAuth';
import ScoreBadge from '@components/ui/ScoreBadge';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import { CreditCard, Star, MessageSquare, TrendingUp, TrendingDown, Minus, Briefcase } from 'lucide-react';
import { formatDate } from '@utils/formatters';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
}> = ({ label, value, sub }) => (
  <div className="card">
    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-semibold text-text-primary">{value}</p>
    {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
  </div>
);

const TrendIcon: React.FC<{ trend: string | null | undefined }> = ({ trend }) => {
  if (trend === 'up') return <TrendingUp size={14} className="text-risk-low" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-risk-high" />;
  return <Minus size={14} className="text-text-secondary" />;
};

const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const { latestScore, creditStats, isLatestLoading } = useCredit();
  const { analytics, portfolios } = useInvestment();
  const { userStats } = useAuth();

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm lg:text-base text-text-secondary mt-1">
          Here's an overview of your financial profile.
        </p>
      </div>

      {/* Credit Score Hero */}
      <div className="card flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            Latest Credit Score
          </p>
          {isLatestLoading ? (
            <LoadingSpinner size={20} />
          ) : latestScore ? (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mt-2">
              <span className="text-4xl sm:text-5xl font-bold text-primary tabular-nums">
                {latestScore.score}
              </span>
              <div className="flex flex-col gap-1">
                <ScoreBadge category={latestScore.scoreCategory} />
                <span className="text-xs text-text-secondary">
                  {formatDate(latestScore.createdAt)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-text-secondary text-sm">No score yet.</p>
              <Link to="/credit" className="text-sm text-primary font-medium hover:underline mt-1 inline-block">
                Calculate your first score →
              </Link>
            </div>
          )}

          {creditStats && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-text-secondary">
              <TrendIcon trend={creditStats.trend} />
              <span>
                {creditStats.trend === 'up'
                  ? 'Trending up from last check'
                  : creditStats.trend === 'down'
                  ? 'Trending down from last check'
                  : 'Stable across recent checks'}
              </span>
            </div>
          )}
        </div>

        {/* Score bar */}
        {latestScore && (
          <div className="flex flex-col items-end gap-1 shrink-0 w-full md:w-auto">
            <div className="w-full md:w-48 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((latestScore.score - 300) / 550) * 100}%` }}
              />
            </div>
            <div className="flex justify-between w-full md:w-48 text-xs text-text-secondary">
              <span>300</span>
              <span>850</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Scores"
          value={creditStats?.totalScores ?? userStats?.creditScores ?? '—'}
          sub="all time"
        />
        <StatCard
          label="Portfolios"
          value={portfolios?.length ?? userStats?.portfolios ?? '—'}
          sub="active"
        />
        <StatCard
          label="Total Invested"
          value={analytics ? formatINR(analytics.totalInvested) : '—'}
          sub={analytics ? `${analytics.totalReturnPercent >= 0 ? '+' : ''}${analytics.totalReturnPercent.toFixed(1)}% return` : undefined}
        />
        <StatCard
          label="AI Conversations"
          value={userStats?.chatMessages ?? '—'}
          sub="messages sent"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/credit"
            className="card flex items-start gap-3 hover:shadow-card-hover transition-shadow cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                Check my score
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Submit alt-data inputs and get an updated score
              </p>
            </div>
          </Link>

          <Link
            to="/investment/risk-profile"
            className="card flex items-start gap-3 hover:shadow-card-hover transition-shadow cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
              <Star size={18} className="text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                Get investment recommendations
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Complete the risk questionnaire first
              </p>
            </div>
          </Link>

          <Link
            to="/chatbot"
            className="card flex items-start gap-3 hover:shadow-card-hover transition-shadow cursor-pointer group sm:col-span-2 lg:col-span-1"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                Ask the AI advisor
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Plain-language answers about credit and investing
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Top performers preview */}
      {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Top Performers</h2>
            <Link to="/investment/portfolio" className="text-sm text-primary hover:underline font-medium">
              View portfolio →
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Instrument</th>
                    <th className="text-right">P&amp;L</th>
                    <th className="text-right">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPerformers.slice(0, 3).map((p) => (
                    <tr key={p.symbol}>
                      <td>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-text-secondary">{p.symbol}</p>
                      </td>
                      <td className={`text-right font-medium tabular-nums ${p.profitLoss >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                        {p.profitLoss >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.profitLoss)}
                      </td>
                      <td className={`text-right text-xs tabular-nums ${p.profitLossPercent >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                        {p.profitLossPercent >= 0 ? '+' : ''}
                        {typeof p.profitLossPercent === 'number' ? p.profitLossPercent.toFixed(1) : Number(p.profitLossPercent || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio shortcut if no investments yet */}
      {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
        <div className="card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-text-secondary" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-text-primary">No investments yet</p>
              <p className="text-xs text-text-secondary">Create a portfolio and start tracking holdings</p>
            </div>
          </div>
          <Link to="/investment/portfolio" className="btn btn-secondary text-sm w-full sm:w-auto">
            Create Portfolio
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
