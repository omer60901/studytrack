import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import PomodoroTimer from '../components/PomodoroTimer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface Summary { totalTasks: number; completedTasks: number; completionRate: number; subjects: number; }
interface Streak { streak: number; goalToday: number; }
interface SessionStats { totalMinutes: number; todayMinutes: number; weekMinutes: number; bySubject: Record<string, number>; }
interface UserProfile { level: number; xp: number; }

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2'];

const DashboardPage = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, ts, sess, prof] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/streak'),
          api.get('/tasks?limit=5&sort=dueDate&order=asc'),
          api.get('/study-sessions/stats').catch(() => ({ data: null })),
          api.get('/auth/profile').catch(() => ({ data: { user: null } }))
        ]);
        setSummary(s.data);
        setStreak(st.data);
        setTasks((ts.data.data || ts.data).slice(0, 5));
        setSessionStats(sess.data);
        setProfile(prof.data.user);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  const subjectData = sessionStats?.bySubject
    ? Object.entries(sessionStats.bySubject).map(([name, minutes]) => ({ name, minutes }))
    : [];

  const completionData = summary
    ? [{ name: 'Completed', value: summary.completedTasks }, { name: 'Remaining', value: summary.totalTasks - summary.completedTasks }]
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-900/90 p-8 shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('dashboardTitle')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t('yourStudyHub')}</h2>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
            {streak ? `${t('streak')}: ${streak.streak} ${t('days')}` : t('noStreakYet')}
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">{t('openTasks')}</p><p className="mt-3 text-3xl font-semibold text-white">{summary?.totalTasks ?? 0}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">{t('completed')}</p><p className="mt-3 text-3xl font-semibold text-white">{summary?.completedTasks ?? 0}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">{t('completionRate')}</p><p className="mt-3 text-3xl font-semibold text-white">{summary ? `${summary.completionRate}%` : '0%'}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">{t('studyToday')}</p><p className="mt-3 text-3xl font-semibold text-white">{sessionStats?.todayMinutes ?? 0}m</p></div>
          {profile && (
            <div className="rounded-3xl bg-slate-950/90 p-5">
              <p className="text-sm text-slate-400">{t('level')} {profile.level}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{profile.xp} {t('xp')}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${Math.min((profile.xp % (profile.level * 100)) / (profile.level * 100) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('taskCompletion')}</h3>
          {completionData.length > 0 && completionData[0].value > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {completionData.map((_, i) => <Cell key={i} fill={i === 0 ? '#7c3aed' : '#334155'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm py-8 text-center">{t('noDataYet')}</p>}
        </div>

        <PomodoroTimer />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-slate-900/90 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white">{t('upcomingPriorities')}</h3>
          <div className="mt-4 space-y-3">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task._id} className="rounded-2xl bg-slate-950 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="text-sm text-slate-400">{task.category} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('noDate')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : task.priority === 'low' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>{task.priority}</span>
              </div>
            )) : <p className="text-slate-400 text-sm">{t('noUpcomingTasks')}</p>}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white">{t('weeklyStats')}</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">{t('thisWeek')}</p>
              <p className="text-2xl font-bold text-white">{sessionStats?.weekMinutes ?? 0} {t('min')}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">{t('allTime')}</p>
              <p className="text-2xl font-bold text-white">{sessionStats?.totalMinutes ?? 0} {t('min')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
