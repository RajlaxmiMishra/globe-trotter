
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';

function CostBar({ label, amount, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ink/70">{label}</span>
        <span className="text-xs font-semibold text-ink">
          ${Number(amount).toLocaleString()} <span className="font-normal text-ink/40">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-fog-dark rounded-full overflow-hidden">
        <div className={'h-full rounded-full transition-all duration-700 ' + color} style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => api.getBudget(id),
  });
  const { data: trip } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.getTrip(id),
  });

  const totalCost = Number(budget?.total_estimated_cost ?? 0);
  const threshold = trip?.budget_threshold ?? null;
  const isOverBudget = threshold && totalCost > threshold;
  const remaining = threshold ? threshold - totalCost : null;

  return (
    <div className="max-w-lg animate-fade-in">
      <button
        onClick={() => navigate('/trips/' + id + '/builder')}
        className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Builder
      </button>

      <h1 className="font-display text-2xl font-bold text-ink mb-1">Budget Breakdown</h1>
      {trip && <p className="text-sm text-ink/50 mb-6">{trip.name}</p>}

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="lg" /></div>
      ) : !budget ? (
        <div className="card text-center py-10 text-ink/50 text-sm">
          No budget data yet. Add stops and activities first.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <DollarSign size={20} className="text-sky mb-2" />
              <p className="text-2xl font-bold text-ink">${totalCost.toLocaleString()}</p>
              <p className="text-xs text-ink/50 mt-0.5">Total Estimated Cost</p>
            </div>
            <div className={'card ' + (isOverBudget ? 'border border-rose/30' : '')}>
              {isOverBudget
                ? <AlertTriangle size={20} className="text-rose mb-2" />
                : <CheckCircle size={20} className="text-mint mb-2" />
              }
              <p className={'text-2xl font-bold ' + (isOverBudget ? 'text-rose' : 'text-mint')}>
                {remaining != null
                  ? (isOverBudget ? '-' : '+') + '$' + Math.abs(remaining).toLocaleString()
                  : '—'}
              </p>
              <p className="text-xs text-ink/50 mt-0.5">
                {remaining != null ? (isOverBudget ? 'Over budget' : 'Under budget') : 'No threshold set'}
              </p>
            </div>
          </div>

          {/* Threshold progress */}
          {threshold && (
            <div className="card flex items-center gap-3">
              <TrendingUp size={18} className="text-sand shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-ink/50">Budget Threshold</p>
                <p className="font-semibold text-ink">${Number(threshold).toLocaleString()}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-fog-dark rounded-full overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all duration-700 ' + (isOverBudget ? 'bg-rose' : 'bg-mint')}
                    style={{ width: Math.min(100, Math.round((totalCost / threshold) * 100)) + '%' }}
                  />
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  {Math.round((totalCost / threshold) * 100)}% used
                </p>
              </div>
            </div>
          )}

          {/* Cost breakdown by category */}
          {budget.breakdown && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-ink text-sm">Cost Breakdown by Category</h2>
              {budget.breakdown.stay != null && Number(budget.breakdown.stay) > 0 && (
                <CostBar label="Accommodation / Stay" amount={Number(budget.breakdown.stay)} total={totalCost} color="bg-sky" />
              )}
              {budget.breakdown.activities != null && Number(budget.breakdown.activities) > 0 && (
                <CostBar label="Activities" amount={Number(budget.breakdown.activities)} total={totalCost} color="bg-sand" />
              )}
              {budget.breakdown.transport != null && Number(budget.breakdown.transport) > 0 && (
                <CostBar label="Transport" amount={Number(budget.breakdown.transport)} total={totalCost} color="bg-mint" />
              )}
              {budget.breakdown.meals != null && Number(budget.breakdown.meals) > 0 && (
                <CostBar label="Food & Meals" amount={Number(budget.breakdown.meals)} total={totalCost} color="bg-ink/30" />
              )}
              {totalCost === 0 && (
                <p className="text-xs text-ink/40 italic">Add activities to see cost breakdown.</p>
              )}
            </div>
          )}

          {/* Per day */}
          {budget.per_day && budget.per_day.length > 0 && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-ink text-sm">Daily Costs</h2>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {budget.per_day.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-ink/40 w-24 shrink-0">{String(d.date)}</span>
                    <div className="flex-1 h-1.5 bg-fog-dark rounded-full overflow-hidden">
                      <div
                        className={'h-full rounded-full ' + (d.over_budget ? 'bg-rose' : 'bg-sky')}
                        style={{ width: totalCost > 0 ? Math.min(100, Math.round((Number(d.cost) / (totalCost / budget.per_day.length)) * 100)) + '%' : '0%' }}
                      />
                    </div>
                    <span className={'text-xs font-semibold shrink-0 ' + (d.over_budget ? 'text-rose' : 'text-ink')}>
                      ${Number(d.cost).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
