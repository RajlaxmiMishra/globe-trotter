
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, MapPin, Activity, Globe } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

function DayBlock({ day }) {
  return (
    <div className="border-l-2 border-dashed border-sky/30 pl-4 pb-4 last:pb-0">
      <div className="relative">
        <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-sky border-2 border-white shadow" />
        <p className="text-xs font-semibold text-sky uppercase tracking-wide mb-2">Day {day.day_number} — {day.date}</p>
        <h3 className="font-display text-base font-semibold text-ink mb-1">{day.city_name}</h3>
        <div className="space-y-1.5">
          {(day.activities || []).map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-ink/70 bg-fog rounded-lg px-3 py-2">
              <Activity size={13} className="text-sand shrink-0" />
              <span>{a.name}</span>
              {a.cost && <span className="ml-auto text-xs text-mint font-medium">${a.cost}</span>}
            </div>
          ))}
          {(!day.activities || day.activities.length === 0) && (
            <p className="text-xs text-ink/40 italic">Free day — no activities planned</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => api.getItinerary(id),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.getTrip(id),
  });

  const days = itinerary?.days ?? [];
  const totalDays = days.length;
  const cities = [...new Set(days.map(d => d.city_name))];

  return (
    <div className="max-w-xl animate-fade-in">
      <button onClick={() => navigate('/trips/' + id + '/builder')} className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Builder
      </button>

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Trip header */}
          <div className="card mb-6">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">{trip?.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-ink/60">
              {trip?.start_date && (
                <span className="flex items-center gap-1"><Calendar size={12} />{trip.start_date} → {trip.end_date}</span>
              )}
              <span className="flex items-center gap-1"><MapPin size={12} />{cities.length} cities</span>
              <span className="flex items-center gap-1"><Calendar size={12} />{totalDays} days total</span>
              {trip?.is_public && <Badge color="sky">Public</Badge>}
            </div>
            {/* City route */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {cities.map((city, i) => (
                <React.Fragment key={i}>
                  <span className="text-xs font-medium text-ink bg-fog px-2.5 py-1 rounded-full">{city}</span>
                  {i < cities.length - 1 && <span className="text-ink/30 text-sm">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Day-by-day */}
          <div className="card">
            <h2 className="font-semibold text-ink mb-5">Day-by-Day Itinerary</h2>
            <div className="space-y-0">
              {days.length === 0 ? (
                <p className="text-sm text-ink/50 italic">No itinerary generated yet. Add stops and activities in the builder.</p>
              ) : (
                days.map(d => <DayBlock key={d.day_number} day={d} />)
              )}
            </div>
          </div>

          {/* Budget summary if available */}
          {itinerary?.total_cost != null && (
            <div className="card mt-4 flex items-center gap-3">
              <DollarSign size={20} className="text-mint" />
              <div>
                <p className="text-sm text-ink/60">Estimated Total</p>
                <p className="font-bold text-lg text-ink">${itinerary.total_cost.toLocaleString()}</p>
              </div>
              <Link to={'/trips/' + id + '/budget'} className="ml-auto text-sm text-sky hover:underline">
                Full breakdown →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
