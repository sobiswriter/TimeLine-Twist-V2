import React, { useEffect } from 'react';
import type { Consequence } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string | null;
  consequence: Consequence | null;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, isLoading, content, consequence }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-surface border border-cyan-glow/30 rounded-lg shadow-2xl shadow-cyan-glow/10 w-full max-w-2xl m-4 animate-scale-in p-6"
        style={{ animationDuration: '0.3s' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between pb-4 border-b border-cyan-glow/20">
          <div>
            <h2 className="text-2xl font-display text-amber-glow">{consequence?.year}</h2>
            <p className="text-text-secondary mt-1">{consequence?.event}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="py-6 min-h-[10rem] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <LoadingSpinner />
              <p className="text-cyan-glow-light">Retrieving temporal data...</p>
            </div>
          ) : (
            <p className="text-text-primary/90 text-lg leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
        <footer className="text-right pt-4 border-t border-cyan-glow/20">
          <button
            onClick={onClose}
            className="bg-cyan-glow/10 border border-cyan-glow/80 text-cyan-glow-light font-display tracking-wider uppercase text-sm py-1.5 px-4 rounded-md hover:bg-cyan-glow/20 hover:text-white transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DrillDownModal;
