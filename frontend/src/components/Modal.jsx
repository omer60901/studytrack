import { X } from "lucide-react";

export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black">{title}</h3>
          <button className="btn-soft h-10 w-10 p-0" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
