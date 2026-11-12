import { useEffect, useId, useRef, type ReactNode } from 'react';

function isOutside(el: HTMLElement, x: number, y: number): boolean {
  const r = el.getBoundingClientRect();
  return x < r.left || x > r.right || y < r.top || y > r.bottom;
}

/**
 * Styled replacement for window.confirm, built on the native <dialog>
 * (focus trapping, Escape to cancel and the backdrop come for free).
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      aria-describedby={children ? bodyId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onPointerDown={(e) => {
        downOnBackdrop.current = isOutside(e.currentTarget, e.clientX, e.clientY);
      }}
      onClick={(e) => {
        // Cancel only when the press both started and ended on the backdrop,
        // never on the dialog's own airmail border or after a drag out of the card.
        if (downOnBackdrop.current && isOutside(e.currentTarget, e.clientX, e.clientY)) onCancel();
        downOnBackdrop.current = false;
      }}
    >
      <div className="dialog-card">
        <h2 id={titleId} className="dialog-title">
          {title}
        </h2>
        {children && (
          <div id={bodyId} className="dialog-body">
            {children}
          </div>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
