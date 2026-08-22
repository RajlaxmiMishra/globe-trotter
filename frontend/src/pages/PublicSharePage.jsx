
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Globe, Calendar, MapPin, Copy, ArrowRight } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

export default function PublicSharePage() {
  const { slug } = useParams();

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['public-trip', slug],
    queryFn: () => api.getPublicTrip(slug),
  });

  const copyMutation = useMutation({
    mutationFn: () => api.copyTrip(slug),
    onSuccess: () => toast.success('Trip copied to your account!'),
    onError: () => toast.error('Sign in to copy this trip.'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-fog flex flex-col items-center justify-center gap-4 text-center p-6">
        <Globe size={48} className="text-ink/20" />
        <h1 className="font-display text-2xl font-bold text-ink">Trip Not Found</h1>
        <p className="text-ink/50 text-sm">This trip may be private or the link may have changed.</p>
        <Link to="/auth/login" className="text-sky text-sm hover:underline">Go to GlobeTrotter →</Link>
      </div>
    );
  }

  const cities = (trip.stops ?? []).map(s => s.city_name);

  return (
    <div className="min-h-screen bg-fog">
      {/* Header banner */}
      <div className="bg-ink text-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky rounded-lg flex items-center justify-center"><Globe size={18} /></div>
          <span className="font-display font-semibold">GlobeTrotter</span>
          <Badge color="sky">Shared Trip</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => copyMutation.mutate()}
            disabled={copyMutation.isPending}
            className="flex items-center gap-1.5 !px-3 !py-1.5 !text-sm !bg-white/10 !text-white hover:!bg-white/20 border-0"
          >
            <Copy size={14} />
            {copyMutation.isPending ? 'Copying…' : 'Copy Trip'}
          </Button>
          <Link to="/auth/login">
            <Button className="!px-3 !py-1.5 !text-sm flex items-center gap-1.5">
              Sign In <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {/* Trip card */}
        <div className="card">
          <h1 className="font-display text-2xl font-bold text-ink mb-2">{trip.name}</h1>
          <div className="flex flex-wrap gap-3 text-xs text-ink/60 mb-4">
            {trip.start_date && (
              <span className="flex items-center gap-1"><Calendar size={12} />{trip.start_date} → {trip.end_date}</span>
            )}
            <span className="flex items-center gap-1"><MapPin size={12} />{trip.stops?.length ?? 0} stops</span>
          </div>
          {/* Route */}
          <div className="flex items-center gap-2 flex-wrap">
            {cities.map((city, i) => (
              <React.Fragment key={i}>
                <span className="text-xs font-medium text-ink bg-fog px-2.5 py-1 rounded-full">{city}</span>
                {i < cities.length - 1 && <span className="text-ink/30">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stops */}
        {(trip.stops ?? []).map((stop, i) => (
          <div key={stop.id ?? i} className="card">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-sky border-2 border-white shadow" />
                {i < (trip.stops.length - 1) && <div className="w-px h-5 border-l-2 border-dashed border-sky/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-base text-ink">{stop.city_name}</h3>
                {stop.arrival_date && (
                  <p className="text-xs text-ink/50 mt-0.5 flex items-center gap-1">
                    <Calendar size={11} />{stop.arrival_date} → {stop.departure_date}
                  </p>
                )}
                {stop.notes && <p className="text-xs text-ink/50 mt-1 italic">{stop.notes}</p>}
              </div>
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-ink/40 pt-2">
          Shared via{' '}
          <Link to="/" className="text-sky hover:underline">GlobeTrotter</Link>
          {' '}— your multi-city travel planner
        </p>
      </div>
    </div>
  );
}
