import { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ImportExport = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const [tasks, subjects, events, notes, flashcards, plans] = await Promise.all([
        api.get('/tasks?limit=1000'),
        api.get('/subjects'),
        api.get('/calendar'),
        api.get('/notes').catch(() => ({ data: [] })),
        api.get('/flashcards').catch(() => ({ data: [] })),
        api.get('/planner').catch(() => ({ data: [] }))
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        tasks: tasks.data.data || tasks.data,
        subjects: subjects.data,
        events: events.data,
        notes: notes.data,
        flashcards: flashcards.data,
        plans: plans.data
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('Data exported successfully!', 'success');
    } catch {
      toast.show('Failed to export data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.tasks) {
        for (const task of data.tasks) {
          const { _id, user, createdAt, updatedAt, __v, ...rest } = task;
          await api.post('/tasks', rest).catch(() => {});
        }
      }
      if (data.subjects) {
        for (const subject of data.subjects) {
          const { _id, user, createdAt, updatedAt, __v, ...rest } = subject;
          await api.post('/subjects', rest).catch(() => {});
        }
      }
      if (data.events) {
        for (const event of data.events) {
          const { _id, user, createdAt, updatedAt, __v, ...rest } = event;
          await api.post('/calendar', rest).catch(() => {});
        }
      }
      if (data.notes) {
        for (const note of data.notes) {
          const { _id, user, createdAt, updatedAt, __v, ...rest } = note;
          await api.post('/notes', rest).catch(() => {});
        }
      }
      if (data.flashcards) {
        for (const card of data.flashcards) {
          const { _id, user, createdAt, updatedAt, __v, ...rest } = card;
          await api.post('/flashcards', rest).catch(() => {});
        }
      }

      toast.show('Data imported successfully! Refresh to see changes.', 'success');
    } catch {
      toast.show('Failed to import data. Check the file format.', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white">Import / Export</h3>
      <p className="text-sm text-slate-400 mt-2">Backup your data or restore from a previous export.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={handleExport} disabled={exporting} className="button-primary">
          {exporting ? 'Exporting...' : 'Export all data'}
        </button>
        <label className="button-primary cursor-pointer">
          {importing ? 'Importing...' : 'Import data'}
          <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
        </label>
      </div>
    </div>
  );
};

export default ImportExport;
