import { useState, useEffect, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

interface Subject {
  _id: string;
  name: string;
  color: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  subject: string;
  subjectId?: { _id: string; name: string; color: string } | null;
  createdAt: string;
  updatedAt: string;
}

const renderMarkdown = (text: string): string => {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    .replace(/\n/g, '<br />');
};

const NotesPage = () => {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadNotes();
    loadSubjects();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch {
      toast.show(t('noteFailedLoad'), 'error');
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch {
      toast.show(t('noteFailedLoad'), 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.show(t('noteRequired'), 'error');
      return;
    }
    try {
      const selectedSubject = subjects.find((s) => s._id === subjectId);
      const payload = {
        title,
        content,
        subject: selectedSubject?.name || subject,
        subjectId: subjectId || undefined,
      };
      if (editingId) {
        const res = await api.put(`/notes/${editingId}`, payload);
        setNotes((prev) => prev.map((n) => (n._id === editingId ? res.data : n)));
        setEditingId(null);
        toast.show(t('noteUpdated'), 'success');
      } else {
        const res = await api.post('/notes', payload);
        setNotes((prev) => [res.data, ...prev]);
        toast.show(t('noteCreated'), 'success');
      }
      setTitle('');
      setContent('');
      setSubject('');
      setSubjectId('');
    } catch {
      toast.show(t('noteFailedSave'), 'error');
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm(t('deleteNoteConfirm'))) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.show(t('noteDeleted'), 'success');
    } catch {
      toast.show(t('noteFailedDelete'), 'error');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
    setSubjectId(note.subjectId?._id || '');
  };

  const filtered = search
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('notesTitle')}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{t('studyNotes')}</h2>
        <p className="mt-3 max-w-2xl text-slate-400">{t('notesDesc')}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{editingId ? t('editNote') : t('newNote')}</h3>
              <div className="flex gap-1 rounded-xl bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                    !previewMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('write')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                    previewMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('preview')}
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-900/50 p-4 min-h-[200px]">
                  {title && <h2 className="text-xl font-bold text-white mb-2">{title}</h2>}
                  {content ? (
                    <div className="prose-invert text-slate-300" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                  ) : (
                    <p className="text-slate-500 italic">{t('noteContentPlaceholder')}</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm text-slate-300">
                  {t('titleLabel')}
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder={t('noteTitlePlaceholder')} />
                </label>
                <label className="block text-sm text-slate-300">
                  {t('content')}
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field min-h-[200px] font-mono text-sm" placeholder={t('noteContentPlaceholder')} />
                </label>
                <div className="flex gap-3">
                  <label className="block text-sm text-slate-300 flex-1">
                    {t('subject')}
                    <select
                      value={subjectId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSubjectId(id);
                        const found = subjects.find((s) => s._id === id);
                        setSubject(found?.name || '');
                      }}
                      className="input-field"
                    >
                      <option value="">{t('selectSubject')}</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="button-primary flex-1 justify-center">{editingId ? t('updateNote') : t('saveNote')}</button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); setSubject(''); setSubjectId(''); }} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">{t('cancel')}</button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            placeholder={t('searchNotes')}
          />
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filtered.map((note) => (
              <div key={note._id} className="card-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{note.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                    <div className="flex gap-2 mt-2">
                      {note.subjectId && (
                        <span
                          className="accent-chip"
                          style={{
                            backgroundColor: note.subjectId.color ? `${note.subjectId.color}20` : undefined,
                            borderColor: note.subjectId.color || undefined,
                            color: note.subjectId.color || undefined,
                          }}
                        >
                          {note.subjectId.name}
                        </span>
                      )}
                      {note.subject && !note.subjectId && <span className="accent-chip">{note.subject}</span>}
                      <span className="text-xs text-slate-500">{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => startEdit(note)} className="text-sm text-slate-400 hover:text-white">{t('edit')}</button>
                    <button onClick={() => deleteNote(note._id)} className="text-sm text-rose-400 hover:text-rose-300">{t('delete')}</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-slate-400 text-sm text-center py-8">{t('noNotesYet')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
