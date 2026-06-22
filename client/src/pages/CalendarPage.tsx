import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface EventItem {
  _id: string;
  title: string;
  description?: string;
  date: string;
  type: 'exam' | 'assignment' | 'event';
  subject?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceEnd?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'exam' | 'assignment' | 'event'>('exam');
  const [subject, setSubject] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'exam' | 'assignment' | 'event'>('exam');
  const [editSubject, setEditSubject] = useState('');
  const toast = useToast();

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/calendar');
      setEvents(response.data);
    } catch {
      toast.show('Failed to load events.', 'error');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title || !date) { toast.show('Title and date required.', 'error'); return; }
    try {
      const response = await api.post('/calendar', {
        title, date: new Date(date).toISOString(), type, subject,
        description: `${type} for ${subject || 'general study'}`,
        recurrence, recurrenceEnd: recurrence !== 'none' ? undefined : undefined
      });
      setEvents((current) => [response.data, ...current]);
      setTitle(''); setDate(''); setSubject(''); setType('exam'); setRecurrence('none');
      toast.show('Event added!', 'success');
    } catch {
      toast.show('Failed to create event.', 'error');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      setEvents((current) => current.filter((e) => e._id !== id));
      toast.show('Event deleted.', 'success');
    } catch {
      toast.show('Failed to delete event.', 'error');
    }
  };

  const startEdit = (eventItem: EventItem) => {
    setEditingId(eventItem._id);
    setEditTitle(eventItem.title);
    setEditDate(eventItem.date.split('T')[0]);
    setEditType(eventItem.type);
    setEditSubject(eventItem.subject || '');
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await api.put(`/calendar/${id}`, {
        title: editTitle, date: new Date(editDate).toISOString(), type: editType, subject: editSubject,
        description: `${editType} for ${editSubject || 'general study'}`
      });
      setEvents((current) => current.map((e) => (e._id === id ? response.data : e)));
      setEditingId(null);
      toast.show('Event updated!', 'success');
    } catch {
      toast.show('Failed to update event.', 'error');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date.startsWith(dateStr));
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();

  const typeColors = { exam: 'bg-rose-500', assignment: 'bg-amber-500', event: 'bg-blue-500' };

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Calendar</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Plan your study schedule</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-2xl text-sm font-semibold ${view === 'grid' ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-2xl text-sm font-semibold ${view === 'list' ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>List</button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card">
          {view === 'grid' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-slate-400 hover:text-white px-3 py-1">← Prev</button>
                <h3 className="text-lg font-semibold text-white">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={nextMonth} className="text-slate-400 hover:text-white px-3 py-1">Next →</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d) => <div key={d} className="text-center text-xs text-slate-500 font-semibold py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDate(day);
                  const selected = selectedDate === `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${day}`;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(`${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${day}`)}
                      className={`relative min-h-[60px] rounded-xl p-1 text-left transition-all ${
                        isToday(day) ? 'bg-violet-500/20 ring-1 ring-violet-500' :
                        selected ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`text-sm ${isToday(day) ? 'font-bold text-violet-300' : 'text-slate-300'}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div key={e._id} className={`w-full h-1.5 rounded-full ${typeColors[e.type]}`} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedDate && (
                <div className="mt-4 rounded-2xl bg-slate-950 p-4">
                  <p className="text-sm text-slate-400 mb-2">Events on {selectedDate}</p>
                  {events.filter((e) => e.date.startsWith(selectedDate!.replace(/(\d+)-(\d+)-(\d+)/, '$1-$2-$3'))).map((e) => (
                    <div key={e._id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div>
                        <p className="text-white font-medium">{e.title}</p>
                        <p className="text-xs text-slate-400">{e.type} • {e.subject || 'General'}</p>
                      </div>
                      <button onClick={() => deleteEvent(e._id)} className="text-rose-400 hover:text-rose-300 text-sm">Delete</button>
                    </div>
                  ))}
                  {events.filter((e) => e.date.startsWith(selectedDate!)).length === 0 && (
                    <p className="text-sm text-slate-500">No events</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {events.length > 0 ? events.map((eventItem) => (
                <div key={eventItem._id} className="rounded-2xl bg-slate-950 p-4">
                  {editingId === eventItem._id ? (
                    <div className="space-y-2">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" />
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="input-field" />
                      <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="input-field" placeholder="Subject" />
                      <select value={editType} onChange={(e) => setEditType(e.target.value as any)} className="input-field">
                        <option value="exam">Exam</option><option value="assignment">Assignment</option><option value="event">Event</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(eventItem._id)} className="button-primary flex-1 justify-center">Save</button>
                        <button onClick={() => setEditingId(null)} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{eventItem.type}</p>
                        <p className="text-lg font-semibold text-white">{eventItem.title}</p>
                        <p className="text-sm text-slate-400">{eventItem.subject || 'General'} • {new Date(eventItem.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(eventItem)} className="text-sm text-slate-400 hover:text-white">Edit</button>
                        <button onClick={() => deleteEvent(eventItem._id)} className="text-sm text-rose-400 hover:text-rose-300">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              )) : <p className="text-slate-400">No events yet.</p>}
            </div>
          )}
        </div>

        <div className="card-soft">
          <h3 className="text-lg font-semibold text-white">Add event</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" placeholder="Event title" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-field" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="Subject (optional)" />
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-field">
              <option value="exam">Exam</option><option value="assignment">Assignment</option><option value="event">Event</option>
            </select>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as any)} className="input-field">
              <option value="none">No repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
            <button className="button-primary w-full justify-center">Add event</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
