import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';

interface Streak { streak: number; }
interface UserProfile { level: number; xp: number; }

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [streak, setStreak] = useState<number | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [streakRes, profileRes] = await Promise.all([
          api.get('/analytics/streak'),
          api.get('/auth/profile')
        ]);
        if (!cancelled) {
          setStreak(streakRes.data.streak);
          setProfile(profileRes.data.user);
        }
      } catch {
        if (!cancelled) {
          setStreak(null);
          setProfile(null);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const xpForNextLevel = (profile?.level ?? 1) * 100;
  const xpProgress = profile ? Math.min((profile.xp % xpForNextLevel) / xpForNextLevel * 100, 100) : 0;

  return (
    <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white lg:hidden"
          aria-label={t('toggleMenu')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('studyTrack')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('hello')}, {user?.name || t('student')}</h1>
          <p className="mt-3 max-w-xl text-slate-400">{t('topbarDesc')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {profile && (
          <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
            <span className="text-xs font-semibold text-violet-300">{t('level')} {profile.level}</span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="text-xs text-slate-400">{profile.xp} {t('xp')}</span>
          </div>
        )}
        <span className="accent-chip">
          {streak === null ? `${t('streak')} —` : `${t('streak')} ${streak} ${streak === 1 ? t('streakDay') : t('streakDays')}`}
        </span>
        <ThemeToggle />
        <button onClick={logout} className="button-primary">{t('logout')}</button>
      </div>
    </div>
  );
};

export default Topbar;
