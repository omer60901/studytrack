import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { useLanguage } from '../context/LanguageContext';

interface Achievement {
  _id: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

const ALL_BADGES = [
  { id: 'first_task', name: 'First Step', description: 'Completed your first task', icon: '🎯', category: 'tasks' },
  { id: 'task_5', name: 'Getting Started', description: 'Completed 5 tasks', icon: '✅', category: 'tasks' },
  { id: 'task_10', name: 'On a Roll', description: 'Completed 10 tasks', icon: '🔥', category: 'tasks' },
  { id: 'task_25', name: 'Powerhouse', description: 'Completed 25 tasks', icon: '💪', category: 'tasks' },
  { id: 'task_50', name: 'Unstoppable', description: 'Completed 50 tasks', icon: '🏆', category: 'tasks' },
  { id: 'streak_3', name: 'Consistent', description: '3-day study streak', icon: '📅', category: 'streak' },
  { id: 'streak_7', name: 'Weekly Warrior', description: '7-day study streak', icon: '⚔️', category: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day study streak', icon: '👑', category: 'streak' },
  { id: 'study_60', name: 'Hour Scholar', description: 'Studied for 60+ minutes in a day', icon: '📚', category: 'study' },
  { id: 'study_300', name: 'Deep Focus', description: 'Studied for 5+ hours total', icon: '🧠', category: 'study' },
  { id: 'pomodoro_10', name: 'Focused', description: 'Completed 10 pomodoro sessions', icon: '🍅', category: 'study' },
  { id: 'subjects_3', name: 'Well Rounded', description: 'Studied 3+ different subjects', icon: '🎓', category: 'study' },
];

const AchievementsPage = () => {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'tasks' | 'streak' | 'study'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const res = await api.get('/achievements');
      setAchievements(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const unlockedIds = new Set(achievements.map((a) => a.badgeId));
  const unlockedCount = achievements.length;
  const totalCount = ALL_BADGES.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filtered = filter === 'all' ? ALL_BADGES : ALL_BADGES.filter((b) => b.category === filter);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('achievements')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{t('yourBadges')}</h2>
        <p className="mt-3 max-w-2xl text-slate-400">{t('achievementsDesc')}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('unlocked')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{unlockedCount} / {totalCount}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('progress')}</p>
          <div className="mt-3">
            <p className="text-4xl font-semibold text-white">{progress}%</p>
            <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('nextBadge')}</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {ALL_BADGES.find((b) => !unlockedIds.has(b.id))?.icon || '🎉'}{' '}
            {ALL_BADGES.find((b) => !unlockedIds.has(b.id))?.name || t('allUnlocked')}
          </p>
        </div>
      </section>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'tasks', 'streak', 'study'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              filter === cat ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? t('all') : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((badge) => {
          const unlocked = unlockedIds.has(badge.id);
          const achievement = achievements.find((a) => a.badgeId === badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-3xl p-6 transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30'
                  : 'bg-slate-900/50 border border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{badge.icon}</span>
                {unlocked && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">{t('unlocked')}</span>
                )}
              </div>
              <h3 className={`mt-3 text-lg font-semibold ${unlocked ? 'text-white' : 'text-slate-400'}`}>{badge.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{badge.description}</p>
              {achievement && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(achievement.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default AchievementsPage;
