'use client';
import { useEffect } from 'react';

export type ToastMsg = { id: number; text: string; type: 'success' | 'error' };

type Props = { toasts: ToastMsg[]; remove: (id: number) => void };

export default function Toast({ toasts, remove }: Props) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} remove={remove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, remove }: { toast: ToastMsg; remove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <div style={{
      background: toast.type === 'error' ? '#FEF2F2' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${toast.type === 'error' ? '#FECACA' : 'var(--line)'}`,
      borderRadius: 12, padding: '12px 18px', fontSize: 13,
      color: toast.type === 'error' ? '#991B1B' : 'var(--ink)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(8px)',
      cursor: 'pointer',
      maxWidth: 300,
    }} onClick={() => remove(toast.id)}>
      {toast.text}
    </div>
  );
}
