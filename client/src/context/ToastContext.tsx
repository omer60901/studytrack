import React, { createContext, useContext, useEffect, useState } from 'react';

type Toast = { id: number; message: string; type?: 'error' | 'info' | 'success' };

const ToastContext = createContext<{ show: (m: string, t?: Toast['type']) => void } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onApiError = (e: any) => {
      const message = e?.detail?.message || 'API error';
      show(message, 'error');
    };
    window.addEventListener('api-error', onApiError as EventListener);
    return () => window.removeEventListener('api-error', onApiError as EventListener);
  }, []);

  const show = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div key={toast.id} className={`max-w-xs px-4 py-2 rounded shadow-lg text-sm ${toast.type === 'error' ? 'bg-red-700 text-white' : 'bg-slate-800 text-white'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
