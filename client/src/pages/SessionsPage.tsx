import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Spinner from '../components/Spinner';

interface StudySession {
  _id: string;
  userId: string;
  duration: number;
  focusArea?: string;
  pomodoros?: number;
  notes?: string;
  mood?: string;
  completedAt?: string;
  createdAt: string;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/study-sessions');
      setSessions(response.data.data || response.data);
    } catch {
      toast.show(t('sessionFailedLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm(t('deleteSessionConfirm'))) return;
    try {
      await api.delete(`/study-sessions/${id}`);
      setSessions((current) => current.filter((s) => s._id !== id));
      toast.show(t('sessionDeleted'), 'success');
    } catch {
      toast.show(t('sessionFailedDelete'), 'error');
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.createdAt) >= weekAgo).length;
  const sessionsToday = sessions.filter((s) => new Date(s.createdAt).toISOString().split('T')[0] === todayStr).length;

  return (
    <div className="space-y-6">
      <section className="card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('sessionsTitle')}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t('sessionsTitle')}</h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t('sessionsDesc')}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('totalHours')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{totalHours}h</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('thisWeek')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionsThisWeek}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('today')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionsToday}</p>
        </div>
      </section>

      <section className="card">
        {loading ? (
          <Spinner />
        ) : sessions.length === 0 ? (
          <p className="text-slate-400 text-center py-8">{t('noSessionsYet')}</p>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {sessions.map((session) => (
              <div key={session._id} className="rounded-3xl bg-slate-950 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-white">
                        {new Date(session.completedAt || session.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span>{t('sessionDuration')}: {session.duration} min</span>
                      {session.focusArea && <span>{t('sessionSubject')}: {session.focusArea}</span>}
                      {session.pomodoros != null && <span>{t('sessionPomodoros')}: {session.pomodoros}</span>}
                      {session.mood && <span>{t('sessionMood')}: {session.mood}</span>}
                    </div>
                    {session.notes && <p className="mt-2 text-sm text-slate-500">{session.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteSession(session._id)}
                    className="rounded-2xl bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-400"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SessionsPage;
