import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle size={18} className="text-emerald-400" />,
            info: <Info size={18} className="text-blue-400" />,
            warning: <AlertTriangle size={18} className="text-amber-400" />,
            error: <XCircle size={18} className="text-red-400" />,
          };
          const borders = {
            success: 'border-emerald-500/30',
            info: 'border-blue-500/30',
            warning: 'border-amber-500/30',
            error: 'border-red-500/30',
          };
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-gray-900 border ${borders[toast.type]} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 min-w-[280px] max-w-[400px]`}
            >
              {icons[toast.type]}
              <p className="text-sm font-semibold flex-1 leading-snug">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
