"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: ToastType = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="px-4 py-2 rounded shadow border text-sm animate-fadein"
            style={{
              backgroundColor:
                toast.type === "success"
                  ? "hsl(var(--success-bg))"
                  : toast.type === "error"
                  ? "hsl(var(--error-bg))"
                  : "hsl(var(--popover))",
              color:
                toast.type === "success"
                  ? "hsl(var(--success-text))"
                  : toast.type === "error"
                  ? "hsl(var(--error-text))"
                  : "hsl(var(--popover-foreground))",
              borderColor: "hsl(var(--border))",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Add a simple fade-in animation
// In your globals.css, add:
// @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
// .animate-fadein { animation: fadein 0.3s ease; }
