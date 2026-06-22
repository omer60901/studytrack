import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Summary { totalTasks: number; completedTasks: number; completionRate: number; subjects: number; }
interface Streak { streak: number; goalToday: number; longestStreak: number; }
interface SessionStats { totalMinutes: number; totalPomodoros: number; totalSessions: number; todayMinutes: number; weekMinutes: number; bySubject: Record<string, number>; }

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2'];

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, sess, sessList] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/streak'),
          api.get('/study-sessions/stats').catch(() => ({ data: null })),
          api.get('/study-sessions').catch(() => ({ data: [] }))
        ]);
        setSummary(s.data);
        setStreak(st.data);
        setSessionStats(sess.data);
        setSessions(sessList.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  const subjectData = sessionStats?.bySubject
    ? Object.entries(sessionStats.bySubject).map(([name, minutes]) => ({ name, minutes }))
    : [];

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    const mins = sessions
      .filter((s) => new Date(s.createdAt).toISOString().startsWith(dateStr))
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    return { day: dayStr, minutes: mins };
  });

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Analytics</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Your study performance</h2>
        <p className="mt-3 max-w-2xl text-slate-400">See how your progress is trending and where to focus next.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">Total tasks</p>
          <p className="mt-3 text-4xl font-semibold text-white">{summary?.totalTasks ?? 0}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">Completion</p>
          <p className="mt-3 text-4xl font-semibold text-white">{summary ? `${summary.completionRate}%` : '0%'}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">Study sessions</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionStats?.totalSessions ?? 0}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">Pomodoros</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionStats?.totalPomodoros ?? 0}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Study streak</h3>
          <div className="rounded-2xl bg-slate-950 p-6">
            <p className="text-4xl font-bold text-white">{streak?.streak ?? 0} days</p>
            <p className="text-sm text-slate-400 mt-1">Longest: {streak?.longestStreak ?? 0} days</p>
            <p className="text-sm text-slate-400">Goal today: {streak?.goalToday ?? 0} min</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly study time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {last7Days.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {subjectData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Time by subject</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="minutes" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
