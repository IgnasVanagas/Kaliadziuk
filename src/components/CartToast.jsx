import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CartToast({
  open,
  onClose,
  title,
  actionLabel,
  actionTo,
  autoHideMs = 3500,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const id = window.setTimeout(() => {
      onClose?.();
    }, autoHideMs);
    return () => window.clearTimeout(id);
  }, [autoHideMs, onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="glass-card flex items-center gap-4 rounded-3xl px-5 py-4 text-black shadow-[0_20px_70px_rgba(15,23,42,0.2)]">
        <div className="min-w-0">
          <div className="font-semibold truncate">{title}</div>
        </div>

        {actionTo ? (
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center rounded-full glass-green-surface px-4 py-2 text-sm font-extrabold text-black"
            onClick={() => onClose?.()}
          >
            {actionLabel}
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => onClose?.()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
}
