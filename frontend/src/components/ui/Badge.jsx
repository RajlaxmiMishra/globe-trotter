import React from 'react';
export default function Badge({ color = 'sky', children }) {
  const colors = {
    sky:  'bg-sky/10 text-sky',
    mint: 'bg-mint/10 text-mint',
    sand: 'bg-sand/10 text-sand',
    rose: 'bg-rose/10 text-rose',
    ink:  'bg-ink/10 text-ink',
  };
  const cls = colors[color] || colors.sky;
  return (
    <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + cls}>
      {children}
    </span>
  );
}
