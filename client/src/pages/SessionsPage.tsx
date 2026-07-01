import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Spinner from '../components/Spinner';
import AddSessionModal from '../components/AddSessionModal';

interface StudySession {
  _id: string;
  userId: string;
  duration: number;
  focusArea?: string;
  subjectId?: string;
  pomodoros?: number;
  notes?: string;
  mood?: string;
  learningOutcome?: string;
  difficulty?: number;
  tags?: string[];
  completedAt?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<StudySession | null>(null);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const loadSessions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (filterSubject) params.set('subject', filterSubject);
      if (filterMood) params.set('mood', filterMood);
      if (filterDateFrom) params.set('from', filterDateFrom);
      if (filterDateTo) params.set('to', filterDateTo);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const response = await api.get(`/study-sessions?${params.toString()}`);
      setSessions(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      toast.show(t('sessionFailedLoad'), 'error');
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterMood, filterDateFrom, filterDateTo, debouncedSearch, toast, t]);

  useEffect(() => {
    loadSessions(1);
  }, [loadSessions]);

  const deleteSession = async (id: string) => {
    if (!confirm(t('deleteSessionConfirm'))) return;
    try {
      await api.delete(`/study-sessions/${id}`);
      setSessions((current) => current.filter((s) => s._id !== id));
      toast.show(t('sessionDeleted'), 'success');
    } catch {
      toast.show(t('sessionFailedDelete'), 'error');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadSessions(newPage);
    }
  };

  const openEditModal = (session: StudySession) => {
    setEditSession(session);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditSession(null);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterMood('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
  };

  const hasFilters = filterSubject || filterMood || filterDateFrom || filterDateTo || searchQuery;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.createdAt) >= weekAgo).length;
  const sessionsToday = sessions.filter((s) => new Date(s.createdAt).toISOString().split('T')[0] === todayStr).length;

  const moodEmojis: Record<string, string> = { great: '🔥', good: '😊', okay: '😐', tired: '😴' };
  const difficultyLabels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('sessionsTitle')}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t('sessionsTitle')}</h2>
            <p className="mt-3 max-w-2xl text-slate-400">{t('sessionsDesc')}</p>
          </div>
          <button onClick={openAddModal} className="button-primary whitespace-nowrap">
            + {t('addManualSession')}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('totalHours')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{totalHours}h</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('thisWeek')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionsThisWeek}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm uppercase tracking-wider text-slate-400">{t('today')}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{sessionsToday}</p>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1"
            placeholder={t('searchSessions')}
          />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="input-field">
            <option value="">{t('allSubjects')}</option>
            {[...new Set(sessions.map((s) => s.focusArea).filter(Boolean))].map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)} className="input-field">
            <option value="">{t('allMoods')}</option>
            <option value="great">🔥 {t('great')}</option>
            <option value="good">😊 {t('good')}</option>
            <option value="okay">😐 {t('okay')}</option>
            <option value="tired">😴 {t('tired')}</option>
          </select>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="input-field"
            placeholder={t('from')}
          />
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="input-field"
            placeholder={t('to')}
          />
          {hasFilters && (
            <button onClick={clearFilters} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
              {t('clearFilters')}
            </button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : sessions.length === 0 ? (
          <p className="text-slate-400 text-center py-8">{t('noSessionsYet')}</p>
        ) : (
          <>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sessions.map((session) => (
                <div key={session._id} className="rounded-3xl bg-slate-950 p-5 shadow-lg shadow-slate-950/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-white">
                          {new Date(session.completedAt || session.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {session.mood && (
                          <span className="text-lg">{moodEmojis[session.mood] || session.mood}</span>
                        )}
                        {session.difficulty && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                            {difficultyLabels[session.difficulty]}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>{t('sessionDuration')}: {session.duration} min</span>
                        {session.focusArea && <span>{t('sessionSubject')}: {session.focusArea}</span>}
                        {session.pomodoros != null && session.pomodoros > 0 && <span>{t('sessionPomodoros')}: {session.pomodoros}</span>}
                      </div>
                      {session.learningOutcome && (
                        <p className="mt-2 text-sm text-emerald-400">{session.learningOutcome}</p>
                      )}
                      {session.notes && <p className="mt-2 text-sm text-slate-500">{session.notes}</p>}
                      {session.tags && session.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {session.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(session)}
                        className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-400"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 rounded-xl bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  {t('prev')}
                </button>
                <span className="text-sm text-slate-400">
                  {t('page')} {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 rounded-xl bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <AddSessionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditSession(null); }}
        onSessionAdded={() => loadSessions(pagination.page)}
        editSession={editSession}
      />
    </div>
  );
};

export default SessionsPage;
