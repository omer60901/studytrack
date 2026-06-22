import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

interface PomodoroTimerProps {
  onComplete?: (duration: number) => void;
}

const PomodoroTimer = ({ onComplete }: PomodoroTimerProps) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [sessions, setSessions] = useState(0);
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const modes = {
    focus: { minutes: 25, label: 'Focus' },
    short: { minutes: 5, label: 'Short Break' },
    long: { minutes: 15, label: 'Long Break' }
  };

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setMinutes(modes[mode].minutes);
    setSeconds(0);
    completedRef.current = false;
  }, [mode]);

  useEffect(() => {
    reset();
  }, [mode, reset]);

  const saveSession = useCallback(async (durationMinutes: number) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.post('/study-sessions', {
        duration: durationMinutes,
        focusArea: subject || undefined,
        pomodoros: 1,
      });
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [subject, saving]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          setMinutes((m) => {
            if (m === 0) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              if (mode === 'focus' && !completedRef.current) {
                completedRef.current = true;
                const newSessions = sessions + 1;
                setSessions(newSessions);
                saveSession(25);
                onComplete?.(25 * 60);
                if (newSessions % 4 === 0) {
                  setMode('long');
                } else {
                  setMode('short');
                }
              } else {
                setMode('focus');
              }
              return modes[mode].minutes;
            }
            return m - 1;
          });
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, sessions, onComplete, saveSession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const totalSeconds = minutes * 60 + seconds;
  const maxSeconds = modes[mode].minutes * 60;
  const progress = maxSeconds > 0 ? ((maxSeconds - totalSeconds) / maxSeconds) * 100 : 0;

  return (
    <div className="card text-center">
      <div className="flex gap-2 justify-center mb-4">
        {(['focus', 'short', 'long'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              mode === m ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {modes[m].label}
          </button>
        ))}
      </div>

      <div className="relative w-48 h-48 mx-auto my-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field mx-auto max-w-xs text-center"
          placeholder="Subject (optional)"
        />
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={toggleTimer} className="button-primary" disabled={saving}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="rounded-2xl bg-slate-800 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
          Reset
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Sessions completed: {sessions}
        {saving && <span className="ml-2 text-violet-400">Saving...</span>}
      </p>
    </div>
  );
};

export default PomodoroTimer;
