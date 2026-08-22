import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import * as api from '../../api/index.js';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    await api.forgotPassword({ email });
    setSent(true);
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email and we'll send a reset link.">
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <CheckCircle size={48} className="text-mint" />
          <p className="text-white/80 text-sm leading-relaxed">
            If that email exists in our system, a reset link is on its way. Check your inbox.
          </p>
          <Link to="/auth/login" className="text-sky text-sm hover:underline font-medium">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={'w-full bg-white/8 border rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all ' + (errors.email ? 'border-rose' : 'border-white/15')}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
            />
            {errors.email && <p className="text-rose text-xs mt-1">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
          </Button>
          <p className="text-center">
            <Link to="/auth/login" className="text-sky text-sm hover:underline">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
