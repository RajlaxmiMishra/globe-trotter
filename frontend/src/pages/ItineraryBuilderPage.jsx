
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, Plus, Trash2, Eye, DollarSign, Calendar,
  Globe, Search, MapPin, Activity, X
} from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import toast from 'react-hot-toast';

const inputCls = "w-full border border-fog-dark rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 bg-white focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all";

function AddStopModal({ tripId, trip, open, onClose }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const { data: cityData } = useQuery({
    queryKey: ['cities', citySearch],
    queryFn: () => api.searchCities({ q: citySearch }),
    enabled: citySearch.length >= 1,
  });

  const mutation = useMutation({
    mutationFn: (data) => api.addStop(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Stop added!');
      reset();
      setCitySearch('');
      setSelectedCity(null);
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Failed to add stop.'),
  });

  const cities = cityData?.items ?? [];

  const onSubmit = (data) => {
    if (!selectedCity) {
      toast.error('Please select a city from the dropdown.');
      return;
    }
    mutation.mutate({
      city_id: selectedCity.id,
      start_date: data.start_date,
      end_date: data.end_date,
      order_index: 0,
    });
  };

  const handleClose = () => {
    reset();
    setCitySearch('');
    setSelectedCity(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add a Stop"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button form="add-stop-form" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding…' : 'Add Stop'}
          </Button>
        </>
      }
    >
      <form id="add-stop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink/80 block mb-1">City *</label>
          {selectedCity ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-sky/5 border border-sky/30 rounded-lg">
              <Globe size={14} className="text-sky shrink-0" />
              <span className="text-sm text-ink flex-1">{selectedCity.name}, {selectedCity.country}</span>
              <button
                type="button"
                onClick={() => { setSelectedCity(null); setCitySearch(''); }}
                className="text-ink/30 hover:text-rose transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                placeholder="Type to search cities…"
                className={inputCls + ' pl-9'}
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
              />
              {cities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 border border-fog-dark rounded-lg overflow-hidden bg-white shadow-card">
                  {cities.slice(0, 6).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCity(c); setCitySearch(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-fog text-left transition-colors"
                    >
                      <Globe size={13} className="text-sky shrink-0" />
                      <span className="text-sm text-ink">{c.name}</span>
                      <span className="text-xs text-ink/40 ml-auto">{c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink/80 block mb-1">Start Date *</label>
            <input
              type="date"
              className={inputCls + (errors.start_date ? ' border-rose' : '')}
              min={trip?.start_date}
              max={trip?.end_date}
              {...register('start_date', { required: 'Required' })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/80 block mb-1">End Date *</label>
            <input
              type="date"
              className={inputCls + (errors.end_date ? ' border-rose' : '')}
              min={trip?.start_date}
              max={trip?.end_date}
              {...register('end_date', { required: 'Required' })}
            />
          </div>
        </div>
        {trip?.start_date && (
          <p className="text-xs text-ink/40">Trip range: {trip.start_date} → {trip.end_date}</p>
        )}
      </form>
    </Modal>
  );
}

function StopCard({ stop, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const { data: activitiesData } = useQuery({
    queryKey: ['stop-activities', stop.id],
    queryFn: () => api.getStopActivities(stop.id),
    enabled: expanded,
  });

  const activities = activitiesData ?? [];

  const days = stop.start_date && stop.end_date
    ? Math.ceil((new Date(stop.end_date) - new Date(stop.start_date)) / 86400000) + 1
    : null;

  return (
    <div className="card animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
          <div className="w-3 h-3 rounded-full bg-sky border-2 border-white shadow" />
          <div className="w-px flex-1 min-h-[20px] border-l-2 border-dashed border-sky/30" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-ink">
                {stop.city?.name ?? stop.city_id}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-ink/50 flex-wrap">
                {stop.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {stop.start_date} → {stop.end_date}
                    {days && <Badge color="sky">{days}d</Badge>}
                  </span>
                )}
                {stop.city?.country && (
                  <span className="flex items-center gap-1">
                    <Globe size={11} />{stop.city.country}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setExpanded(s => !s)}
                className="p-1.5 rounded-lg text-ink/40 hover:bg-sky/10 hover:text-sky transition-all text-xs flex items-center gap-1"
              >
                <Activity size={14} />
                {expanded ? 'Hide' : 'Activities'}
              </button>
              <button
                onClick={() => onDelete(stop)}
                className="p-1.5 rounded-lg text-ink/40 hover:bg-rose/10 hover:text-rose transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 border-t border-fog-dark pt-3 space-y-2">
              {activities.length === 0
                ? <p className="text-xs text-ink/40 italic">No activities scheduled for this stop.</p>
                : activities.map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-xs text-ink/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-sand shrink-0" />
                    <span>{a.activity?.name ?? 'Activity'}</span>
                    <span className="text-ink/40 ml-1">{a.scheduled_date}</span>
                    {(a.cost_override ?? a.activity?.cost) != null && (
                      <span className="ml-auto text-mint font-medium">
                        ${Number(a.cost_override ?? a.activity?.cost).toFixed(0)}
                      </span>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [stopToDelete, setStopToDelete] = useState(null);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.getTrip(id),
  });
  const { data: stopsData, isLoading: stopsLoading } = useQuery({
    queryKey: ['stops', id],
    queryFn: () => api.getStops(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (stopId) => api.deleteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Stop removed.');
      setStopToDelete(null);
    },
    onError: () => toast.error('Failed to remove stop.'),
  });

  const stops = stopsData ?? [];

  if (tripLoading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <div>
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> My Trips
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{trip?.name}</h1>
            {trip?.start_date && (
              <p className="text-sm text-ink/50 mt-0.5 flex items-center gap-1">
                <Calendar size={13} /> {trip.start_date} → {trip.end_date}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={'/trips/' + id + '/budget'}>
              <Button variant="secondary" className="flex items-center gap-1.5 !px-3 !py-2 text-sm">
                <DollarSign size={14} /> Budget
              </Button>
            </Link>
            <Link to={'/trips/' + id + '/calendar'}>
              <Button variant="secondary" className="flex items-center gap-1.5 !px-3 !py-2 text-sm">
                <Calendar size={14} /> Calendar
              </Button>
            </Link>
            <Link to={'/trips/' + id + '/view'}>
              <Button variant="secondary" className="flex items-center gap-1.5 !px-3 !py-2 text-sm">
                <Eye size={14} /> View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">
            Route <span className="text-ink/40 font-normal text-sm">({stops.length} stop{stops.length !== 1 ? 's' : ''})</span>
          </h2>
          <Button onClick={() => setAddStopOpen(true)} className="flex items-center gap-1.5 !px-3 !py-2 text-sm">
            <Plus size={14} /> Add Stop
          </Button>
        </div>

        {stopsLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : stops.length === 0 ? (
          <div className="card text-center py-10">
            <MapPin size={32} className="mx-auto text-ink/20 mb-3" />
            <p className="font-medium text-ink/60 text-sm">No stops yet</p>
            <p className="text-xs text-ink/40 mt-1 mb-4">Add your first destination to start building the route.</p>
            <Button onClick={() => setAddStopOpen(true)} className="flex items-center gap-2 mx-auto">
              <Plus size={15} /> Add First Stop
            </Button>
          </div>
        ) : (
          stops.map(s => (
            <StopCard key={s.id} stop={s} onDelete={setStopToDelete} />
          ))
        )}
      </div>

      <AddStopModal tripId={id} trip={trip} open={addStopOpen} onClose={() => setAddStopOpen(false)} />

      <Modal
        open={!!stopToDelete}
        onClose={() => setStopToDelete(null)}
        title="Remove Stop"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStopToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(stopToDelete.id)}
            >
              {deleteMutation.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70">
          Remove <strong className="text-ink">{stopToDelete?.city?.name}</strong> from this trip?
          All activities for this stop will also be deleted.
        </p>
      </Modal>
    </div>
  );
}
