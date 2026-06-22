import { useState, useEffect, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface Note {
  _id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch {
      toast.show('Failed to load notes.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.show('Title and content are required.', 'error');
      return;
    }
    try {
      if (editingId) {
        const res = await api.put(`/notes/${editingId}`, { title, content, subject });
        setNotes((prev) => prev.map((n) => (n._id === editingId ? res.data : n)));
        setEditingId(null);
        toast.show('Note updated!', 'success');
      } else {
        const res = await api.post('/notes', { title, content, subject });
        setNotes((prev) => [res.data, ...prev]);
        toast.show('Note created!', 'success');
      }
      setTitle('');
      setContent('');
      setSubject('');
    } catch {
      toast.show('Failed to save note.', 'error');
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.show('Note deleted.', 'success');
    } catch {
      toast.show('Failed to delete note.', 'error');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
  };

  const filtered = search
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Notes</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Study notes & whiteboard</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Write, organize, and review your study notes in one place.</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit note' : 'New note'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block text-sm text-slate-300">
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Note title" />
              </label>
              <label className="block text-sm text-slate-300">
                Content
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field min-h-[200px] font-mono text-sm" placeholder="Write your notes here... (supports markdown-like formatting)" />
              </label>
              <div className="flex gap-3">
                <label className="block text-sm text-slate-300 flex-1">
                  Subject
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="e.g. Math" />
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="button-primary flex-1 justify-center">{editingId ? 'Update note' : 'Save note'}</button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); setSubject(''); }} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            placeholder="Search notes..."
          />
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filtered.map((note) => (
              <div key={note._id} className="card-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{note.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                    <div className="flex gap-2 mt-2">
                      {note.subject && <span className="accent-chip">{note.subject}</span>}
                      <span className="text-xs text-slate-500">{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => startEdit(note)} className="text-sm text-slate-400 hover:text-white">Edit</button>
                    <button onClick={() => deleteNote(note._id)} className="text-sm text-rose-400 hover:text-rose-300">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No notes yet. Write your first note!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
