import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import PomodoroTimer from '../components/PomodoroTimer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Summary { totalTasks: number; completedTasks: number; completionRate: number; subjects: number; }
interface Streak { streak: number; goalToday: number; }
interface SessionStats { totalMinutes: number; todayMinutes: number; weekMinutes: number; bySubject: Record<string, number>; }

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2'];

const DashboardPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, ts, sess] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/streak'),
          api.get('/tasks?limit=5&sort=dueDate&order=asc'),
          api.get('/study-sessions/stats').catch(() => ({ data: null }))
        ]);
        setSummary(s.data);
        setStreak(st.data);
        setTasks((ts.data.data || ts.data).slice(0, 5));
        setSessionStats(sess.data);
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
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your study hub</h2>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
            {streak ? `Streak: ${streak.streak} days` : 'No streak yet'}
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">Open tasks</p><p className="mt-3 text-3xl font-semibold text-white">{summary?.totalTasks ?? 0}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">Completed</p><p className="mt-3 text-3xl font-semibold text-white">{summary?.completedTasks ?? 0}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">Completion rate</p><p className="mt-3 text-3xl font-semibold text-white">{summary ? `${summary.completionRate}%` : '0%'}</p></div>
          <div className="rounded-3xl bg-slate-950/90 p-5"><p className="text-sm text-slate-400">Study today</p><p className="mt-3 text-3xl font-semibold text-white">{sessionStats?.todayMinutes ?? 0}m</p></div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Task completion</h3>
          {completionData.length > 0 && completionData[0].value > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {completionData.map((_, i) => <Cell key={i} fill={i === 0 ? '#7c3aed' : '#334155'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm py-8 text-center">No data yet</p>}
        </div>

        <PomodoroTimer />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-slate-900/90 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white">Upcoming priorities</h3>
          <div className="mt-4 space-y-3">
            {tasks.length > 0 ? tasks.map((t) => (
              <div key={t._id} className="rounded-2xl bg-slate-950 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="text-sm text-slate-400">{t.category} • {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : t.priority === 'low' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>{t.priority}</span>
              </div>
            )) : <p className="text-slate-400 text-sm">No upcoming tasks</p>}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white">Weekly stats</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">This week</p>
              <p className="text-2xl font-bold text-white">{sessionStats?.weekMinutes ?? 0} min</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">All time</p>
              <p className="text-2xl font-bold text-white">{sessionStats?.totalMinutes ?? 0} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
