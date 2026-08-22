import React from 'react';
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {Icon && (
        <div className="w-14 h-14 bg-fog-dark rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-ink/30" />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink/50 mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
