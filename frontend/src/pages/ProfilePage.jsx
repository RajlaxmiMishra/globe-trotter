
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Shield, Edit3, Check, X, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../api/index.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name ?? '' },
  });

  const mutation = useMutation({
    mutationFn: api.patchMe,
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    },
    onError: () => toast.error('Failed to save changes.'),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMe,
    onSuccess: () => {
      toast.success('Account deleted.');
      logout();
      navigate('/auth/login');
    },
    onError: () => toast.error('Failed to delete account.'),
  });

  return (
    <div className="max-w-lg animate-fade-in space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Profile & Settings</h1>

      {/* Avatar + info */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky to-sky/70 flex items-center justify-center text-white text-xl font-bold font-display shrink-0">
          {user?.name?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-ink truncate">{user?.name}</p>
            {user?.role === 'admin' && <Badge color="sand">Admin</Badge>}
          </div>
          <p className="text-sm text-ink/50 truncate">{user?.email}</p>
        </div>
        <button
          onClick={() => { setEditing(e => !e); reset({ name: user?.name }); }}
          className="p-2 rounded-lg text-ink/40 hover:bg-fog hover:text-sky transition-all shrink-0"
        >
          <Edit3 size={16} />
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <form
          onSubmit={handleSubmit(d => mutation.mutate(d))}
          className="card space-y-4 animate-slide-up"
        >
          <h2 className="font-semibold text-ink text-sm">Edit Profile</h2>
          <div>
            <label className="text-sm font-medium text-ink/80 block mb-1">Display Name</label>
            <input
              type="text"
              className="w-full border border-fog-dark rounded-lg px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all"
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending} className="flex-1">
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* Account details */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-ink text-sm mb-1">Account Details</h2>
        {[
          { icon: User,   label: 'Name',   value: user?.name },
          { icon: Mail,   label: 'Email',  value: user?.email },
          { icon: Shield, label: 'Role',   value: user?.role ?? 'user' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-fog-dark last:border-0">
            <Icon size={15} className="text-ink/40 shrink-0" />
            <span className="text-xs text-ink/50 w-14 shrink-0">{label}</span>
            <span className="text-sm text-ink">{value}</span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card border border-rose/20 space-y-3">
        <h2 className="font-semibold text-rose text-sm">Danger Zone</h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-ink">Sign out</p>
            <p className="text-xs text-ink/50">End your current session</p>
          </div>
          <Button variant="secondary" onClick={() => { logout(); navigate('/auth/login'); }} className="flex items-center gap-2 !px-3 !py-2 text-sm shrink-0">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="text-xs text-ink/50">Permanently remove your data</p>
          </div>
          <Button variant="danger" onClick={() => setDeleteOpen(true)} className="flex items-center gap-2 !px-3 !py-2 text-sm shrink-0">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete my account'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70">
          This will permanently delete your account and all your trips. This action <strong>cannot be undone</strong>.
        </p>
      </Modal>
    </div>
  );
}
