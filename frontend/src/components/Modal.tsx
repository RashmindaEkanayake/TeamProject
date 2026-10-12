import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  maxWidthClass = "max-w-lg",
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${maxWidthClass} bg-surface-elevated border border-glass-border rounded-2xl shadow-2xl overflow-hidden z-10`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-surface/50">
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-muted hover:text-on-surface hover:bg-outline-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
