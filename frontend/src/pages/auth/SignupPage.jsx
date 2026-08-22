import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email, password, name }) => {
    try {
      await signup(email, password, name);
      toast.success('Account created! Welcome to GlobeTrotter.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const is409 = err.status === 409 || err.response?.status === 409;
      if (is409) {
        setError('email', { message: 'This email is already registered.' });
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const fieldCls = (err) =>
    'w-full bg-white/8 border rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all ' +
    (err ? 'border-rose' : 'border-white/15');

  return (
    <AuthLayout title="Create your account" subtitle="Start planning your perfect multi-city adventure.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white/70 block mb-1">Full Name</label>
          <input
            type="text" placeholder="Priya Sharma" autoComplete="name"
            className={fieldCls(errors.name)}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-rose text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-white/70 block mb-1">Email</label>
          <input
            type="email" placeholder="you@example.com" autoComplete="email"
            className={fieldCls(errors.email)}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
            })}
          />
          {errors.email && <p className="text-rose text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-white/70 block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 digit"
              autoComplete="new-password"
              className={fieldCls(errors.password) + ' pr-11'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                validate: v => (/[A-Z]/.test(v) && /[0-9]/.test(v)) || 'Must contain an uppercase letter and a digit',
              })}
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
        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
      <p className="text-center text-white/40 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-sky hover:underline font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
