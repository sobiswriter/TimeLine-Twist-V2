
import React, { useState } from 'react';
import { PREDEFINED_EVENTS } from '../constants';
import type { HistoricalEvent } from '../types';

interface EventSelectionProps {
  onStart: (event: HistoricalEvent) => void;
}

const EventSelection: React.FC<EventSelectionProps> = ({ onStart }) => {
  const [customEventName, setCustomEventName] = useState('');
  const [customEventChange, setCustomEventChange] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEventName.trim() && customEventChange.trim()) {
      onStart({
        id: 'custom',
        name: customEventName.trim(),
        description: 'A user-defined moment in history.',
        proposedChange: customEventChange.trim(),
      });
    }
  };

  return (
    <div className="animate-scale-in space-y-12">
      <div>
        <h2 className="text-3xl font-display text-center text-amber-glow mb-6" style={{textShadow: '0 0 8px theme(colors.amber-glow.DEFAULT)'}}>Choose a Moment to Twist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PREDEFINED_EVENTS.map((event) => (
            <div
              key={event.id}
              className="bg-surface/90 border border-cyan-glow/20 rounded-lg p-6 flex flex-col justify-between hover:border-cyan-glow/60 hover:shadow-[0_0_15px_theme(colors.cyan-glow.DEFAULT)] transition-all duration-300 cursor-pointer backdrop-blur-sm group"
              onClick={() => onStart(event)}
            >
              <div>
                <h3 className="text-xl font-display text-amber-glow">{event.name}</h3>
                <p className="text-text-secondary text-base mt-2 font-body">{event.description}</p>
                <p className="text-cyan-glow/80 mt-3 text-base font-body">
                  <span className="font-semibold text-text-primary not-italic">What if...</span> {event.proposedChange}
                </p>
              </div>
              <button
                className="mt-4 w-full bg-cyan-glow/10 border border-cyan-glow/80 text-cyan-glow-light font-display tracking-wider uppercase text-sm py-1.5 px-3 rounded-md group-hover:bg-cyan-glow/20 group-hover:text-white group-hover:shadow-[0_0_10px_theme(colors.cyan-glow.DEFAULT)] group-hover:scale-105 transition-all duration-300 transform"
                aria-label={`Simulate change for ${event.name}`}
              >
                Simulate
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-cyan-glow/20"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-dark-bg px-4 text-xl font-display text-text-secondary/60">OR</span>
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-display text-center text-amber-glow mb-6" style={{textShadow: '0 0 8px theme(colors.amber-glow.DEFAULT)'}}>Forge Your Own History</h2>
        <form onSubmit={handleCustomSubmit} className="bg-surface/90 border border-cyan-glow/20 backdrop-blur-sm rounded-lg p-6 space-y-4 max-w-2xl mx-auto">
          <div>
            <label htmlFor="custom-event" className="block text-sm font-bold tracking-wide text-text-secondary/70 mb-1">Historical Event</label>
            <input
              id="custom-event"
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              placeholder="e.g., The Library of Alexandria"
              className="w-full bg-dark-bg/80 border border-cyan-glow/30 rounded-md p-2 text-text-primary focus:ring-1 focus:ring-cyan-glow focus:border-cyan-glow transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="custom-change" className="block text-sm font-bold tracking-wide text-text-secondary/70 mb-1">The Twist</label>
            <textarea
              id="custom-change"
              value={customEventChange}
              onChange={(e) => setCustomEventChange(e.target.value)}
              placeholder="e.g., The library never burns down and its knowledge is preserved."
              className="w-full bg-dark-bg/80 border border-cyan-glow/30 rounded-md p-2 text-text-primary focus:ring-1 focus:ring-cyan-glow focus:border-cyan-glow transition-colors"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-glow/10 border border-cyan-glow/80 text-cyan-glow-light font-display tracking-wider uppercase text-lg py-2 px-4 rounded-md hover:bg-cyan-glow/20 hover:text-white hover:shadow-[0_0_10px_theme(colors.cyan-glow.DEFAULT)] hover:scale-105 disabled:bg-surface disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300 transform"
            disabled={!customEventName.trim() || !customEventChange.trim()}
          >
            Simulate Custom Timeline
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventSelection;