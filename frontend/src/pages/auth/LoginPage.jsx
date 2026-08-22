import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

function AuthInput({ label, error, ...props }) {
  const borderCls = error ? 'border-rose' : 'border-white/15';
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-1">{label}</label>
      <input
        className={'w-full bg-white/8 border ' + borderCls + ' rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all'}
        {...props}
      />
      {error && <p className="text-rose text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next') || '/dashboard';
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      const is401 = err.status === 401 || err.response?.status === 401;
      if (is401) {
        setError('password', { message: 'Invalid email or password.' });
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue planning your trips.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
          })}
        />
        <div>
          <label className="text-sm font-medium text-white/70 block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={'w-full bg-white/8 border rounded-lg px-4 py-2.5 pr-11 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all ' + (errors.password ? 'border-rose' : 'border-white/15')}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              onClick={() => setShowPw(s => !s)}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-rose text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-xs text-sky hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-white/40 text-sm mt-6">
        No account?{' '}
        <Link to="/auth/signup" className="text-sky hover:underline font-medium">Create one</Link>
      </p>
      <div className="mt-5 p-3 bg-white/5 rounded-lg text-xs text-white/40 space-y-0.5">
        <p>Demo: <span className="text-white/60">demo@globetrotter.io / Demo1234</span></p>
        <p>Admin: <span className="text-white/60">admin@globetrotter.io / Admin1234</span></p>
      </div>
    </AuthLayout>
  );
}
