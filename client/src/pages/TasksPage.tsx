import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

interface Task {
  _id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  tags: string[];
  dependsOn: string[];
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [due, setDue] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dependsOnInput, setDependsOnInput] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDue, setEditDue] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editDependsOn, setEditDependsOn] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const toast = useToast();

  useEffect(() => {
    loadTasks();
  }, [filterPriority, filterCompleted, filterTag, sortBy, sortOrder]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPriority) params.set('priority', filterPriority);
      if (filterCompleted) params.set('completed', filterCompleted);
      if (filterTag) params.set('tag', filterTag);
      params.set('sort', sortBy);
      params.set('order', sortOrder);
      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data.data || response.data);
    } catch (error) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title || !subject) {
      setError('Task name and subject are required.');
      return;
    }
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const response = await api.post('/tasks', {
        title, category: subject, priority,
        dueDate: due ? new Date(due).toISOString() : undefined,
        tags,
        dependsOn: dependsOnInput
      });
      setTasks((current) => [response.data, ...current]);
      setTitle(''); setSubject(''); setPriority('medium'); setDue(''); setTagsInput(''); setDependsOnInput([]);
      setError('');
      toast.show('Task added!', 'success');
    } catch (err) {
      setError('Failed to add task.');
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const response = await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      const data = response.data;
      setTasks((current) => current.map((item) => (item._id === task._id ? data : item)));
      if (data.newBadges?.length) {
        data.newBadges.forEach((b: any) => {
          toast.show(`Badge unlocked: ${b.icon} ${b.name}!`, 'success');
        });
      }
    } catch {
      setError('Failed to update task.');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditDue(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEditTags((task.tags || []).join(', '));
    setEditDependsOn(task.dependsOn || []);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean);
      const response = await api.put(`/tasks/${id}`, {
        title: editTitle, category: editCategory, priority: editPriority,
        dueDate: editDue ? new Date(editDue).toISOString() : undefined,
        tags,
        dependsOn: editDependsOn
      });
      setTasks((current) => current.map((t) => (t._id === id ? response.data : t)));
      setEditingId(null);
      toast.show('Task updated!', 'success');
    } catch {
      setError('Failed to update task.');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task._id !== id));
      toast.show('Task deleted.', 'success');
    } catch {
      setError('Failed to delete task.');
    }
  };

  const allTags = [...new Set(tasks.flatMap((t) => t.tags || []))];

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Tasks</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Keep your study plan moving</h2>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20">
            {tasks.filter((t) => !t.completed).length} active tasks
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Filters & Sort</h3>
        <div className="flex flex-wrap gap-3">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-auto">
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value)} className="input-field w-auto">
            <option value="">All status</option>
            <option value="false">Active</option>
            <option value="true">Completed</option>
          </select>
          {allTags.length > 0 && (
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="input-field w-auto">
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto">
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
          </select>
          <button onClick={() => setSortOrder((o) => o === 'asc' ? 'desc' : 'asc')} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <h3 className="text-lg font-semibold text-white">Add a new task</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Task name
                <input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} required className="input-field" />
              </label>
              <label className="block text-sm text-slate-300">
                Subject
                <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Priority
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="input-field">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Due
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="input-field" />
              </label>
            </div>
            <label className="block text-sm text-slate-300">
              Tags (comma separated)
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-field" placeholder="e.g. urgent, review, project" />
            </label>
            {tasks.length > 0 && (
              <label className="block text-sm text-slate-300">
                Depends on
                <select
                  multiple
                  value={dependsOnInput}
                  onChange={(e) => setDependsOnInput(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="input-field"
                  size={3}
                >
                  {tasks.filter((t) => !t.completed).map((t) => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</span>
              </label>
            )}
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button className="button-primary w-full justify-center">Add task</button>
          </form>
        </div>

        <div className="card-soft">
          <h3 className="text-lg font-semibold text-white">Task list</h3>
          {loading ? <Spinner /> : (
            <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto">
              {tasks.map((task) => (
                <div key={task._id} className={`rounded-3xl p-5 shadow-lg shadow-slate-950/20 ${task.completed ? 'bg-slate-800/80' : 'bg-slate-950'}`}>
                  {editingId === task._id ? (
                    <div className="space-y-3">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" />
                      <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input-field" placeholder="Subject" />
                      <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')} className="input-field">
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                      </select>
                      <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} className="input-field" />
                      <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="input-field" placeholder="Tags (comma separated)" />
                      {tasks.length > 1 && (
                        <label className="block text-sm text-slate-300">
                          Depends on
                          <select
                            multiple
                            value={editDependsOn}
                            onChange={(e) => setEditDependsOn(Array.from(e.target.selectedOptions, (o) => o.value))}
                            className="input-field"
                            size={3}
                          >
                            {tasks.filter((t) => t._id !== task._id && !t.completed).map((t) => (
                              <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                          </select>
                          <span className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</span>
                        </label>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(task._id)} className="button-primary flex-1 justify-center">Save</button>
                        <button onClick={cancelEdit} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                          <p className="mt-2 text-sm text-slate-400">{task.category} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => toggleComplete(task)} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${task.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>
                            {task.completed ? 'Done' : 'Mark done'}
                          </button>
                          <button onClick={() => startEdit(task)} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Edit</button>
                          <button onClick={() => deleteTask(task._id)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-400">Delete</button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wider text-slate-400">{task.priority}</span>
                        {(task.tags || []).map((tag) => (
                          <span key={tag} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">#{tag}</span>
                        ))}
                        {(task.dependsOn || []).length > 0 && (
                          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
                            Blocked ({task.dependsOn.length} deps)
                          </span>
                        )}
                        {task.completed && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">Done</span>}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {tasks.length === 0 && <p className="text-slate-400">No tasks yet.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TasksPage;
