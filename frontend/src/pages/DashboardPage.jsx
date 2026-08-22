import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../api/index.js';
import { Map, Plus, Calendar, MapPin, ArrowRight, Globe } from 'lucide-react';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { userFirstName } from '../utils/user.js';

function MiniRoute({ count }) {
  const dots = Math.min(count, 5);
  if (!dots) return null;
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {[...Array(dots)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="w-2 h-2 rounded-full bg-sky shrink-0" />
          {i < dots - 1 && (
            <div className="flex-1 h-px border-t-2 border-dashed border-sky/30" />
          )}
        </React.Fragment>
      ))}
      {count > 5 && <span className="text-xs text-ink/40 ml-1">+{count - 5}</span>}
    </div>
  );
}

function TripCard({ trip }) {
  const navigate = useNavigate();
  return (
    <div
      className="card hover:shadow-card-hover transition-all duration-200 cursor-pointer group animate-slide-up"
      onClick={() => navigate('/trips/' + trip.id + '/builder')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-ink truncate group-hover:text-sky transition-colors">
            {trip.name}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-ink/50 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {trip.start_date} → {trip.end_date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {trip.stop_count} stop{trip.stop_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {trip.is_public && <Badge color="sky">Public</Badge>}
          <div className="w-8 h-8 rounded-full bg-fog flex items-center justify-center group-hover:bg-sky/10 transition-colors">
            <ArrowRight size={15} className="text-ink/40 group-hover:text-sky transition-colors" />
          </div>
        </div>
      </div>
      <MiniRoute count={trip.stop_count} />
    </div>
  );
}

function CityCard({ city }) {
  const navigate = useNavigate();
  return (
    <div
      className="card cursor-pointer hover:shadow-card-hover transition-all duration-200 group"
      onClick={() => navigate('/cities')}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center shrink-0">
          <Globe size={18} className="text-sky" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-ink group-hover:text-sky transition-colors truncate">
            {city.name}
          </p>
          <p className="text-xs text-ink/50">{city.country}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium text-sand">★ {city.popularity_score}</p>
          <p className="text-xs text-ink/40">Cost {city.cost_index}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.listTrips({ limit: 5 }),
  });
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', 'recommended'],
    queryFn: () => api.searchCities({ q: '' }),
  });

  const trips  = tripsData?.items ?? [];
  const cities = citiesData?.items?.slice(0, 4) ?? [];

  const stats = [
    { label: 'Total Trips',     value: tripsData?.total ?? 0,                                    icon: Map,      color: 'text-sky' },
    { label: 'Upcoming',        value: trips.filter(t => new Date(t.start_date) > new Date()).length, icon: Calendar, color: 'text-sand' },
    { label: 'Cities Planned',  value: trips.reduce((s, t) => s + (t.stop_count || 0), 0),      icon: MapPin,   color: 'text-mint' },
    { label: 'Shared Trips',    value: trips.filter(t => t.is_public).length,                   icon: Globe,    color: 'text-ink/60' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            Welcome back, {userFirstName(user)} ✈️
          </h1>
          <p className="text-ink/50 mt-1 text-sm">Where are you headed next?</p>
        </div>
        <Button onClick={() => navigate('/trips/new')} className="flex items-center gap-2 shrink-0">
          <Plus size={17} />
          Plan New Trip
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <Icon size={20} className={color + ' mb-3'} />
            <p className="text-2xl font-bold text-ink">{value}</p>
            <p className="text-xs text-ink/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-sky hover:underline flex items-center gap-1">
              All trips <ArrowRight size={13} />
            </Link>
          </div>
          {tripsLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : trips.length === 0 ? (
            <EmptyState
              icon={Map}
              title="No trips yet"
              description="Start planning your first adventure."
              action={
                <Button onClick={() => navigate('/trips/new')} className="flex items-center gap-2">
                  <Plus size={15} /> Plan a Trip
                </Button>
              }
            />
          ) : (
            trips.map(t => <TripCard key={t.id} trip={t} />)
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Top Destinations</h2>
            <Link to="/cities" className="text-sm text-sky hover:underline flex items-center gap-1">
              Explore <ArrowRight size={13} />
            </Link>
          </div>
          {citiesLoading ? (
            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
          ) : (
            cities.map(c => <CityCard key={c.id} city={c} />)
          )}
        </div>
      </div>
    </div>
  );
}
