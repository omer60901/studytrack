import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded: () => void;
  editSession?: any | null;
}

const AddSessionModal = ({ isOpen, onClose, onSessionAdded, editSession }: AddSessionModalProps) => {
  const toast = useToast();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ _id: string; name: string }>>([]);

  const [duration, setDuration] = useState(30);
  const [focusArea, setFocusArea] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string>('');
  const [learningOutcome, setLearningOutcome] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [tags, setTags] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      api.get('/subjects').then((res) => setSubjects(res.data || [])).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (editSession) {
      setDuration(editSession.duration || 30);
      setFocusArea(editSession.focusArea || '');
      setSubjectId(editSession.subjectId || '');
      setNotes(editSession.notes || '');
      setMood(editSession.mood || '');
      setLearningOutcome(editSession.learningOutcome || '');
      setDifficulty(editSession.difficulty || 3);
      setTags((editSession.tags || []).join(', '));
      setDate(editSession.completedAt ? new Date(editSession.completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      resetForm();
    }
  }, [editSession, isOpen]);

  const resetForm = () => {
    setDuration(30);
    setFocusArea('');
    setSubjectId('');
    setNotes('');
    setMood('');
    setLearningOutcome('');
    setDifficulty(3);
    setTags('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || duration <= 0) {
      toast.show(t('sessionDurationRequired'), 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        duration,
        focusArea: focusArea || undefined,
        subjectId: subjectId || undefined,
        notes: notes || undefined,
        mood: mood || undefined,
        learningOutcome: learningOutcome || undefined,
        difficulty,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        date: date || undefined
      };

      if (editSession) {
        await api.patch(`/study-sessions/${editSession._id}`, payload);
        toast.show(t('sessionUpdated'), 'success');
      } else {
        await api.post('/study-sessions/manual', payload);
        toast.show(t('sessionAdded'), 'success');
      }

      resetForm();
      onSessionAdded();
      onClose();
    } catch {
      toast.show(editSession ? t('sessionFailedUpdate') : t('sessionFailedAdd'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const moods = [
    { value: 'great', label: 'great', emoji: '🔥' },
    { value: 'good', label: 'good', emoji: '😊' },
    { value: 'okay', label: 'okay', emoji: '😐' },
    { value: 'tired', label: 'tired', emoji: '😴' }
  ];

  const difficultyLabels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editSession ? t('editSession') : t('addManualSession')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('sessionDuration')} (min)</label>
            <input
              type="number"
              min="1"
              max="600"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {subjects.length > 0 && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('sessionSubject')}</label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  const sub = subjects.find((s) => s._id === e.target.value);
                  if (sub) setFocusArea(sub.name);
                }}
                className="input-field w-full"
              >
                <option value="">{t('selectSubject')}</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('focusArea')}</label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="input-field w-full"
              placeholder={t('focusAreaPlaceholder')}
            />
          </div>

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
            <label className="block text-sm text-slate-400 mb-2">{t('difficulty')}: {difficultyLabels[difficulty]}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('learningOutcome')}</label>
            <textarea
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder={t('learningOutcomePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder={t('notesPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('tags')}</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-field w-full"
              placeholder={t('tagsPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              {t('cancel')}
            </button>
            <button type="submit" disabled={saving} className="flex-1 button-primary">
              {saving ? t('saving') : editSession ? t('update') : t('addSession')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSessionModal;
