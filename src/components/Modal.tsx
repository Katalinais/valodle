"use client";

import { useEffect, useRef } from "react";

/** Diálogo modal nativo (<dialog>): foco atrapado y Esc para cerrar gratis. */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-auto w-[min(92vw,28rem)] rounded-lg border-2 border-val-ink-3 bg-val-ink-2 p-0 text-val-cream backdrop:bg-black/70"
    >
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="text-2xl text-val-muted hover:text-val-cream"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
