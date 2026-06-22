import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ImportExport from '../components/ImportExport';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [studyGoal, setStudyGoal] = useState(2);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch('/auth/profile', { name, studyGoal });
      updateUser(response.data.user);
      toast.show('Profile updated!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update profile.';
      toast.show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.show('New password must be at least 8 characters.', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.show('Password updated!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to change password.';
      toast.show(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Settings</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Manage your account</h2>
          <p className="mt-3 max-w-2xl text-slate-400">Update your profile information and change your password.</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <h3 className="text-lg font-semibold text-white">Profile</h3>
          <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Email
              <input
                value={user?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Daily study goal (hours)
              <input
                type="number"
                min={1}
                max={12}
                value={studyGoal}
                onChange={(e) => setStudyGoal(Number(e.target.value))}
                className="input-field"
              />
            </label>
            <button className="button-primary w-full justify-center" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white">Change password</h3>
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block text-sm text-slate-300">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="input-field"
              />
            </label>
            <button className="button-primary w-full justify-center" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </section>

      <ImportExport />
    </div>
  );
};

export default SettingsPage;
