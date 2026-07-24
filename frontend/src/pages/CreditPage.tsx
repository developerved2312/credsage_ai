import React, { useState } from 'react';
import { useCredit } from '@hooks/useCredit';
import { creditService } from '@services/creditService';
import ScoreBadge from '@components/ui/ScoreBadge';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import EmptyState from '@components/ui/EmptyState';
import type { CreditScoreInput, CreditScore } from '@appTypes/index';
import { formatDate } from '@utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Trash2, AlertCircle, ClipboardList, History, BarChart2 } from 'lucide-react';

type Tab = 'form' | 'results' | 'history';

const DEFAULT_INPUTS: CreditScoreInput = {
  recharge_freq_per_month: 4,
  avg_recharge_value: 150,
  recharge_gap_std: 5,
  bill_on_time_ratio: 0.85,
  avg_days_late: 2,
  autopay_enrolled: true,
  monthly_spend_volatility: 0.2,
  emi_usage_rate: 0.15,
  order_freq_trend: 0.5,
  phone_tenure_months: 24,
};

interface FactorData {
  creditScoreId: string;
  score: number;
  scoreCategory: string;
  confidence: number;
  shapValues: Record<string, number>;
  topFactors: Array<{ factor: string; impact: string; value: number }>;
  explanation?: string;
  recommendations?: string[];
}

const FACTOR_LABELS: Record<string, string> = {
  recharge_freq_per_month: 'Recharge Frequency',
  avg_recharge_value: 'Avg Recharge Value',
  recharge_gap_std: 'Recharge Gap Std Dev',
  bill_on_time_ratio: 'Bill On-Time Ratio',
  avg_days_late: 'Avg Days Late',
  autopay_enrolled: 'Autopay Enrolled',
  monthly_spend_volatility: 'Spend Volatility',
  emi_usage_rate: 'EMI Usage Rate',
  order_freq_trend: 'Order Freq Trend',
  phone_tenure_months: 'Phone Tenure',
};

const CreditPage: React.FC = () => {
  const { creditHistory, isHistoryLoading, calculateScore, isCalculating, deleteScore } =
    useCredit();

  const [tab, setTab] = useState<Tab>('form');
  const [inputs, setInputs] = useState<CreditScoreInput>(DEFAULT_INPUTS);
  const [result, setResult] = useState<CreditScore | null>(null);
  const [factors, setFactors] = useState<FactorData | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoadingFactors, setIsLoadingFactors] = useState(false);

  const handleInputChange = (key: keyof CreditScoreInput, value: string | boolean) => {
    setInputs((prev) => ({
      ...prev,
      [key]:
        key === 'autopay_enrolled'
          ? Boolean(value)
          : value === ''
          ? ''
          : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const score = await calculateScore(inputs);
      setResult(score);
      setIsLoadingFactors(true);
      try {
        const factorData = await creditService.getFactors(score.id);
        setFactors(factorData as FactorData);
      } catch {
        // factors optional
      } finally {
        setIsLoadingFactors(false);
      }
      setTab('results');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to calculate score. Please try again.';
      setFormError(msg);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this score record?')) {
      deleteScore(id);
    }
  };

  const shapChartData = factors?.topFactors
    ? factors.topFactors.map((f) => ({
        name: FACTOR_LABELS[f.factor] ?? f.factor,
        value: Math.abs(f.value),
        impact: f.impact,
      }))
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Credit Score</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Submit your financial signals to get an AI-powered credit score.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-color">
        {(
          [
            { key: 'form', label: 'Calculate Score', icon: ClipboardList },
            { key: 'results', label: 'Results', icon: BarChart2 },
            { key: 'history', label: 'History', icon: History },
          ] as { key: Tab; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      {tab === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded border border-red-200 bg-red-50">
              <AlertCircle size={15} className="text-risk-high shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-sm text-risk-high">{formError}</p>
            </div>
          )}

          {/* Mobile / Recharge */}
          <section className="card space-y-4">
            <h2 className="card-title">Mobile & Recharge Behaviour</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Recharges per month</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.recharge_freq_per_month}
                  min={0}
                  step={0.1}
                  onChange={(e) => handleInputChange('recharge_freq_per_month', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Avg recharge value (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.avg_recharge_value}
                  min={0}
                  onChange={(e) => handleInputChange('avg_recharge_value', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Recharge gap std dev (days)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.recharge_gap_std}
                  min={0}
                  step={0.1}
                  onChange={(e) => handleInputChange('recharge_gap_std', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Bill Payments */}
          <section className="card space-y-4">
            <h2 className="card-title">Bill Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">On-time payment ratio (0–1)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.bill_on_time_ratio}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) => handleInputChange('bill_on_time_ratio', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Avg days late</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.avg_days_late}
                  min={0}
                  step={0.5}
                  onChange={(e) => handleInputChange('avg_days_late', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Autopay enrolled</label>
                <select
                  className="input"
                  value={inputs.autopay_enrolled ? 'true' : 'false'}
                  onChange={(e) =>
                    handleInputChange('autopay_enrolled', e.target.value === 'true')
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </section>

          {/* Spending Behaviour */}
          <section className="card space-y-4">
            <h2 className="card-title">Spending Behaviour</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Monthly spend volatility (0–1)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.monthly_spend_volatility}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) =>
                    handleInputChange('monthly_spend_volatility', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="input-label">EMI usage rate (0–1)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.emi_usage_rate}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) => handleInputChange('emi_usage_rate', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Account History */}
          <section className="card space-y-4">
            <h2 className="card-title">Account History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Order frequency trend (0–1)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.order_freq_trend}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) => handleInputChange('order_freq_trend', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Phone tenure (months)</label>
                <input
                  type="number"
                  className="input"
                  value={inputs.phone_tenure_months}
                  min={0}
                  onChange={(e) =>
                    handleInputChange('phone_tenure_months', e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              id="calculate-score-btn"
              type="submit"
              disabled={isCalculating}
              className="btn btn-primary px-6 py-2.5"
            >
              {isCalculating ? (
                <>
                  <LoadingSpinner size={14} />
                  Calculating…
                </>
              ) : (
                'Calculate Score'
              )}
            </button>
            <button
              type="button"
              onClick={() => setInputs(DEFAULT_INPUTS)}
              className="btn btn-secondary"
            >
              Reset to defaults
            </button>
          </div>
        </form>
      )}

      {/* Results */}
      {tab === 'results' && (
        <div className="space-y-5">
          {!result ? (
            <EmptyState
              icon={BarChart2}
              title="No results yet"
              description="Submit the form to calculate your credit score."
              action={{ label: 'Go to form', onClick: () => setTab('form') }}
            />
          ) : (
            <>
              {/* Score display */}
              <div className="card flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-semibold text-primary tabular-nums">
                    {result.score}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <ScoreBadge category={result.scoreCategory} />
                    <span className="text-xs text-text-secondary">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>300</span>
                    <span>Score range</span>
                    <span>850</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${((result.score - 300) / 550) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span className="text-risk-high">Poor</span>
                    <span className="text-risk-medium">Fair</span>
                    <span className="text-risk-low">Excellent</span>
                  </div>
                </div>
              </div>

              {/* SHAP factors */}
              {isLoadingFactors ? (
                <div className="card">
                  <LoadingSpinner fullPage size={20} />
                </div>
              ) : factors && factors.topFactors.length > 0 ? (
                <div className="card space-y-4">
                  <h2 className="card-title">Top Score Factors</h2>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={shapChartData}
                        layout="vertical"
                        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                      >
                        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(v: number, _: string, entry: { payload?: { impact?: string } }) => [
                            `${entry.payload?.impact === 'positive' ? '+' : '-'}${(v as number).toFixed(3)}`,
                            'SHAP impact',
                          ]}
                          contentStyle={{ fontSize: 12, borderRadius: 6 }}
                        />
                        <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                          {shapChartData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={entry.impact === 'positive' ? '#16A34A' : '#DC2626'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Green bars improve your score; red bars reduce it.
                  </p>
                </div>
              ) : null}

              {/* Explanation */}
              {factors?.explanation && (
                <div className="card space-y-2">
                  <h2 className="card-title">What this means</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {factors.explanation}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {factors?.recommendations && factors.recommendations.length > 0 && (
                <div className="card space-y-3">
                  <h2 className="card-title">How to improve your score</h2>
                  <ul className="space-y-2">
                    {factors.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <span className="mt-1 shrink-0 w-4 h-4 rounded-full bg-green-100 text-primary text-xs flex items-center justify-center font-semibold">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          {isHistoryLoading ? (
            <LoadingSpinner fullPage size={20} />
          ) : !creditHistory?.data.length ? (
            <EmptyState
              icon={History}
              title="No history yet"
              description="Calculated scores will appear here."
              action={{ label: 'Calculate a score', onClick: () => setTab('form') }}
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Category</th>
                  <th>Confidence</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {creditHistory.data.map((s) => (
                  <tr key={s.id}>
                    <td className="text-xs text-text-secondary">{formatDate(s.createdAt)}</td>
                    <td className="font-semibold text-primary tabular-nums">{s.score}</td>
                    <td>
                      <ScoreBadge category={s.scoreCategory} />
                    </td>
                    <td className="text-xs text-text-secondary">
                      {Math.round(s.confidence * 100)}%
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn btn-ghost text-risk-high hover:bg-red-50 p-1.5"
                        aria-label="Delete score"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditPage;
