import { useState, useEffect, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
}

const FlashcardsPage = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studying, setStudying] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await api.get('/flashcards');
      setCards(res.data);
    } catch {
      toast.show('Failed to load flashcards.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      toast.show('Front and back are required.', 'error');
      return;
    }
    try {
      const res = await api.post('/flashcards', { front, back, subject, difficulty });
      setCards((prev) => [res.data, ...prev]);
      setFront('');
      setBack('');
      setSubject('');
      toast.show('Flashcard created!', 'success');
    } catch {
      toast.show('Failed to create flashcard.', 'error');
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await api.delete(`/flashcards/${id}`);
      setCards((prev) => prev.filter((c) => c._id !== id));
      toast.show('Flashcard deleted.', 'success');
    } catch {
      toast.show('Failed to delete flashcard.', 'error');
    }
  };

  const filtered = filterSubject ? cards.filter((c) => c.subject === filterSubject) : cards;
  const subjects = [...new Set(cards.map((c) => c.subject).filter(Boolean))];

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Flashcards</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Study with flashcards</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Create flashcards and test your knowledge with spaced repetition.</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white">Create flashcard</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block text-sm text-slate-300">
                Front (Question)
                <textarea value={front} onChange={(e) => setFront(e.target.value)} className="input-field min-h-[80px]" placeholder="e.g. What is photosynthesis?" />
              </label>
              <label className="block text-sm text-slate-300">
                Back (Answer)
                <textarea value={back} onChange={(e) => setBack(e.target.value)} className="input-field min-h-[80px]" placeholder="e.g. The process by which plants convert sunlight into energy" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Subject
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="e.g. Biology" />
                </label>
                <label className="block text-sm text-slate-300">
                  Difficulty
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="input-field">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
              </div>
              <button className="button-primary w-full justify-center">Add flashcard</button>
            </form>
          </div>

          {subjects.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-3">Filter by subject</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterSubject('')} className={`px-3 py-1 rounded-full text-sm ${!filterSubject ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>All</button>
                {subjects.map((s) => (
                  <button key={s} onClick={() => setFilterSubject(s)} className={`px-3 py-1 rounded-full text-sm ${filterSubject === s ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-3">All cards ({filtered.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filtered.map((card) => (
                <div key={card._id} className="rounded-2xl bg-slate-950 p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{card.front}</p>
                    <p className="text-sm text-slate-400 mt-1">{card.back}</p>
                    <div className="flex gap-2 mt-2">
                      {card.subject && <span className="accent-chip">{card.subject}</span>}
                      <span className={`accent-chip ${card.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-300' : card.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>{card.difficulty}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteCard(card._id)} className="text-rose-400 hover:text-rose-300 text-sm shrink-0">Delete</button>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-slate-400 text-sm">No flashcards yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Study mode</h3>
            {!studying ? (
              <button onClick={() => { setStudying(true); setCurrentIndex(0); setFlipped(false); }} className="button-primary w-full justify-center" disabled={filtered.length === 0}>
                Start studying ({filtered.length} cards)
              </button>
            ) : (
              <div className="space-y-4">
                {currentIndex < filtered.length ? (
                  <>
                    <div
                      onClick={() => setFlipped(!flipped)}
                      className="cursor-pointer rounded-2xl bg-slate-950 p-8 min-h-[200px] flex items-center justify-center text-center transition-all"
                    >
                      <p className={`text-xl font-semibold ${flipped ? 'text-violet-300' : 'text-white'}`}>
                        {flipped ? filtered[currentIndex].back : filtered[currentIndex].front}
                      </p>
                    </div>
                    <p className="text-center text-sm text-slate-400">Card {currentIndex + 1} of {filtered.length} • Click to {flipped ? 'see question' : 'reveal answer'}</p>
                    <div className="flex gap-3">
                      <button onClick={() => { setCurrentIndex((i) => i + 1); setFlipped(false); }} className="button-primary flex-1 justify-center">
                        {currentIndex < filtered.length - 1 ? 'Next card' : 'Finish'}
                      </button>
                      <button onClick={() => setStudying(false)} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Exit</button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xl text-white font-semibold">Session complete!</p>
                    <p className="text-slate-400 mt-2">You reviewed {filtered.length} cards.</p>
                    <button onClick={() => { setCurrentIndex(0); setFlipped(false); }} className="button-primary mt-4">Study again</button>
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
