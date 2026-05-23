import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idSeq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idSeq;
      const t = { id, type: 'info', timeout: 4000, ...toast };
      setToasts((cur) => [...cur, t]);
      if (t.timeout) setTimeout(() => dismiss(id), t.timeout);
      return id;
    },
    [dismiss]
  );

  const api = {
    push,
    dismiss,
    success: (message) => push({ type: 'success', message }),
    error: (message) => push({ type: 'error', message, timeout: 6000 }),
    info: (message) => push({ type: 'info', message }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={
              'rounded-lg shadow-2xl backdrop-blur px-4 py-3 text-sm flex items-start justify-between gap-3 border ' +
              (t.type === 'success'
                ? 'bg-lime-500/15 border-lime-500/30 text-lime-300'
                : t.type === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-ink-800/90 border-ink-700 text-ink-100')
            }
          >
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-xs opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
