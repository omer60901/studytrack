import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { useLanguage } from '../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

interface Summary { totalTasks: number; completedTasks: number; completionRate: number; subjects: number; }
interface Streak { streak: number; goalToday: number; longestStreak: number; }
interface SessionStats {
  totalMinutes: number;
  totalPomodoros: number;
  totalSessions: number;
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  bySubject: Record<string, number>;
  byMood: Record<string, number>;
  avgDifficulty: number;
  dailyStats: Record<string, number>;
  weekOverWeekChange: number;
  tags: Record<string, number>;
}
interface Trend { date: string; minutes: number; sessions: number; pomodoros: number; }

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2'];
const MOOD_EMOJIS: Record<string, string> = { great: '🔥', good: '😊', okay: '😐', tired: '😴' };

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendPeriod, setTrendPeriod] = useState('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, sess, trendData] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/streak'),
          api.get('/study-sessions/stats').catch(() => ({ data: null })),
          api.get(`/study-sessions/trends?period=${trendPeriod}`).catch(() => ({ data: [] }))
        ]);
        setSummary(s.data);
        setStreak(st.data);
        setSessionStats(sess.data);
        setTrends(trendData.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [trendPeriod]);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  const subjectData = sessionStats?.bySubject
    ? Object.entries(sessionStats.bySubject).map(([name, minutes]) => ({ name, minutes }))
    : [];

  const moodData = sessionStats?.byMood
    ? Object.entries(sessionStats.byMood).map(([mood, count]) => ({
        name: `${MOOD_EMOJIS[mood] || ''} ${mood}`,
        value: count
      }))
    : [];

  const tagData = sessionStats?.tags
    ? Object.entries(sessionStats.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ name: tag, count }))
    : [];

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('analyticsTitle')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{t('studyPerformance')}</h2>
        <p className="mt-3 max-w-2xl text-slate-400">{t('analyticsDesc')}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('totalTasks')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{summary?.totalTasks ?? 0}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('completion')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{summary ? `${summary.completionRate}%` : '0%'}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('studySessions')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionStats?.totalSessions ?? 0}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('pomodoros')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionStats?.totalPomodoros ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('today')}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{sessionStats?.todayMinutes ?? 0}m</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('thisWeek')}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{sessionStats?.weekMinutes ?? 0}m</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('thisMonth')}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{sessionStats?.monthMinutes ?? 0}m</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('weekOverWeek')}</p>
          <p className={`mt-3 text-3xl font-semibold ${(sessionStats?.weekOverWeekChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(sessionStats?.weekOverWeekChange ?? 0) >= 0 ? '+' : ''}{sessionStats?.weekOverWeekChange ?? 0}%
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('studyStreak')}</h3>
          <div className="rounded-2xl bg-slate-950 p-6">
            <p className="text-4xl font-bold text-white">{streak?.streak ?? 0} {t('days')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('longest')}: {streak?.longestStreak ?? 0} {t('days')}</p>
            <p className="text-sm text-slate-400">{t('goalToday')}: {streak?.goalToday ?? 0} {t('min')}</p>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{t('studyTrend')}</h3>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="bg-slate-800 text-sm text-slate-300 rounded-xl px-3 py-1"
            >
              <option value="7">{t('last7Days')}</option>
              <option value="14">{t('last14Days')}</option>
              <option value="30">{t('last30Days')}</option>
            </select>
          </div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} min`, t('minutes')]}
                  labelFormatter={(val) => new Date(val as string).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="minutes" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">{t('noDataYet')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('avgDifficulty')}</h3>
          <div className="rounded-2xl bg-slate-950 p-6 text-center">
            <p className="text-5xl font-bold text-white">{sessionStats?.avgDifficulty ?? 0}</p>
            <p className="text-sm text-slate-400 mt-2">/ 5</p>
            <div className="mt-4 h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500"
                style={{ width: `${((sessionStats?.avgDifficulty ?? 0) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('moodDistribution')}</h3>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={moodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {moodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">{t('noDataYet')}</p>
          )}
        </div>
      </div>

      {subjectData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('timeBySubject')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                formatter={(value) => [`${value} min`, t('minutes')]}
              />
              <Bar dataKey="minutes" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tagData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">{t('topTags')}</h3>
          <div className="flex flex-wrap gap-2">
            {tagData.map((tag) => (
              <span key={tag.name} className="px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-sm">
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
