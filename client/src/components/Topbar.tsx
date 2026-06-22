import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';

interface Streak { streak: number; }

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/analytics/streak');
        if (!cancelled) setStreak(res.data.streak);
      } catch {
        if (!cancelled) setStreak(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">StudyTrack</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Hello, {user?.name || 'Student'}</h1>
          <p className="mt-3 max-w-xl text-slate-400">A modern study workspace for tasks, calendar planning, subject tracking, and productivity analytics.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="accent-chip">
          {streak === null ? 'Streak —' : `Streak ${streak} day${streak === 1 ? '' : 's'}`}
        </span>
        <ThemeToggle />
        <button onClick={logout} className="button-primary">Logout</button>
      </div>
    </div>
  );
};

export default Topbar;
