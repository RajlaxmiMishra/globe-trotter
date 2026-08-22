
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, MapPin, Activity } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';

function DayBlock({ dayNumber, date, cityName, activities }) {
  return (
    <div className="border-l-2 border-dashed border-sky/30 pl-4 pb-4 last:pb-0">
      <div className="relative">
        <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-sky border-2 border-white shadow" />
        <p className="text-xs font-semibold text-sky uppercase tracking-wide mb-1">
          Day {dayNumber} — {String(date)}
        </p>
        <h3 className="font-display text-base font-semibold text-ink mb-2">{cityName}</h3>
        <div className="space-y-1.5">
          {activities && activities.length > 0 ? (
            activities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-ink/70 bg-fog rounded-lg px-3 py-2">
                <Activity size={13} className="text-sand shrink-0" />
                <span className="flex-1 truncate">{a.name}</span>
                {a.scheduled_time && (
                  <span className="text-xs text-ink/40">{a.scheduled_time}</span>
                )}
                {(a.effective_cost ?? a.cost) != null && Number(a.effective_cost ?? a.cost) > 0 && (
                  <span className="text-xs font-medium text-mint shrink-0">
                    ${Number(a.effective_cost ?? a.cost).toFixed(0)}
                  </span>
                )}
              </div>
            ))
          ) : (
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

  // Flatten stops → day-by-day list
  const allDays = [];
  let dayNum = 1;
  (itinerary?.stops ?? []).forEach(stop => {
    (stop.days ?? []).forEach(day => {
      allDays.push({
        dayNumber: dayNum++,
        date: day.date,
        cityName: stop.city,
        country: stop.country,
        activities: day.activities ?? [],
      });
    });
  });

  const uniqueCities = [...new Map((itinerary?.stops ?? []).map(s => [s.city, s])).keys()];

  return (
    <div className="max-w-xl animate-fade-in">
      <button
        onClick={() => navigate('/trips/' + id + '/builder')}
        className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Builder
      </button>

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="card mb-6">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              {itinerary?.trip?.name ?? trip?.name}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs text-ink/60">
              {trip?.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />{trip.start_date} → {trip.end_date}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin size={12} />{uniqueCities.length} cit{uniqueCities.length !== 1 ? 'ies' : 'y'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />{allDays.length} days total
              </span>
              {trip?.is_public && <Badge color="sky">Public</Badge>}
            </div>

            {/* City route */}
            {uniqueCities.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {uniqueCities.map((city, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs font-medium text-ink bg-fog px-2.5 py-1 rounded-full">{city}</span>
                    {i < uniqueCities.length - 1 && <span className="text-ink/30 text-sm">→</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-ink mb-5">Day-by-Day Itinerary</h2>
            <div className="space-y-0">
              {allDays.length === 0 ? (
                <p className="text-sm text-ink/50 italic">
                  No itinerary yet. Add stops and activities in the builder.
                </p>
              ) : (
                allDays.map(d => (
                  <DayBlock
                    key={d.dayNumber}
                    dayNumber={d.dayNumber}
                    date={d.date}
                    cityName={d.cityName}
                    activities={d.activities}
                  />
                ))
              )}
            </div>
          </div>

          <div className="card mt-4 flex items-center gap-3">
            <DollarSign size={20} className="text-mint" />
            <div>
              <p className="text-sm text-ink/60">View full cost breakdown</p>
            </div>
            <Link to={'/trips/' + id + '/budget'} className="ml-auto text-sm text-sky hover:underline">
              Budget →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
