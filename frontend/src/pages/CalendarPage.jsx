
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Activity } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CalendarGrid({ weeks, eventMap }) {
  return (
    <div className="card overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-ink/40 py-2">{d}</div>)}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((date, di) => {
              const key = date ? date.toISOString().split('T')[0] : null;
              const events = key ? (eventMap[key] || []) : [];
              return (
                <div
                  key={di}
                  className={'min-h-[70px] p-1.5 border-t border-fog-dark ' + (!date ? 'opacity-0' : '')}
                >
                  {date && (
                    <>
                      <p className={'text-xs font-medium mb-1 text-center ' + (events.length ? 'text-sky' : 'text-ink/40')}>
                        {date.getDate()}
                      </p>
                      {events.map((e, i) => (
                        <div key={i} className={'text-xs rounded px-1.5 py-0.5 mb-0.5 truncate ' + (e.type === 'arrival' ? 'bg-sky/15 text-sky' : e.type === 'departure' ? 'bg-rose/10 text-rose' : 'bg-sand/15 text-sand')}>
                          {e.label}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: calendar, isLoading } = useQuery({
    queryKey: ['calendar', id],
    queryFn: () => api.getCalendar(id),
  });
  const { data: trip } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.getTrip(id),
  });

  const events = calendar?.events ?? [];

  // Build event map
  const eventMap = {};
  events.forEach(e => {
    if (!eventMap[e.date]) eventMap[e.date] = [];
    eventMap[e.date].push(e);
  });

  // Build weeks for the trip's month
  const startDate = trip?.start_date ? new Date(trip.start_date) : new Date();
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks = [];
  let week = Array(firstDay.getDay()).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => navigate('/trips/' + id + '/builder')} className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Builder
      </button>

      <h1 className="font-display text-2xl font-bold text-ink mb-1">Trip Calendar</h1>
      {trip && <p className="text-sm text-ink/50 mb-6">{trip.name}</p>}

      {isLoading ? (
        <div className="flex justify-center pt-16"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Calendar size={16} className="text-sky" />
            {MONTHS[month]} {year}
          </div>

          <CalendarGrid weeks={weeks} eventMap={eventMap} />

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-ink/60">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky/20" /> Arrival</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose/10" /> Departure</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sand/20" /> Activity</span>
          </div>

          {/* Event list */}
          {events.length > 0 && (
            <div className="card space-y-2">
              <h2 className="font-semibold text-sm text-ink mb-3">Events</h2>
              {events.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-ink/40 w-24 shrink-0">{e.date}</span>
                  <div className={'w-2 h-2 rounded-full shrink-0 ' + (e.type === 'arrival' ? 'bg-sky' : e.type === 'departure' ? 'bg-rose' : 'bg-sand')} />
                  <span className="text-ink/70">{e.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
