import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface Subject {
  _id: string;
  title: string;
  progress: number;
  gradeAverage: number;
  icon: string;
  color: string;
}

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2', '#c026d3', '#ea580c', '#4f46e5', '#0d9488', '#be123c'];
const ICONS = ['📘', '📕', '📗', '📙', '📓', '📔', '📒', '🎨', '🔬', '🧮', '🌍', '💻', '🎵', '⚗️', '📐'];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(50);
  const [gradeAverage, setGradeAverage] = useState(85);
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editGradeAverage, setEditGradeAverage] = useState(0);
  const [editColor, setEditColor] = useState(COLORS[0]);
  const [editIcon, setEditIcon] = useState(ICONS[0]);
  const toast = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch {
      toast.show('Failed to load subjects.', 'error');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title) { toast.show('Subject title is required.', 'error'); return; }
    try {
      const response = await api.post('/subjects', { title, progress, gradeAverage, color, icon });
      setSubjects((current) => [response.data, ...current]);
      setTitle(''); setProgress(50); setGradeAverage(85);
      toast.show('Subject added!', 'success');
    } catch {
      toast.show('Failed to add subject.', 'error');
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject._id);
    setEditTitle(subject.title);
    setEditProgress(subject.progress);
    setEditGradeAverage(subject.gradeAverage);
    setEditColor(subject.color || COLORS[0]);
    setEditIcon(subject.icon || ICONS[0]);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      const response = await api.put(`/subjects/${id}`, {
        title: editTitle, progress: editProgress, gradeAverage: editGradeAverage,
        color: editColor, icon: editIcon
      });
      setSubjects((current) => current.map((s) => (s._id === id ? response.data : s)));
      setEditingId(null);
      toast.show('Subject updated!', 'success');
    } catch {
      toast.show('Failed to update subject.', 'error');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((current) => current.filter((s) => s._id !== id));
      toast.show('Subject deleted.', 'success');
    } catch {
      toast.show('Failed to delete subject.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Subjects</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Track your class progress</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Monitor your subjects, grades, and learning progress in real time.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <h3 className="text-lg font-semibold text-white">Add a subject</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              Subject name
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Progress (%)
                <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="input-field" />
              </label>
              <label className="block text-sm text-slate-300">
                Grade average
                <input type="number" min={0} max={100} value={gradeAverage} onChange={(e) => setGradeAverage(Number(e.target.value))} className="input-field" />
              </label>
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((i) => (
                  <button key={i} type="button" onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === i ? 'bg-violet-500/20 ring-2 ring-violet-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <button className="button-primary w-full justify-center">Add subject</button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => (
            <div key={subject._id} className="card-soft" style={{ borderColor: subject.color ? `${subject.color}40` : undefined }}>
              {editingId === subject._id ? (
                <div className="space-y-3">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" />
                  <input type="number" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="input-field" placeholder="Progress %" />
                  <input type="number" min={0} max={100} value={editGradeAverage} onChange={(e) => setEditGradeAverage(Number(e.target.value))} className="input-field" placeholder="Grade average" />
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setEditColor(c)}
                        className={`w-6 h-6 rounded-full ${editColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(subject._id)} className="button-primary flex-1 justify-center">Save</button>
                    <button onClick={cancelEdit} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{subject.icon} {subject.title}</h3>
                      <p className="text-sm text-slate-400">Grade average</p>
                    </div>
                    <span className="rounded-full px-3 py-2 text-xs uppercase tracking-wider text-white" style={{ backgroundColor: subject.color || '#7c3aed' }}>
                      {subject.gradeAverage}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Completion</span><span>{subject.progress}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${subject.progress}%`, backgroundColor: subject.color || '#7c3aed' }} />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => startEdit(subject)} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Edit</button>
                    <button onClick={() => deleteSubject(subject._id)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-400">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {subjects.length === 0 && <p className="rounded-[2rem] bg-slate-950 p-6 text-slate-400 col-span-2">No subjects yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default SubjectsPage;
