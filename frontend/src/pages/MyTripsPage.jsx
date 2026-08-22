
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Calendar, MapPin, Trash2, Eye, ArrowRight, Search } from 'lucide-react';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import toast from 'react-hot-toast';

function MiniRoute({ count }) {
  const dots = Math.min(count || 0, 6);
  if (!dots) return null;
  return (
    <div className="flex items-center gap-1 mt-3">
      {[...Array(dots)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="w-2 h-2 rounded-full bg-sky shrink-0" />
          {i < dots - 1 && <div className="flex-1 h-px border-t-2 border-dashed border-sky/30" />}
        </React.Fragment>
      ))}
      {count > 6 && <span className="text-xs text-ink/40 ml-1">+{count - 6}</span>}
    </div>
  );
}

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const isPast = trip.end_date && new Date(trip.end_date) < new Date();
  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 group animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-display text-base font-semibold text-ink group-hover:text-sky transition-colors cursor-pointer"
              onClick={() => navigate('/trips/' + trip.id + '/builder')}
            >
              {trip.name}
            </h3>
            {trip.is_public && <Badge color="sky">Public</Badge>}
            {isPast && <Badge color="ink">Completed</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-ink/50 flex-wrap">
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />{trip.start_date} → {trip.end_date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={11} />{trip.stop_count || 0} stops
            </span>
          </div>
          {trip.budget_threshold && (
            <p className="text-xs text-sand mt-1">Budget: ${trip.budget_threshold.toLocaleString()}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => navigate('/trips/' + trip.id + '/view')}
            className="p-2 rounded-lg text-ink/40 hover:bg-fog hover:text-sky transition-all"
            title="View itinerary"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate('/trips/' + trip.id + '/builder')}
            className="p-2 rounded-lg text-ink/40 hover:bg-sky/10 hover:text-sky transition-all"
            title="Edit trip"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onDelete(trip)}
            className="p-2 rounded-lg text-ink/40 hover:bg-rose/10 hover:text-rose transition-all"
            title="Delete trip"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <MiniRoute count={trip.stop_count} />
    </div>
  );
}

export default function MyTripsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tripToDelete, setTripToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.listTrips({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted.');
      setTripToDelete(null);
    },
    onError: () => toast.error('Failed to delete trip.'),
  });

  const trips = (data?.items ?? []).filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My Trips</h1>
          <p className="text-ink/50 text-sm mt-0.5">{data?.total ?? 0} trip{data?.total !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => navigate('/trips/new')} className="flex items-center gap-2 shrink-0">
          <Plus size={17} /> New Trip
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          placeholder="Search trips…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-fog-dark rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Map}
          title={search ? 'No trips match your search' : 'No trips yet'}
          description={search ? 'Try a different search term.' : 'Create your first multi-city adventure.'}
          action={!search && (
            <Button onClick={() => navigate('/trips/new')} className="flex items-center gap-2">
              <Plus size={15} /> Plan a Trip
            </Button>
          )}
        />
      ) : (
        <div className="space-y-3">
          {trips.map(t => (
            <TripCard key={t.id} trip={t} onDelete={setTripToDelete} />
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal
        open={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        title="Delete Trip"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTripToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(tripToDelete.id)}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70">
          Are you sure you want to delete <strong className="text-ink">{tripToDelete?.name}</strong>?
          This will remove all stops and activities permanently.
        </p>
      </Modal>
    </div>
  );
}
