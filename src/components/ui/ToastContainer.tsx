import { useToastStore } from "../../store/useToastStore";
import { X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast toast-end toast-bottom z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert flex flex-row items-center gap-2 p-3 min-w-[300px] shadow-lg animate-in slide-in-from-right duration-300 ${
            toast.type === "success"
              ? "alert-success text-white"
              : toast.type === "error"
                ? "alert-error text-white"
                : toast.type === "warning"
                  ? "alert-warning text-black"
                  : "alert-info text-white"
          }`}
        >
          <span className="flex-1 font-medium text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="btn btn-xs btn-circle btn-ghost text-current opacity-80 hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
