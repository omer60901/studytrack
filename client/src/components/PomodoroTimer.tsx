import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface Plan {
  _id: string;
  goal: string;
}

interface PomodoroTimerProps {
  onComplete?: (duration: number) => void;
  initialPlanId?: string;
}

const PomodoroTimer = ({ onComplete, initialPlanId }: PomodoroTimerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [customFocus, setCustomFocus] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [subject, setSubject] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || '');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPostSession, setShowPostSession] = useState(false);
  const [mood, setMood] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [learningOutcome, setLearningOutcome] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const sessionStartTime = useRef<Date | null>(null);

  useEffect(() => {
    if (initialPlanId) setSelectedPlanId(initialPlanId);
  }, [initialPlanId]);

  useEffect(() => {
    api.get('/planner').then((res) => setPlans(res.data || [])).catch(() => {});
  }, []);

  const modes = {
    focus: { minutes: customFocus, label: t('focusMode') },
    short: { minutes: 5, label: t('shortBreak') },
    long: { minutes: 15, label: t('longBreak') }
  };

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setMinutes(modes[mode].minutes);
    setSeconds(0);
    completedRef.current = false;
  }, [mode, customFocus]);

  useEffect(() => {
    reset();
  }, [mode, reset]);

  const saveSession = useCallback(async (durationMinutes: number, pomodoros: number) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.post('/study-sessions', {
        duration: durationMinutes,
        focusArea: subject || undefined,
        pomodoros,
        mood: mood || undefined,
        notes: notes || undefined,
        learningOutcome: learningOutcome || undefined,
        planId: selectedPlanId || undefined
      });
    } catch { /* silent */ }
    finally { setSaving(false); }
  }, [subject, mood, notes, learningOutcome, selectedPlanId, saving]);

  const handlePostSessionSave = async () => {
    if (totalFocusMinutes > 0) {
      await saveSession(totalFocusMinutes, completedPomodoros);
    }
    setShowPostSession(false);
    setCompletedPomodoros(0);
    setTotalFocusMinutes(0);
    setMood('');
    setNotes('');
    setLearningOutcome('');
    onComplete?.(totalFocusMinutes * 60);
  };

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (!sessionStartTime.current) {
      sessionStartTime.current = new Date();
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          setMinutes((m) => {
            if (m === 0) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              sessionStartTime.current = null;

              if (mode === 'focus' && !completedRef.current) {
                completedRef.current = true;
                const newPomodoros = completedPomodoros + 1;
                setCompletedPomodoros(newPomodoros);
                setTotalFocusMinutes((prev) => prev + customFocus);

                if (newPomodoros % 4 === 0) {
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
  }, [isRunning, mode, completedPomodoros, customFocus, onComplete, modes]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    sessionStartTime.current = null;

    if (completedPomodoros > 0 || totalFocusMinutes > 0) {
      setShowPostSession(true);
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    sessionStartTime.current = null;
    completedRef.current = false;

    if (completedPomodoros > 0 || totalFocusMinutes > 0) {
      setShowPostSession(true);
    } else {
      setMinutes(customFocus);
      setSeconds(0);
    }
  };

  const totalSeconds = minutes * 60 + seconds;
  const maxSeconds = modes[mode].minutes * 60;
  const progress = maxSeconds > 0 ? ((maxSeconds - totalSeconds) / maxSeconds) * 100 : 0;

  if (showPostSession) {
    const moods = [
      { value: 'great', label: 'great', emoji: '🔥' },
      { value: 'good', label: 'good', emoji: '😊' },
      { value: 'okay', label: 'okay', emoji: '😐' },
      { value: 'tired', label: 'tired', emoji: '😴' }
    ];

    return (
      <div className="card text-center">
        <h3 className="text-lg font-semibold text-white mb-2">{t('sessionComplete')}</h3>
        <p className="text-sm text-slate-400 mb-4">
          {completedPomodoros} {t('pomodoros')} · {totalFocusMinutes} {t('min')}
        </p>

        <div className="space-y-4 text-left">
          <div>
            <label className="block text-sm text-slate-400 mb-2">{t('sessionMood')}</label>
            <div className="flex gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? '' : m.value)}
                  className={`flex-1 py-2 px-3 rounded-2xl text-sm font-medium transition ${
                    mood === m.value
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('learningOutcome')}</label>
            <textarea
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder={t('whatDidYouLearn')}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder={t('optionalNotes')}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              setShowPostSession(false);
              setCompletedPomodoros(0);
              setTotalFocusMinutes(0);
              setMood('');
              setNotes('');
              setLearningOutcome('');
              setMinutes(customFocus);
              setSeconds(0);
            }}
            className="flex-1 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            {t('discard')}
          </button>
          <button onClick={handlePostSessionSave} disabled={saving} className="flex-1 button-primary">
            {saving ? t('saving') : t('saveSession')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card text-center">
      <div className="flex gap-2 justify-center mb-4">
        {(['focus', 'short', 'long'] as const).map((m) => (
          <button
            key={m}
            onClick={() => !isRunning && setMode(m)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              mode === m ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {modes[m].label}
          </button>
        ))}
      </div>

      {mode === 'focus' && !isRunning && (
        <div className="mb-4">
          <label className="text-xs text-slate-500">{t('focusDuration')}</label>
          <div className="flex gap-2 justify-center mt-1">
            {[15, 25, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setCustomFocus(mins);
                  setMinutes(mins);
                  setSeconds(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                  customFocus === mins
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

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

      <div className="mb-4 space-y-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field mx-auto max-w-xs text-center"
          placeholder={t('subjectOptional')}
        />
        {plans.length > 0 && (
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="input-field mx-auto max-w-xs text-center text-sm"
          >
            <option value="">{t('linkToPlan')}</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>{p.goal}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={isRunning ? handleStop : toggleTimer} className="button-primary" disabled={saving}>
          {isRunning ? t('stop') : t('start')}
        </button>
        <button onClick={handleReset} className="rounded-2xl bg-slate-800 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
          {t('resetTimer')}
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-4 text-sm text-slate-400">
        <span>{t('pomodoros')}: {completedPomodoros}</span>
        <span>{t('totalFocus')}: {totalFocusMinutes} {t('min')}</span>
      </div>

      {saving && <p className="mt-2 text-sm text-violet-400">{t('saving')}</p>}
    </div>
  );
};

export default PomodoroTimer;
