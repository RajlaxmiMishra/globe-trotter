import React from 'react';
import { Globe } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 bg-gradient-to-br from-ink to-ink-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: (i + 1) * 120 + 'px',
                height: (i + 1) * 120 + 'px',
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-sky rounded-xl flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">GlobeTrotter</span>
        </div>
        <div className="relative space-y-2">
          {['Paris → Rome', 'Rome → Barcelona', 'Barcelona → Lisbon'].map((route, i, arr) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-sky" />
                {i < arr.length - 1 && <div className="w-px h-7 border-l-2 border-dashed border-white/25" />}
              </div>
              <span className="text-white/70 text-sm font-medium">{route}</span>
            </div>
          ))}
          <p className="text-white/40 text-xs mt-4 pl-5">Plan your multi-city journey, one stop at a time.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-sky rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-white">GlobeTrotter</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-white/50 text-sm mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
