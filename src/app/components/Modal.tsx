import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal premium :
 *   - Backdrop fade-in (lk-backdrop-enter via animations.css)
 *   - Mobile : slide-up depuis le bas (full-width, rounded-t-3xl)
 *   - Desktop : scale-in centré (rounded-3xl, max-w-lg)
 *   - Header compact, padding harmonisé, scroll fluide
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="lk-backdrop-enter absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal — slide-up sur mobile, scale-in sur desktop via @media interne */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl lk-modal-anim"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header compact */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="lk-btn w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="h-4 w-4" style={{ color: "var(--lokadia-gray-500)" }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto max-h-[60vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">{footer}</div>
        )}
      </div>

      <style>{`
        @keyframes lk-modal-mobile {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes lk-modal-desktop {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .lk-modal-anim {
          animation: lk-modal-mobile 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (min-width: 640px) {
          .lk-modal-anim {
            animation: lk-modal-desktop 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lk-modal-anim { animation: none; }
        }
      `}</style>
    </div>
  );
}
