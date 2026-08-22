
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Map, ArrowLeft } from 'lucide-react';
import * as api from '../api/index.js';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { is_public: false } });

  const mutation = useMutation({
    mutationFn: api.createTrip,
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created! Start adding stops.');
      navigate('/trips/' + trip.id + '/builder');
    },
    onError: () => toast.error('Failed to create trip. Please try again.'),
  });

  const onSubmit = (data) => mutation.mutate({
    ...data,
    budget_threshold: data.budget_threshold ? Number(data.budget_threshold) : null,
  });

  const labelCls = "block text-sm font-medium text-ink/80 mb-1";
  const inputCls = "w-full border border-fog-dark rounded-lg px-4 py-2.5 text-ink placeholder:text-ink/40 bg-white focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all text-sm";
  const errCls = "text-rose text-xs mt-1";

  return (
    <div className="max-w-xl animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 bg-sky/10 rounded-xl flex items-center justify-center">
          <Map size={20} className="text-sky" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Plan a New Trip</h1>
          <p className="text-sm text-ink/50">Give your adventure a name and some dates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        {/* Trip name */}
        <div>
          <label className={labelCls}>Trip Name *</label>
          <input
            type="text"
            placeholder="e.g. Europe Summer 2026"
            className={inputCls + (errors.name ? ' border-rose' : '')}
            {...register('name', { required: 'Trip name is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
          />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date</label>
            <input
              type="date"
              className={inputCls}
              {...register('start_date')}
            />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input
              type="date"
              className={inputCls}
              {...register('end_date')}
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className={labelCls}>Budget Threshold (USD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 5000"
              className={inputCls + ' pl-7'}
              {...register('budget_threshold', { min: { value: 0, message: 'Must be positive' } })}
            />
          </div>
          {errors.budget_threshold && <p className={errCls}>{errors.budget_threshold.message}</p>}
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between p-4 bg-fog rounded-xl">
          <div>
            <p className="text-sm font-medium text-ink">Make trip public</p>
            <p className="text-xs text-ink/50">Share a read-only link with anyone</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register('is_public')} />
            <div className="w-11 h-6 bg-fog-dark rounded-full peer peer-checked:bg-sky after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending} className="flex-1">
            {mutation.isPending ? 'Creating…' : 'Create Trip & Add Stops →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
