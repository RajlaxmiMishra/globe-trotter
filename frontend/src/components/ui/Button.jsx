import React from 'react';
export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';
  const sz   = size === 'sm' ? '!px-3 !py-1.5 !text-sm' : size === 'lg' ? '!px-7 !py-3 !text-base' : '';
  return <button className={base + ' ' + sz + ' ' + className} {...props}>{children}</button>;
}
