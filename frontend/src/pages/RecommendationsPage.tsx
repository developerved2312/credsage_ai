import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { investmentService } from '@services/investmentService';
import { computeProjections } from '@utils/projections';
import Disclaimer from '@components/ui/Disclaimer';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import EmptyState from '@components/ui/EmptyState';
import type { InvestmentRecommendation } from '@appTypes/index';
import type { RiskProfile } from './RiskProfilePage';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Star, BarChart2, TrendingUp } from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const RecommendationCard: React.FC<{ rec: InvestmentRecommendation }> = ({ rec }) => (
  <div className="card space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-text-primary">{rec.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {rec.symbol} · {rec.type}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-semibold text-primary tabular-nums">
          {rec.recommendedAllocation}%
        </p>
        <p className="text-xs text-text-secondary">allocation</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 text-xs">
      <span className={`badge ${RISK_COLORS[rec.riskLevel] ?? 'badge-neutral'}`}>
        {rec.riskLevel} risk
      </span>
      <span className="badge badge-neutral">
        {rec.expectedReturn > 0 ? '+' : ''}{rec.expectedReturn.toFixed(1)}% expected return
      </span>
      <span className="badge badge-neutral">
        {formatINR(rec.recommendedAmount)} recommended
      </span>
    </div>

    {rec.reasoningPoints.length > 0 && (
      <ul className="space-y-1">
        {rec.reasoningPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-0.5 text-primary">•</span>
            {point}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const RecommendationsPage: React.FC = () => {
  const location = useLocation();
  const profile = location.state?.profile as RiskProfile | undefined;

  const [horizonYears, setHorizonYears] = useState(profile?.horizonYears ?? 5);

  const {
    data: recommendations,
    isLoading,
    isError,
  } = useQuery(
    ['recommendations', profile?.riskTolerance, profile?.investmentAmount, profile?.investmentHorizon],
    () =>
      investmentService.getRecommendations({
        riskTolerance: profile?.riskTolerance ?? 'medium',
        investmentAmount: profile?.investmentAmount ?? 1000,
        horizon: profile?.investmentHorizon ?? 'medium',
      }),
    { enabled: true, staleTime: 5 * 60 * 1000 }
  );

  const projectionData = computeProjections(profile?.investmentAmount ?? 1000, horizonYears);

  const horizonLabel: Record<string, string> = {
    short: 'Short-term (< 1 yr)',
    medium: 'Medium-term (1–3 yrs)',
    long: 'Long-term (5+ yrs)',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Investment Recommendations</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Tailored to your risk profile and investment amount.
          </p>
        </div>
        <Link to="/investment/risk-profile" className="btn btn-secondary text-xs shrink-0">
          Re-take questionnaire
        </Link>
      </div>

      <Disclaimer />

      {/* Profile summary */}
      {profile && (
        <div className="flex flex-wrap gap-3">
          <div className="card !p-3 flex items-center gap-2">
            <Star size={14} className="text-primary" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-text-secondary">Risk tolerance</p>
              <p className="text-sm font-medium text-text-primary capitalize">
                {profile.riskTolerance}
              </p>
            </div>
          </div>
          <div className="card !p-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-text-secondary">Horizon</p>
              <p className="text-sm font-medium text-text-primary">
                {horizonLabel[profile.investmentHorizon] ?? profile.investmentHorizon}
              </p>
            </div>
          </div>
          <div className="card !p-3 flex items-center gap-2">
            <BarChart2 size={14} className="text-primary" strokeWidth={1.75} />
            <div>
              <p className="text-xs text-text-secondary">Monthly investment</p>
              <p className="text-sm font-medium text-text-primary">
                {formatINR(profile.investmentAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Recommended Instruments</h2>
        {isLoading ? (
          <LoadingSpinner fullPage size={22} />
        ) : isError ? (
          <div className="card text-sm text-risk-high">
            Failed to load recommendations. Please try again.
          </div>
        ) : !recommendations?.length ? (
          <EmptyState
            icon={Star}
            title="No recommendations found"
            description="Try adjusting your risk profile."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.symbol} rec={rec} />
            ))}
          </div>
        )}
      </section>

      {/* Growth projection chart */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="card-title">Growth Projection</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              3 scenarios based on monthly investment of{' '}
              <strong>{formatINR(profile?.investmentAmount ?? 1000)}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">Horizon:</label>
            <select
              className="input !py-1 !px-2 !w-auto text-xs"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
            >
              {[1, 2, 3, 5, 7, 10].map((y) => (
                <option key={y} value={y}>
                  {y} {y === 1 ? 'year' : 'years'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11 }}
                tickLine={false}
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
                }
              />
              <Tooltip
                formatter={(value: number) => [formatINR(value), '']}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E2E5EA' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="conservative"
                name="Conservative (6%)"
                stroke="#6B7280"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expected"
                name="Expected (10%)"
                stroke="#14532D"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="optimistic"
                name="Optimistic (14%)"
                stroke="#16A34A"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-text-secondary">
          Scenarios use 6% / 10% / 14% annual compound returns as illustrative assumptions only.
          Actual returns will vary.
        </p>
      </section>
    </div>
  );
};

export default RecommendationsPage;
