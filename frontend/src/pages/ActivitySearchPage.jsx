
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Activity, DollarSign, Clock, X } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const CATEGORY_COLORS = {
  sightseeing: 'sky',
  food: 'sand',
  adventure: 'mint',
  transport: 'ink',
  stay: 'sand',
  other: 'ink',
};

function ActivityCard({ activity }) {
  const durationHrs = activity.duration_minutes ? (activity.duration_minutes / 60).toFixed(1) : null;
  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sand/10 flex items-center justify-center shrink-0">
          <Activity size={18} className="text-sand" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-ink">{activity.name}</h3>
          {activity.category && (
            <Badge color={CATEGORY_COLORS[activity.category] ?? 'ink'} className="mt-1">
              {activity.category}
            </Badge>
          )}
          {activity.description && (
            <p className="text-xs text-ink/50 mt-1.5 line-clamp-2">{activity.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-ink/60">
            {activity.cost != null && (
              <span className="flex items-center gap-1 font-medium text-mint">
                <DollarSign size={11} />
                {Number(activity.cost) === 0 ? 'Free' : '$' + Number(activity.cost).toFixed(0)}
              </span>
            )}
            {durationHrs && (
              <span className="flex items-center gap-1">
                <Clock size={11} />~{durationHrs}h
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivitySearchPage() {
  const [q, setQ] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['activities', q],
    queryFn: () => api.searchActivities({ q: q || undefined }),
    placeholderData: prev => prev,
  });

  const activities = data?.items ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Activities</h1>
        <p className="text-ink/50 text-sm mt-0.5">Browse experiences to add to your stops</p>
      </div>

      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          placeholder="Search activities by name…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full bg-white border border-fog-dark rounded-xl pl-11 pr-10 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all shadow-card"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!isLoading && (
        <p className="text-xs text-ink/40">
          {isFetching
            ? 'Searching…'
            : activities.length + ' activit' + (activities.length !== 1 ? 'ies' : 'y') + (q ? ' matching "' + q + '"' : '')}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={q ? 'No activities found' : 'No activities yet'}
          description={q ? `No results for "${q}". Try a different search.` : 'Activities will appear here once the database is seeded.'}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {activities.map(a => <ActivityCard key={a.id} activity={a} />)}
        </div>
      )}
    </div>
  );
}
