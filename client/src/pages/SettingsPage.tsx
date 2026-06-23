import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import ImportExport from '../components/ImportExport';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

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
      toast.show(t('profileUpdated'), 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('profileFailedUpdate');
      toast.show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.show(t('passwordTooShortMsg'), 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.show(t('passwordUpdated'), 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('passwordFailedUpdate');
      toast.show(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('settingsTitle')}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t('manageAccount')}</h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t('settingsDesc')}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <h3 className="text-lg font-semibold text-white">{t('profile')}</h3>
          <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              {t('name')}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block text-sm text-slate-300">
              {t('email')}
              <input
                value={user?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </label>
            <label className="block text-sm text-slate-300">
              {t('dailyStudyGoal')}
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
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white">{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              {t('currentPassword')}
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block text-sm text-slate-300">
              {t('newPassword')}
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
              {changingPassword ? t('updating') : t('updatePassword')}
            </button>
          </form>
        </div>
      </section>

      <ImportExport />
    </div>
  );
};

export default SettingsPage;
