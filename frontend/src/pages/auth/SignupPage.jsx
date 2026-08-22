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

  const onSubmit = async (data) => {
    try {
      await signup({
        email: data.email,
        password: data.password,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone_number: data.phone_number?.trim() || null,
        city: data.city?.trim() || null,
        country: data.country?.trim() || null,
        photo_url: data.photo_url?.trim() || null,
        additional_info: data.additional_info?.trim() || null,
      });
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

  const labelCls = 'text-sm font-medium text-white/70 block mb-1';

  return (
    <AuthLayout title="Create your account" subtitle="Start planning your perfect multi-city adventure.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First Name *</label>
            <input
              type="text" placeholder="Raj" autoComplete="given-name"
              className={fieldCls(errors.first_name)}
              {...register('first_name', { required: 'First name is required' })}
            />
            {errors.first_name && <p className="text-rose text-xs mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input
              type="text" placeholder="Sharma" autoComplete="family-name"
              className={fieldCls(errors.last_name)}
              {...register('last_name', { required: 'Last name is required' })}
            />
            {errors.last_name && <p className="text-rose text-xs mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Email *</label>
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
          <label className={labelCls}>Phone Number</label>
          <input
            type="tel" placeholder="+91 98765 43210" autoComplete="tel"
            className={fieldCls(errors.phone_number)}
            {...register('phone_number')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text" placeholder="Mumbai" autoComplete="address-level2"
              className={fieldCls(errors.city)}
              {...register('city')}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text" placeholder="India" autoComplete="country-name"
              className={fieldCls(errors.country)}
              {...register('country')}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Photo URL</label>
          <input
            type="url" placeholder="https://example.com/photo.jpg"
            className={fieldCls(errors.photo_url)}
            {...register('photo_url')}
          />
        </div>

        <div>
          <label className={labelCls}>Additional Information</label>
          <textarea
            rows={3}
            placeholder="Tell us about your travel preferences, dietary needs, accessibility requirements…"
            className={fieldCls(errors.additional_info) + ' resize-none'}
            {...register('additional_info')}
          />
        </div>

        <div>
          <label className={labelCls}>Password *</label>
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
