import { useState, useEffect, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

interface Subject {
  _id: string;
  name: string;
  color: string;
}

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  subject: string;
  subjectId?: { _id: string; name: string; color: string } | null;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
  nextReview?: string;
}

const FlashcardsPage = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studying, setStudying] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadCards();
    loadSubjects();
  }, []);

  const loadCards = async () => {
    try {
      const res = await api.get('/flashcards');
      setCards(res.data);
    } catch {
      toast.show(t('flashcardFailedLoad'), 'error');
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch {
      // subjects may not be available
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      toast.show(t('flashcardRequired'), 'error');
      return;
    }
    try {
      const payload: Record<string, unknown> = { front, back, difficulty };
      if (subjectId) {
        payload.subjectId = subjectId;
      }
      const res = await api.post('/flashcards', payload);
      setCards((prev) => [res.data, ...prev]);
      setFront('');
      setBack('');
      setSubjectId('');
      toast.show(t('flashcardCreated'), 'success');
    } catch {
      toast.show(t('flashcardFailedAdd'), 'error');
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await api.delete(`/flashcards/${id}`);
      setCards((prev) => prev.filter((c) => c._id !== id));
      toast.show(t('flashcardDeleted'), 'success');
    } catch {
      toast.show(t('flashcardFailedDelete'), 'error');
    }
  };

  const startReviewMode = async () => {
    try {
      const res = await api.get('/flashcards?review=true');
      if (res.data.length === 0) {
        toast.show('No cards due for review', 'success');
        return;
      }
      setDueCards(res.data);
      setReviewMode(true);
      setStudying(true);
      setCurrentIndex(0);
      setFlipped(false);
    } catch {
      toast.show('Failed to load due cards', 'error');
    }
  };

  const rateCard = async (cardId: string, quality: number) => {
    try {
      const res = await api.post(`/flashcards/${cardId}/review`, { quality });
      setCards((prev) => prev.map((c) => (c._id === cardId ? res.data : c)));
      setDueCards((prev) => prev.filter((c) => c._id !== cardId));
      setCurrentIndex((i) => Math.min(i, dueCards.length - 2));
      setFlipped(false);
      if (dueCards.length <= 1) {
        setReviewMode(false);
        setStudying(false);
        toast.show('Review session complete!', 'success');
      }
    } catch {
      toast.show('Failed to rate card', 'error');
    }
  };

  const filtered = filterSubject
    ? cards.filter((c) => c.subjectId?._id === filterSubject || c.subject === filterSubject)
    : cards;
  const dueCount = cards.filter((c) => c.nextReview && new Date(c.nextReview) <= new Date()).length;

  const activeCards = reviewMode ? dueCards : filtered;
  const ratingButtons = [
    { quality: 1, label: 'Again', color: 'bg-rose-500 hover:bg-rose-400' },
    { quality: 3, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-400' },
    { quality: 4, label: 'Good', color: 'bg-blue-500 hover:bg-blue-400' },
    { quality: 5, label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-400' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('flashcardsTitle')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{t('studyFlashcards')}</h2>
        <p className="mt-3 max-w-2xl text-slate-400">{t('flashcardsDesc')}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white">{t('createFlashcard')}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block text-sm text-slate-300">
                {t('frontQuestion')}
                <textarea value={front} onChange={(e) => setFront(e.target.value)} className="input-field min-h-[80px]" placeholder={t('frontPlaceholder')} />
              </label>
              <label className="block text-sm text-slate-300">
                {t('backAnswer')}
                <textarea value={back} onChange={(e) => setBack(e.target.value)} className="input-field min-h-[80px]" placeholder={t('backPlaceholder')} />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  {t('subject')}
                  <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field">
                    <option value="">{t('noSubject')}</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-300">
                  {t('difficultyLabel')}
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="input-field">
                    <option value="easy">{t('easy')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="hard">{t('hard')}</option>
                  </select>
                </label>
              </div>
              <button className="button-primary w-full justify-center">{t('addFlashcard')}</button>
            </form>
          </div>

          {subjects.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">{t('filterBySubject')}</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterSubject('')} className={`px-3 py-1 rounded-full text-sm ${!filterSubject ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{t('all')}</button>
                {subjects.map((s) => (
                  <button key={s._id} onClick={() => setFilterSubject(s._id)} className={`px-3 py-1 rounded-full text-sm ${filterSubject === s._id ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`} style={s.color ? { borderColor: s.color, borderWidth: 1 } : undefined}>{s.name}</button>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-3">{`${t('allCards')} (${filtered.length})`}</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filtered.map((card) => (
                <div key={card._id} className="rounded-2xl bg-slate-950 p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{card.front}</p>
                    <p className="text-sm text-slate-400 mt-1">{card.back}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {card.subjectId && <span className="accent-chip" style={card.subjectId.color ? { borderColor: card.subjectId.color, borderWidth: 1 } : undefined}>{card.subjectId.name}</span>}
                      {!card.subjectId && card.subject && <span className="accent-chip">{card.subject}</span>}
                      <span className={`accent-chip ${card.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-300' : card.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>{card.difficulty}</span>
                      {card.nextReview && (
                        <span className={`accent-chip ${new Date(card.nextReview) <= new Date() ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/50 text-slate-400'}`}>
                          {new Date(card.nextReview) <= new Date() ? 'Due' : `Review: ${formatDate(card.nextReview)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteCard(card._id)} className="text-rose-400 hover:text-rose-300 text-sm shrink-0">{t('delete')}</button>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-slate-400 text-sm">{t('noFlashcardsYet')}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">{t('studyMode')}</h3>
            {!studying ? (
              <div className="space-y-3">
                <button onClick={() => { setReviewMode(false); setStudying(true); setCurrentIndex(0); setFlipped(false); }} className="button-primary w-full justify-center" disabled={filtered.length === 0}>
                  {`${t('startStudying')} (${filtered.length} ${t('cards')})`}
                </button>
                <button onClick={startReviewMode} className="w-full justify-center rounded-2xl bg-violet-600/20 border border-violet-500/40 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-600/30 transition-colors relative" disabled={dueCount === 0}>
                  {`Review due cards`}
                  {dueCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{dueCount}</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCards.length > 0 && currentIndex >= 0 && currentIndex < activeCards.length ? (
                  <>
                    <div
                      onClick={() => setFlipped(!flipped)}
                      className="cursor-pointer rounded-2xl bg-slate-950 p-8 min-h-[200px] flex items-center justify-center text-center transition-all"
                    >
                      <p className={`text-xl font-semibold ${flipped ? 'text-violet-300' : 'text-white'}`}>
                        {flipped ? activeCards[currentIndex].back : activeCards[currentIndex].front}
                      </p>
                    </div>
                    <p className="text-center text-sm text-slate-400">
                      {t('cardOf', { current: currentIndex + 1, total: activeCards.length })} • {flipped ? t('clickToSeeQuestion') : t('clickToReveal')}
                      {activeCards[currentIndex].nextReview && (
                        <span className="ml-2 text-slate-500">• Next: {formatDate(activeCards[currentIndex].nextReview)}</span>
                      )}
                    </p>
                    {reviewMode && flipped ? (
                      <div className="flex gap-2">
                        {ratingButtons.map((btn) => (
                          <button
                            key={btn.quality}
                            onClick={() => rateCard(activeCards[currentIndex]._id, btn.quality)}
                            className={`flex-1 justify-center rounded-2xl px-3 py-2 text-sm font-medium text-white transition-colors ${btn.color}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => { setCurrentIndex((i) => i + 1); setFlipped(false); }} className="button-primary flex-1 justify-center">
                          {currentIndex < activeCards.length - 1 ? t('nextCard') : t('finish')}
                        </button>
                        <button onClick={() => { setStudying(false); setReviewMode(false); }} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">{t('exit')}</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xl text-white font-semibold">{t('sessionComplete')}</p>
                    <p className="text-slate-400 mt-2">{t('reviewedCards', { count: reviewMode ? dueCards.length : filtered.length })}</p>
                    <button onClick={() => { setCurrentIndex(0); setFlipped(false); setReviewMode(false); setStudying(false); }} className="button-primary mt-4">{t('studyAgain')}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
