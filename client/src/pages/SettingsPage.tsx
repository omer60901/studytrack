import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import ImportExport from '../components/ImportExport';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [studyGoal, setStudyGoal] = useState(2);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [studyReminder, setStudyReminder] = useState(true);
  const [deadlineReminder, setDeadlineReminder] = useState(true);
  const [reviewReminder, setReviewReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [savingReminders, setSavingReminders] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.show(t('passwordRequired'), 'error');
      return;
    }
    setDeletingAccount(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      toast.show(t('accountDeleted'), 'success');
      logout();
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('accountFailedDelete');
      toast.show(msg, 'error');
    } finally {
      setDeletingAccount(false);
      setDeletePassword('');
    }
  };

  const handleSaveReminders = async () => {
    setSavingReminders(true);
    try {
      const response = await api.patch('/auth/profile', {
        reminderPreferences: { studyReminder, deadlineReminder, reviewReminder, reminderTime }
      });
      updateUser(response.data.user);

      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      toast.show(t('remindersSaved'), 'success');
    } catch (err: any) {
      toast.show(t('profileFailedUpdate'), 'error');
    } finally {
      setSavingReminders(false);
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

      <section className="card">
        <h3 className="text-lg font-semibold text-white">{t('notificationPreferences')}</h3>
        <p className="text-sm text-slate-400 mt-1">{t('notificationPreferencesDesc')}</p>
        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={studyReminder}
              onChange={(e) => setStudyReminder(e.target.checked)}
              className="accent-violet-500 w-4 h-4"
            />
            <div>
              <p className="text-sm text-white">{t('studyReminder')}</p>
              <p className="text-xs text-slate-400">{t('studyReminderDesc')}</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deadlineReminder}
              onChange={(e) => setDeadlineReminder(e.target.checked)}
              className="accent-violet-500 w-4 h-4"
            />
            <div>
              <p className="text-sm text-white">{t('deadlineReminder')}</p>
              <p className="text-xs text-slate-400">{t('deadlineReminderDesc')}</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reviewReminder}
              onChange={(e) => setReviewReminder(e.target.checked)}
              className="accent-violet-500 w-4 h-4"
            />
            <div>
              <p className="text-sm text-white">{t('reviewReminder')}</p>
              <p className="text-xs text-slate-400">{t('reviewReminderDesc')}</p>
            </div>
          </label>
          <label className="block text-sm text-slate-300">
            {t('reminderTime')}
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="input-field mt-1"
            />
          </label>
          <button onClick={handleSaveReminders} className="button-primary" disabled={savingReminders}>
            {savingReminders ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </section>

      <ImportExport />

      <section className="card border-rose-500/30">
        <h3 className="text-lg font-semibold text-rose-400">{t('dangerZone')}</h3>
        <p className="text-sm text-slate-400 mt-2">{t('deleteAccountDesc')}</p>
        <div className="mt-4 flex gap-3 items-end">
          <label className="block text-sm text-slate-300 flex-1">
            {t('confirmPassword')}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="input-field"
              placeholder={t('enterPasswordToDelete')}
            />
          </label>
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount || !deletePassword}
            className="rounded-2xl bg-rose-500 px-6 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
          >
            {deletingAccount ? t('deleting') : t('deleteAccount')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
