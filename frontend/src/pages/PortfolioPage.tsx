import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { investmentService } from '@services/investmentService';
import { useInvestment } from '@hooks/useInvestment';
import Disclaimer from '@components/ui/Disclaimer';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import EmptyState from '@components/ui/EmptyState';
import type { Portfolio, Investment } from '@appTypes/index';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Pencil, X, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';

const formatINR = (n: number | null | undefined) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(n);

const formatPercent = (n: number | null | undefined, digits = 1) =>
  n == null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;

const getColorClass = (n: number | null | undefined) =>
  n == null ? '' : n >= 0 ? 'text-risk-low' : 'text-risk-high';

const PIE_COLORS = ['#14532D', '#16A34A', '#4ADE80', '#BBF7D0', '#6B7280', '#D1D5DB'];

/* ——— Portfolio form ——— */
interface PortfolioFormProps {
  initial?: Partial<Portfolio>;
  onSubmit: (data: { name: string; description?: string; riskTolerance: string; investmentHorizon: string; cashBalance: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ initial, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [riskTolerance, setRiskTolerance] = useState(initial?.riskTolerance ?? 'medium');
  const [investmentHorizon, setInvestmentHorizon] = useState(initial?.investmentHorizon ?? 'medium');
  const [cashBalance, setCashBalance] = useState(initial?.cashBalance ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description: description || undefined, riskTolerance, investmentHorizon, cashBalance });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="input-label">Portfolio name *</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Long-term Growth" />
        </div>
        <div className="md:col-span-2">
          <label className="input-label">Description</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" />
        </div>
        <div>
          <label className="input-label">Risk tolerance</label>
          <select className="input" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="input-label">Investment horizon</label>
          <select className="input" value={investmentHorizon} onChange={(e) => setInvestmentHorizon(e.target.value)}>
            <option value="short">Short (&lt; 1 year)</option>
            <option value="medium">Medium (1–3 years)</option>
            <option value="long">Long (3+ years)</option>
          </select>
        </div>
        <div>
          <label className="input-label">Starting cash (₹)</label>
          <input type="number" className="input" min={0} value={cashBalance} onChange={(e) => setCashBalance(Number(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? <LoadingSpinner size={14} /> : null}
          {initial?.id ? 'Update Portfolio' : 'Create Portfolio'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

/* ——— Investment form ——— */
interface InvestmentFormProps {
  portfolioId?: string;
  onSubmit: (data: { portfolioId?: string; symbol: string; name: string; type: string; quantity: number; purchasePrice: number; currentPrice?: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ portfolioId, onSubmit, onCancel, isLoading }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('stock');
  const [quantity, setQuantity] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ portfolioId, symbol, name, type, quantity, purchasePrice, currentPrice: currentPrice || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="input-label">Symbol *</label>
          <input required className="input" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="RELIANCE" />
        </div>
        <div>
          <label className="input-label">Name *</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Reliance Industries" />
        </div>
        <div>
          <label className="input-label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="stock">Stock</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="etf">ETF</option>
            <option value="bond">Bond</option>
            <option value="crypto">Crypto</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="input-label">Quantity *</label>
          <input required type="number" className="input" min={0.001} step={0.001} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>
        <div>
          <label className="input-label">Purchase price (₹) *</label>
          <input required type="number" className="input" min={0} step={0.01} value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="input-label">Current price (₹)</label>
          <input type="number" className="input" min={0} step={0.01} value={currentPrice ?? ''} onChange={(e) => setCurrentPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? <LoadingSpinner size={14} /> : null}
          Add Holding
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

/* ——— Portfolio detail panel ——— */
const PortfolioDetail: React.FC<{ portfolio: Portfolio; onClose: () => void }> = ({
  portfolio,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [showAddInvestment, setShowAddInvestment] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = useQuery(
    ['portfolio-stats', portfolio.id],
    () => investmentService.portfolio.getStats(portfolio.id)
  );

  const { data: investments, isLoading: isInvLoading } = useQuery(
    ['investments', portfolio.id],
    () => investmentService.investment.getAll({ portfolioId: portfolio.id })
  );

  const addInvestmentMutation = useMutation(investmentService.investment.add, {
    onSuccess: () => {
      queryClient.invalidateQueries(['investments', portfolio.id]);
      queryClient.invalidateQueries(['portfolio-stats', portfolio.id]);
      queryClient.invalidateQueries(['portfolios']);
      setShowAddInvestment(false);
    },
  });

  const deleteInvestmentMutation = useMutation(investmentService.investment.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['investments', portfolio.id]);
      queryClient.invalidateQueries(['portfolio-stats', portfolio.id]);
      queryClient.invalidateQueries(['portfolios']);
    },
  });

  const pieData = stats?.assetAllocation
    ? Object.entries(stats.assetAllocation).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{portfolio.name}</h2>
          {portfolio.description && (
            <p className="text-xs text-text-secondary mt-0.5">{portfolio.description}</p>
          )}
        </div>
        <button onClick={onClose} className="btn btn-ghost p-1.5">
          <X size={16} />
        </button>
      </div>

      {/* Stats row */}
      {isStatsLoading ? (
        <LoadingSpinner fullPage size={18} />
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Value', value: formatINR(stats.totalValue) },
            { label: 'Invested', value: formatINR(stats.investmentValue) },
            { label: 'P&L', value: `${stats.totalProfitLoss == null ? '' : stats.totalProfitLoss >= 0 ? '+' : ''}${formatINR(stats.totalProfitLoss)}`, color: getColorClass(stats.totalProfitLoss) },
            { label: 'Return', value: formatPercent(stats.totalReturnPercent), color: getColorClass(stats.totalReturnPercent) },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded border border-border-color p-3">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className={`text-sm font-semibold mt-0.5 tabular-nums ${color ?? 'text-text-primary'}`}>{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Asset Allocation</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Allocation']} contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Holdings</p>
          <button onClick={() => setShowAddInvestment(!showAddInvestment)} className="btn btn-secondary text-xs">
            <Plus size={13} /> Add Holding
          </button>
        </div>

        {showAddInvestment && (
          <div className="mb-4 border border-border-color rounded-md p-4 bg-gray-50">
            <InvestmentForm
              portfolioId={portfolio.id}
              onSubmit={(data) => addInvestmentMutation.mutate(data)}
              onCancel={() => setShowAddInvestment(false)}
              isLoading={addInvestmentMutation.isLoading}
            />
          </div>
        )}

        {isInvLoading ? (
          <LoadingSpinner fullPage size={18} />
        ) : !investments?.length ? (
          <EmptyState icon={Briefcase} title="No holdings yet" description="Add your first holding." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Buy Price</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">P&L</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {investments.map((inv: Investment) => (
                  <tr key={inv.id}>
                    <td>
                      <p className="font-medium">{inv.name}</p>
                      <p className="text-xs text-text-secondary">{inv.symbol} · {inv.type}</p>
                    </td>
                    <td className="text-right tabular-nums text-xs">{inv.quantity}</td>
                    <td className="text-right tabular-nums text-xs">{formatINR(inv.purchasePrice)}</td>
                    <td className="text-right tabular-nums text-xs">
                      {inv.currentPrice ? formatINR(inv.currentPrice) : '—'}
                    </td>
                    <td className={`text-right tabular-nums text-xs font-medium ${(inv.profitLoss ?? 0) >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                      {inv.profitLoss != null ? `${inv.profitLoss >= 0 ? '+' : ''}${formatINR(inv.profitLoss)}` : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => confirm('Delete this holding?') && deleteInvestmentMutation.mutate(inv.id)}
                        className="btn btn-ghost p-1.5 text-risk-high hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ——— Portfolio page ——— */
const PortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { portfolios, isPortfoliosLoading } = useInvestment();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editPortfolio, setEditPortfolio] = useState<Portfolio | null>(null);

  const createMutation = useMutation(investmentService.portfolio.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolios']);
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation(
    (data: { id: string; payload: Partial<Portfolio> }) =>
      investmentService.portfolio.update(data.id, data.payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['portfolios']);
        setEditPortfolio(null);
      },
    }
  );

  const deleteMutation = useMutation(investmentService.portfolio.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolios']);
      setSelectedPortfolioId(null);
    },
  });


  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Portfolio</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage your investment portfolios and holdings.
          </p>
        </div>
        <button
          id="create-portfolio-btn"
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary shrink-0"
        >
          <Plus size={15} /> New Portfolio
        </button>
      </div>

      <Disclaimer />

      {/* Create form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="card-title mb-4">New Portfolio</h2>
          <PortfolioForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createMutation.isLoading}
          />
        </div>
      )}

      {/* Portfolio list */}
      {isPortfoliosLoading ? (
        <LoadingSpinner fullPage />
      ) : !portfolios?.length ? (
        <EmptyState
          icon={Briefcase}
          title="No portfolios yet"
          description="Create your first portfolio to start tracking investments."
          action={{ label: 'Create Portfolio', onClick: () => setShowCreateForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {portfolios.map((p) => (
            <div key={p.id} className="card !p-0 overflow-hidden">
              {/* Portfolio header row */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() =>
                    setSelectedPortfolioId(selectedPortfolioId === p.id ? null : p.id)
                  }
                >
                  {selectedPortfolioId === p.id ? (
                    <ChevronDown size={15} className="text-text-secondary shrink-0" />
                  ) : (
                    <ChevronRight size={15} className="text-text-secondary shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-secondary capitalize">
                      {p.riskTolerance} risk · {p.investmentHorizon} horizon
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-text-primary tabular-nums">
                      {formatINR(p.totalValue)}
                    </p>
                    {p.totalReturnPercent != null && (
                      <p className={`text-xs tabular-nums ${p.totalReturnPercent >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                        {p.totalReturnPercent >= 0 ? '+' : ''}{Number(p.totalReturnPercent).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditPortfolio(p)}
                      className="btn btn-ghost p-1.5"
                      aria-label="Edit portfolio"
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => confirm('Delete this portfolio?') && deleteMutation.mutate(p.id)}
                      className="btn btn-ghost p-1.5 text-risk-high hover:bg-red-50"
                      aria-label="Delete portfolio"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit form inline */}
              {editPortfolio?.id === p.id && (
                <div className="border-t border-border-color px-5 py-4 bg-gray-50">
                  <PortfolioForm
                    initial={p}
                    onSubmit={(data) => updateMutation.mutate({ id: p.id, payload: data })}
                    onCancel={() => setEditPortfolio(null)}
                    isLoading={updateMutation.isLoading}
                  />
                </div>
              )}

              {/* Detail panel */}
              {selectedPortfolioId === p.id && editPortfolio?.id !== p.id && (
                <div className="border-t border-border-color p-5">
                  <PortfolioDetail portfolio={p} onClose={() => setSelectedPortfolioId(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
