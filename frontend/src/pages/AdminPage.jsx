
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Map, Globe, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as api from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';

const COLORS = ['#2E86C1', '#F5A623', '#27AE60', '#E74C3C', '#8E44AD'];

export default function AdminPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: api.getAnalytics,
  });

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>;
  if (!analytics) return <div className="text-ink/50 text-center pt-20">No analytics data available.</div>;

  const stats = [
    { label: 'Total Users',    value: analytics.total_users ?? 0,         icon: Users,     color: 'text-sky' },
    { label: 'Total Trips',    value: analytics.total_trips ?? 0,         icon: Map,       color: 'text-sand' },
    { label: 'Public Trips',   value: analytics.public_trips ?? 0,        icon: Globe,     color: 'text-mint' },
    { label: 'Avg Trips/User', value: (analytics.avg_trips_per_user ?? 0).toFixed(1), icon: TrendingUp, color: 'text-ink/60' },
  ];

  const cityData = (analytics.top_cities ?? []).slice(0, 5);
  const tripsByMonth = analytics.trips_by_month ?? [];

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Analytics Dashboard</h1>
        <p className="text-ink/50 text-sm mt-0.5">Admin view — platform-wide stats</p>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trips by month */}
        {tripsByMonth.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-ink text-sm mb-4">Trips Created by Month</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tripsByMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#1A2E44', opacity: 0.5 }} />
                <YAxis tick={{ fontSize: 11, fill: '#1A2E44', opacity: 0.5 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(26,46,68,0.12)' }} />
                <Bar dataKey="count" fill="#2E86C1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top cities */}
        {cityData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-ink text-sm mb-4">Top Planned Cities</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={cityData}
                  dataKey="trip_count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {cityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top activities */}
      {(analytics.top_activities ?? []).length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-ink text-sm mb-4">Most Used Activities</h2>
          <div className="space-y-2">
            {analytics.top_activities.slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-ink/40 w-5 text-right">{i + 1}</span>
                <div className="flex-1 h-2 bg-fog-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sand rounded-full"
                    style={{ width: Math.max(4, Math.round((a.usage_count / (analytics.top_activities[0]?.usage_count || 1)) * 100)) + '%' }}
                  />
                </div>
                <span className="text-sm text-ink flex-1 truncate">{a.name}</span>
                <span className="text-xs font-semibold text-ink/60">{a.usage_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active users note */}
      <p className="text-xs text-ink/40 text-center">
        Active users (last 30 days): <strong className="text-ink/60">{analytics.active_users ?? 0}</strong>
      </p>
    </div>
  );
}
