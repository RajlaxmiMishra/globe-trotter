import React, { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  const borderCls = error ? 'border-rose focus:ring-rose/30' : '';
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-ink/80">{label}</label>}
      <input
        ref={ref}
        className={'input-field ' + borderCls + ' ' + className}
        {...props}
      />
      <ErrorMessage message={error} />
    </div>
  );
});
export default Input;
