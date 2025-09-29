'use client';

import React, { useEffect, useRef } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Classe extra aplicada ao contêiner do conteúdo (painel)
   */
  className?: string;
  /**
   * Se verdadeiro, clicar no backdrop fecha o modal (default: true)
   */
  closeOnBackdrop?: boolean;
  /**
   * Se verdadeiro, pressionar ESC fecha o modal (default: true)
   */
  closeOnEscape?: boolean;
};

export function Modal({
  open,
  onClose,
  children,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fecha com ESC
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
  }, [open, closeOnEscape, onClose]);

  // Foco inicial no painel para acessibilidade
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={[
          'w-full max-w-2xl rounded-lg border border-black/10 dark:border-white/10 bg-white p-6 shadow-xl',
          'text-slate-900 dark:bg-slate-900 dark:text-slate-100',
          'outline-none',
          className,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
