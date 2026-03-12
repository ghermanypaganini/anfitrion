"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "warning";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-white",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "error") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, variant }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-slide-in ${
              VARIANT_STYLES[t.variant]
            }`}
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {VARIANT_ICONS[t.variant]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
