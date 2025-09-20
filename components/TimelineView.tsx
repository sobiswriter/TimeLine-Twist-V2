
import React, { useState, useEffect, Fragment } from 'react';
import type { HistoricalEvent, Consequence, Commentary } from '../types';
import { speak, cancel } from '../services/speechService';
import LoadingSpinner from './LoadingSpinner';
import ImageWithLoader from './ImageWithLoader';
import { CommentatorIcon } from './icons/CommentatorIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { StopIcon } from './icons/StopIcon';
import { DrillDownIcon } from './DrillDownIcon';

interface TimelineViewProps {
  isLoading: boolean;
  event: HistoricalEvent | null;
  consequences: Consequence[];
  commentary: Commentary | null;
  error: string | null;
  onReset: () => void;
  onSimulationComplete: () => void;
  onDrillDown: (consequence: Consequence) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ isLoading, event, consequences, commentary, error, onReset, onSimulationComplete, onDrillDown }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);

  useEffect(() => {
    // Reset animation when the core event or its consequences change
    setVisibleCount(0);

    if (isLoading || consequences.length === 0) {
      return;
    }

    let intervalId: number;
    const timer = setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleCount(prevCount => {
          if (prevCount < consequences.length) {
            return prevCount + 1;
          }
          clearInterval(intervalId);
          onSimulationComplete();
          return prevCount;
        });
      }, 2500); // Slower pace for images to load
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
    // This effect should only re-run when a new simulation starts.
    // Using event.id and consequences.length as the key for this.
  }, [event?.id, isLoading, consequences.length, onSimulationComplete]);

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => { cancel(); }
  }, []);

  const handleToggleNarration = () => {
    if (isNarrating) {
      cancel();
      setIsNarrating(false);
    } else {
      const fullTimelineText = consequences
        .map(c => {
          if (c.type === 'summary') return c.event;
          if (c.type === 'header') return c.year;
          return `${c.year}. ${c.event}`;
        })
        .join('\n\n');

      speak(fullTimelineText, () => setIsNarrating(false));
      setIsNarrating(true);
    }
  };


  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-64"><LoadingSpinner /><p className="mt-4 text-lg text-cyan-glow-light font-display tracking-wider">The loom of fate is weaving a new reality...</p></div>;
  }

  if (error) {
    return (
      <div className="text-center text-text-primary bg-red-900/50 border border-red-500 p-6 rounded-lg">
        <h3 className="text-2xl font-display text-amber-glow">A Paradox Occurred!</h3>
        <p className="mt-2">{error}</p>
        <button onClick={onReset} className="mt-6 bg-surface text-cyan-glow-light font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
          Return to a Stable Timeline
        </button>
      </div>
    );
  }
  
  const visibleConsequences = consequences.slice(0, visibleCount);

  return (
    <div className="w-full animate-scale-in font-body">
      <div className="text-center mb-8 bg-surface/90 p-4 rounded-lg border border-amber-glow/20">
        <h2 className="text-2xl sm:text-3xl font-display text-amber-glow">{event?.name}</h2>
        <p className="text-md sm:text-lg text-cyan-glow/80 mt-1">What if... {event?.proposedChange}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="mb-8 lg:mb-0 lg:sticky top-8 h-fit">
          {commentary?.initial && (
            <div className="bg-surface/95 border border-amber-glow/30 backdrop-blur-sm rounded-lg p-5 animate-fade-in">
              <h4 className="font-display text-xl text-amber-glow flex items-center gap-2">
                <CommentatorIcon className="w-6 h-6 text-amber-glow"/>
                The Observer's Remark
              </h4>
              <p className="text-text-primary/90 mt-3 italic text-lg leading-relaxed" style={{textShadow: '0 0 4px theme(colors.black)'}}>"{commentary.initial}"</p>
            </div>
          )}
        </aside>
        
        <div className="lg:col-span-2 lg:order-first">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <h3 className="text-xl sm:text-2xl font-display text-text-secondary/80">The Unfolding Consequences...</h3>
            {visibleCount === consequences.length && consequences.length > 0 && (
                <button
                    onClick={handleToggleNarration}
                    className="flex items-center gap-2 text-sm bg-cyan-glow/10 border border-cyan-glow/50 text-cyan-glow-light px-3 py-1 rounded-md hover:bg-cyan-glow/20 transition-colors disabled:opacity-50"
                    aria-live="polite"
                >
                    {isNarrating ? (<><StopIcon className="w-4 h-4" />Stop</>) : (<><SpeakerIcon className="w-4 h-4" />Narrate</>)}
                </button>
            )}
          </div>
          <div className="relative pl-6 md:pl-8 border-l-2 border-cyan-glow/30">
            {visibleConsequences.map((c) => {
              const key = c.id;

              if (c.type === 'header') {
                  let commentaryToShow = null;
                  let title = "The Observer Reflects...";
                  if (c.year === 'Medium-Term Consequences' && commentary?.mid) commentaryToShow = commentary.mid;
                  if (c.year === 'Further in the Future...' && commentary?.final) {
                    commentaryToShow = commentary.final;
                    title = "The Observer's Final Word";
                  }

                  return (
                      <Fragment key={key}>
                          <div className="relative mb-6 -ml-6 md:-ml-8 mt-12 animate-fade-in">
                              <h4 className="text-xl sm:text-2xl font-display text-cyan-glow/80 tracking-wider">{c.year}</h4>
                          </div>
                          {commentaryToShow && (
                            <div className="relative my-8 animate-fade-in">
                                <div className="bg-surface/95 border border-amber-glow/30 backdrop-blur-sm rounded-lg p-5">
                                    <h4 className="font-display text-xl text-amber-glow flex items-center gap-2">
                                        <CommentatorIcon className="w-6 h-6 text-amber-glow" />
                                        {title}
                                    </h4>
                                    <p className="text-text-primary/90 mt-3 italic text-lg leading-relaxed">"{commentaryToShow}"</p>
                                </div>
                            </div>
                          )}
                      </Fragment>
                  );
              }

              if (c.type === 'summary') {
                return (
                  <div key={key} className="relative mt-8 -ml-6 md:-ml-8 animate-fade-in">
                    <p className="text-text-secondary/70 text-base sm:text-lg italic text-center border-t border-b border-cyan-glow/20 py-4">{c.event}</p>
                  </div>
                );
              }
              
              // Default is 'event'
              return (
                <div key={key} className="mb-8 relative animate-fade-in">
                  <div className="absolute w-4 h-4 bg-cyan-glow rounded-full top-1 border-4 border-dark-bg -left-[1.2rem] md:-left-[1.65rem]" style={{boxShadow: '0 0 8px theme(colors.cyan-glow.DEFAULT)'}}></div>
                  <div className="space-y-3">
                    <ImageWithLoader isLoading={c.imageIsLoading ?? false} src={c.imageUrl} alt={c.event} />
                    <p className="text-amber-glow font-bold text-xl sm:text-2xl font-display">{c.year}</p>
                    <p className="text-text-primary text-base sm:text-lg leading-relaxed">{c.event}</p>
                    <button onClick={() => onDrillDown(c)} className="flex items-center gap-2 text-sm bg-cyan-glow/10 border border-cyan-glow/50 text-cyan-glow-light px-3 py-1 rounded-md hover:bg-cyan-glow/20 transition-colors disabled:opacity-50">
                        <DrillDownIcon className="w-4 h-4"/>
                        Details
                    </button>
                  </div>
                </div>
              );
            })}
             {visibleCount === consequences.length && consequences.length > 0 && (
                <div className="text-center mt-10 animate-fade-in">
                    <p className="text-text-secondary/70 text-base sm:text-lg italic">...and so, the river of time flows down its new, uncertain path.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <button 
          onClick={onReset} 
          className="bg-cyan-glow/10 border border-cyan-glow/80 text-cyan-glow-light font-display tracking-wider uppercase text-lg py-2 px-8 rounded-md hover:bg-cyan-glow/20 hover:text-white hover:shadow-[0_0_10px_theme(colors.cyan-glow.DEFAULT)] hover:scale-105 transition-all duration-300 transform"
        >
          Change Another Event
        </button>
      </div>
    </div>
  );
};

export default TimelineView;
