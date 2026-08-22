
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Globe, Star, DollarSign, X } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

function CityCard({ city }) {
  const costLabel = city.cost_index <= 2 ? 'Budget' : city.cost_index <= 3 ? 'Mid-range' : 'Luxury';
  const costColor = city.cost_index <= 2 ? 'mint' : city.cost_index <= 3 ? 'sand' : 'rose';
  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 animate-slide-up group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky/20 to-sky/5 flex items-center justify-center shrink-0">
          <Globe size={22} className="text-sky" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base font-semibold text-ink">{city.name}</h3>
            <Badge color={costColor}>{costLabel}</Badge>
          </div>
          <p className="text-sm text-ink/50 mt-0.5">{city.country}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink/60 flex-wrap">
            <span className="flex items-center gap-1">
              <Star size={11} className="text-sand fill-sand" />
              {city.popularity_score} popularity
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={11} />
              Cost index: {city.cost_index}/5
            </span>
          </div>
          {city.description && (
            <p className="text-xs text-ink/50 mt-2 line-clamp-2">{city.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CitySearchPage() {
  const [q, setQ] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cities', q],
    queryFn: () => api.searchCities({ q }),
    placeholderData: prev => prev,
  });

  const cities = data?.items ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Explore Cities</h1>
        <p className="text-ink/50 text-sm mt-0.5">Find your next destination</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          placeholder="Search cities by name or country…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full bg-white border border-fog-dark rounded-xl pl-11 pr-10 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all shadow-card"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stats */}
      {!isLoading && (
        <p className="text-xs text-ink/40">
          {isFetching ? 'Searching…' : cities.length + ' destination' + (cities.length !== 1 ? 's' : '') + (q ? ' matching "' + q + '"' : '')}
        </p>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : cities.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No cities found"
          description={'No destinations match "' + q + '". Try a different search.'}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {cities.map(c => <CityCard key={c.id} city={c} />)}
        </div>
      )}
    </div>
  );
}
