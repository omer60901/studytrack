import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalMinutes: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  createdAt: string;
  sessionCount: number;
  totalMinutes: number;
}

const AdminPage = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.show(t('failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(t('deleteUserConfirm'))) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (stats) {
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      }
      toast.show(t('userDeleted'), 'success');
    } catch {
      toast.show(t('userFailedDelete'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('adminTitle')}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t('adminTitle')}</h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t('adminDesc')}</p>
        </div>
      </section>

      {stats && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-sm text-slate-400">{t('totalUsers')}</p>
            <p className="mt-2 text-4xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-400">{t('totalSessions')}</p>
            <p className="mt-2 text-4xl font-bold text-white">{stats.totalSessions}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-400">{t('totalMinutes')}</p>
            <p className="mt-2 text-4xl font-bold text-white">{stats.totalMinutes}</p>
          </div>
        </section>
      )}

      <section className="card">
        <h3 className="text-lg font-semibold text-white">{t('userManagement')}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                <th className="pb-3 pr-4">{t('name')}</th>
                <th className="pb-3 pr-4">{t('email')}</th>
                <th className="pb-3 pr-4">{t('role')}</th>
                <th className="pb-3 pr-4">{t('level')}</th>
                <th className="pb-3 pr-4">{t('sessionsCount')}</th>
                <th className="pb-3 pr-4">{t('sessionDuration')}</th>
                <th className="pb-3">{t('joined')}</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/50">
                  <td className="py-3 pr-4 font-medium text-white">{u.name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${u.name.toLowerCase() === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-700 text-slate-300'}`}>
                      {u.name.toLowerCase() === 'admin' ? t('adminRole') : t('userRole')}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{u.level}</td>
                  <td className="py-3 pr-4">{u.sessionCount}</td>
                  <td className="py-3 pr-4">{u.totalMinutes} {t('min')}</td>
                  <td className="py-3 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-8 text-center text-slate-400">{t('noDataYet')}</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
