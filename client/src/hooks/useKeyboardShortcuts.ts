import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const nextKey = (ke: KeyboardEvent) => {
          document.removeEventListener('keydown', nextKey);
          if (ke.key === 'd') navigate('/');
          else if (ke.key === 't') navigate('/tasks');
          else if (ke.key === 's') navigate('/subjects');
          else if (ke.key === 'c') navigate('/calendar');
          else if (ke.key === 'a') navigate('/analytics');
          else if (ke.key === 'p') navigate('/planner');
          else if (ke.key === 'n') navigate('/notes');
          else if (ke.key === 'f') navigate('/flashcards');
          else if (ke.key === ',') navigate('/settings');
        };
        document.addEventListener('keydown', nextKey, { once: true });
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
};

export default useKeyboardShortcuts;
