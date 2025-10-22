import React from 'react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onClose?: () => void;
};

const ConfirmDialog: React.FC<Props> = ({ open, title, description, confirmLabel = 'Confirm', onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, .5)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {description && <p style={{ color: 'var(--muted)' }}>{description}</p>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
