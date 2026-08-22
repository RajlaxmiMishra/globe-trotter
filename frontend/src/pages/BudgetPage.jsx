
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

function CostBar({ label, amount, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ink/70">{label}</span>
        <span className="text-xs font-semibold text-ink">${amount.toLocaleString()} <span className="font-normal text-ink/40">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-fog-dark rounded-full overflow-hidden">
        <div
          className={'h-full rounded-full transition-all duration-700 ' + color}
          style={{ width: pct + '%' }}
        />
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

  const isOverBudget = budget && trip?.budget_threshold && budget.total_cost > trip.budget_threshold;
  const remaining = trip?.budget_threshold ? trip.budget_threshold - (budget?.total_cost ?? 0) : null;

  return (
    <div className="max-w-lg animate-fade-in">
      <button onClick={() => navigate('/trips/' + id + '/builder')} className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Builder
      </button>

      <h1 className="font-display text-2xl font-bold text-ink mb-1">Budget Breakdown</h1>
      {trip && <p className="text-sm text-ink/50 mb-6">{trip.name}</p>}

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="lg" /></div>
      ) : !budget ? (
        <div className="card text-center py-10 text-ink/50 text-sm">No budget data available yet. Add stops and activities first.</div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <DollarSign size={20} className="text-sky mb-2" />
              <p className="text-2xl font-bold text-ink">${(budget.total_cost || 0).toLocaleString()}</p>
              <p className="text-xs text-ink/50 mt-0.5">Total Estimated Cost</p>
            </div>
            <div className={'card ' + (isOverBudget ? 'border border-rose/30' : '')}>
              {isOverBudget
                ? <AlertTriangle size={20} className="text-rose mb-2" />
                : <CheckCircle size={20} className="text-mint mb-2" />
              }
              <p className={'text-2xl font-bold ' + (isOverBudget ? 'text-rose' : 'text-mint')}>
                {remaining != null ? (isOverBudget ? '-' : '+') + '$' + Math.abs(remaining).toLocaleString() : '—'}
              </p>
              <p className="text-xs text-ink/50 mt-0.5">
                {remaining != null ? (isOverBudget ? 'Over budget' : 'Under budget') : 'No threshold set'}
              </p>
            </div>
          </div>

          {/* Threshold */}
          {trip?.budget_threshold && (
            <div className="card flex items-center gap-3">
              <TrendingUp size={18} className="text-sand" />
              <div className="flex-1">
                <p className="text-xs text-ink/50">Budget Threshold</p>
                <p className="font-semibold text-ink">${trip.budget_threshold.toLocaleString()}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-fog-dark rounded-full overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all duration-700 ' + (isOverBudget ? 'bg-rose' : 'bg-mint')}
                    style={{ width: Math.min(100, Math.round((budget.total_cost / trip.budget_threshold) * 100)) + '%' }}
                  />
                </div>
                <p className="text-xs text-ink/40 mt-1">{Math.round((budget.total_cost / trip.budget_threshold) * 100)}% used</p>
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          {budget.breakdown && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-ink text-sm">Cost Breakdown by Category</h2>
              {budget.breakdown.accommodation != null && (
                <CostBar label="Accommodation" amount={budget.breakdown.accommodation} total={budget.total_cost} color="bg-sky" />
              )}
              {budget.breakdown.activities != null && (
                <CostBar label="Activities" amount={budget.breakdown.activities} total={budget.total_cost} color="bg-sand" />
              )}
              {budget.breakdown.transport != null && (
                <CostBar label="Transport" amount={budget.breakdown.transport} total={budget.total_cost} color="bg-mint" />
              )}
              {budget.breakdown.misc != null && (
                <CostBar label="Miscellaneous" amount={budget.breakdown.misc} total={budget.total_cost} color="bg-ink/40" />
              )}
            </div>
          )}

          {/* Per stop */}
          {budget.per_stop && budget.per_stop.length > 0 && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-ink text-sm">Per Stop</h2>
              {budget.per_stop.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky shrink-0" />
                  <span className="text-sm text-ink flex-1">{s.city_name}</span>
                  <span className="text-sm font-semibold text-ink">${(s.cost || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
