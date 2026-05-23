import { useState } from 'react';

const Modal = ({ children, className = '', onOpenChange, isOpen = false, ...props }) => {
  const [open, setOpen] = useState(isOpen);

  // Sync isOpen prop with state
  if (isOpen !== open) {
    setOpen(isOpen);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:justify-center" onClick={!props.disableBackdropClick ? () => setOpen(false) : undefined}>
        <div
          onClick={e => e.stopPropagation()}
          className={`relative z-50 w-full max-w-md max-h-[90vh] overflow-y-auto ${className}`}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          <div className="fixed inset-0" aria-hidden="true" />
          <div className="pointer-events-auto bg-card text-card-foreground rounded-lg shadow-xl ring-1 ring-black ring-black/5">
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
      {/* Prevent background scroll when modal is open */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" />
    </>
  );
};

export default Modal;