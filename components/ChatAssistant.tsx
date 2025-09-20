
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { ButlerIcon } from './icons/ButlerIcon';
import { ResetIcon } from './icons/ResetIcon';
import { cancel } from '../services/speechService';

interface ChatAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onResetChat: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onToggle, history, onSendMessage, isLoading, onResetChat }) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  useEffect(() => {
    // Cleanup function to stop any timeline narration when the chat is closed
    return () => {
      if (!isOpen) {
        cancel();
      }
    };
  }, [isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      cancel(); // Stop any ongoing timeline narration
      onSendMessage(userInput.trim());
      setUserInput('');
    }
  };

  const handleReset = () => {
    cancel(); // Stop any ongoing timeline narration
    onResetChat();
  }

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <button
          onClick={onToggle}
          className="bg-cyan-glow text-base rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-cyan-glow-light hover:scale-110 transform transition-all duration-300"
          style={{boxShadow: '0 0 20px theme(colors.cyan-glow.DEFAULT)'}}
          aria-label="Open Chat with Bt. Sebastian"
        >
          <ButlerIcon className="w-9 h-9" />
        </button>
      </div>

      <div
        className={`fixed bottom-0 right-0 z-40 m-0 flex h-[80vh] w-full flex-col bg-surface/95 font-body backdrop-blur-md shadow-2xl shadow-black/50 transition-all duration-500 ease-in-out sm:h-auto sm:max-h-[80vh] sm:max-w-md sm:rounded-lg sm:m-6 border-t sm:border border-cyan-glow/30 rounded-none ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex flex-shrink-0 items-center justify-between p-4 border-b border-cyan-glow/20">
          <h3 className="font-display text-xl text-cyan-glow">A Word with Bt. Sebastian</h3>
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="text-text-secondary/70 hover:text-text-primary" aria-label="Reset Chat">
              <ResetIcon className="h-5 w-5" />
            </button>
            <button onClick={onToggle} className="text-text-secondary/70 hover:text-text-primary" aria-label="Close Chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 self-start"><ButlerIcon className="w-8 h-8 text-amber-glow/80"/></div>}
              <div
                className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-cyan-glow/90'
                    : 'bg-dark-bg/80 text-text-secondary'
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-2 items-end">
              <div className="w-8 h-8 flex-shrink-0"><ButlerIcon className="w-8 h-8 text-amber-glow/80"/></div>
              <div className="bg-dark-bg/80 rounded-lg px-4 py-2 flex items-center justify-center">
                <div className="w-3 h-3 bg-text-secondary/50 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-3 h-3 bg-text-secondary/50 rounded-full animate-bounce mx-1" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-text-secondary/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="flex-shrink-0 p-4 border-t border-cyan-glow/20">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your inquiry..."
              className="w-full bg-dark-bg/80 border border-cyan-glow/30 rounded-md p-2 text-text-primary focus:ring-1 focus:ring-cyan-glow focus:border-cyan-glow transition-colors"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-cyan-glow/10 border border-cyan-glow/80 text-cyan-glow-light font-display tracking-wider uppercase py-2 px-4 rounded-md hover:bg-cyan-glow/20 hover:text-white disabled:bg-surface disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              aria-label="Send Message"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </>
  );
};

export default ChatAssistant;
