
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, View, HistoricalEvent, ChatMessage, Consequence } from './types';
import { generateTimeline, getCommentatorRemark, getButlerResponse, generateImage, getDrillDownText } from './services/geminiService';
import { initSpeechSynthesis } from './services/speechService';
import EventSelection from './components/EventSelection';
import TimelineView from './components/TimelineView';
import ChatAssistant from './components/ChatAssistant';
import DrillDownModal from './components/DrillDownModal';
import { HistoryIcon } from './components/icons/HistoryIcon';
import MatrixBackground from './components/MatrixBackground';

const initialButlerMessage: ChatMessage = {
  role: 'model',
  text: "A very good day to you, Sir. I am Bt. Sebastian, at your disposal. How may I assist with your alterations to the historical record?"
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: View.SELECTION,
    selectedEvent: null,
    consequences: [],
    commentary: null,
    isLoading: false,
    error: null,
    isChatOpen: false,
    chatHistory: [],
    isChatLoading: false,
    isSimulationComplete: false,
    drillDownModal: {
      isOpen: false,
      isLoading: false,
      content: null,
      consequence: null,
    },
  });

  useEffect(() => {
    initSpeechSynthesis();
  }, []);

  const handleStartSimulation = useCallback(async (event: HistoricalEvent) => {
    setAppState(prevState => ({
      ...prevState,
      view: View.SIMULATING,
      selectedEvent: event,
      consequences: [],
      commentary: null,
      isLoading: true,
      error: null,
      isSimulationComplete: false,
    }));

    try {
      const timelineConsequences = await generateTimeline(event);
      
      // Set initial timeline with loading placeholders
      const timelineWithLoaders = timelineConsequences.map(c =>
        c.type === 'event' ? { ...c, imageIsLoading: true } : c
      );
       setAppState(prevState => ({
        ...prevState,
        consequences: timelineWithLoaders,
        isLoading: false,
      }));

      // Asynchronously fetch all commentaries and images
      fetchCommentaries(event, timelineConsequences);
      fetchImages(timelineConsequences);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setAppState(prevState => ({
        ...prevState,
        isLoading: false,
        error: `Failed to simulate timeline. ${errorMessage}`,
      }));
    }
  }, []);

  const fetchCommentaries = async (event: HistoricalEvent, consequences: Consequence[]) => {
      const firstConsequence = consequences.find(c => c.type === 'event');
      const midPointHeaderIndex = consequences.findIndex(c => c.year === "Medium-Term Consequences");
      const futureHeaderIndex = consequences.findIndex(c => c.year === "Further in the Future...");

      // Initial commentary
      const initialPrompt = `A user has altered history. Event: "${event.name}". Change: "${event.proposedChange}". The immediate result is: "${firstConsequence?.event || 'an unknown effect'}". What is your dramatic observation?`;
      const initialCommentary = await getCommentatorRemark(initialPrompt);
      setAppState(prevState => ({ ...prevState, commentary: { ...prevState.commentary, initial: initialCommentary } }));

      // Mid-point commentary
      if (midPointHeaderIndex !== -1) {
          const midConsequence = consequences[midPointHeaderIndex + 1];
          if(midConsequence) {
            const midPrompt = `The timeline has settled after the initial chaos of "${event.proposedChange}". Now, a new era begins, marked by: "${midConsequence.event}". What is your observation on this emerging reality?`;
            const midCommentary = await getCommentatorRemark(midPrompt);
            setAppState(prevState => ({ ...prevState, commentary: { ...prevState.commentary, mid: midCommentary } }));
          }
      }

      // Final commentary
      if (futureHeaderIndex !== -1) {
          const finalConsequence = consequences[futureHeaderIndex + 1];
          if(finalConsequence) {
            const finalPrompt = `Centuries have passed since the timeline was altered by "${event.proposedChange}". The ultimate outcome is now clear: "${finalConsequence.event}". Give your final, profound pronouncement on this twisted thread of history.`;
            const finalCommentary = await getCommentatorRemark(finalPrompt);
            setAppState(prevState => ({ ...prevState, commentary: { ...prevState.commentary, final: finalCommentary } }));
          }
      }
  };

  const fetchImages = (consequences: Consequence[]) => {
      consequences.forEach(consequence => {
          if (consequence.type === 'event') {
              generateImage(consequence.event).then(imageUrl => {
                  setAppState(prevState => ({
                      ...prevState,
                      consequences: prevState.consequences.map(c =>
                          c.id === consequence.id
                              ? { ...c, imageUrl: imageUrl, imageIsLoading: false }
                              : c
                      )
                  }));
              });
          }
      });
  };

  const handleReset = () => {
    setAppState(prevState => ({
      ...prevState,
      view: View.SELECTION,
      selectedEvent: null,
      consequences: [],
      commentary: null,
      isLoading: false,
      error: null,
      isSimulationComplete: false,
      drillDownModal: { isOpen: false, isLoading: false, content: null, consequence: null },
    }));
  };
  
  const handleSimulationComplete = useCallback(() => {
    setAppState(prevState => ({ ...prevState, isSimulationComplete: true }));
  }, []);

  const handleToggleChat = () => {
    setAppState(prevState => {
      const isOpening = !prevState.isChatOpen;
      if (isOpening && prevState.chatHistory.length === 0) {
        return {
          ...prevState,
          isChatOpen: true,
          chatHistory: [initialButlerMessage]
        };
      }
      return { ...prevState, isChatOpen: !prevState.isChatOpen };
    });
  };
  
  const handleResetChat = () => {
    setAppState(prevState => ({
      ...prevState,
      chatHistory: [initialButlerMessage],
      isChatLoading: false,
    }));
  };
  
  const handleOpenDrillDown = async (consequence: Consequence) => {
    if (!appState.selectedEvent) return;
    
    setAppState(prevState => ({
      ...prevState,
      drillDownModal: { isOpen: true, isLoading: true, content: null, consequence: consequence },
    }));
    
    const contextTimeline = appState.consequences.slice(0, appState.consequences.findIndex(c => c.id === consequence.id) + 1);
    const drillDownText = await getDrillDownText(appState.selectedEvent, contextTimeline, consequence);

    setAppState(prevState => ({
        ...prevState,
        drillDownModal: { ...prevState.drillDownModal, isLoading: false, content: drillDownText },
    }));
  };

  const handleCloseDrillDown = () => {
    setAppState(prevState => ({
        ...prevState,
        drillDownModal: { isOpen: false, isLoading: false, content: null, consequence: null },
    }));
  };


  const handleSendMessageToButler = async (message: string) => {
    const newHistory: ChatMessage[] = [...appState.chatHistory, { role: 'user', text: message }];
    setAppState(prevState => ({ ...prevState, chatHistory: newHistory, isChatLoading: true }));

    let appContext = "The user is currently on the main event selection screen.";
    if (appState.view === View.SIMULATING && appState.selectedEvent) {
       if (appState.isSimulationComplete) {
          const consequencesText = appState.consequences.map(c => `- ${c.year}: ${c.event}`).join('\n');
          appContext = `The user has just completed a simulation and is reviewing the results. Here is the full "After Action Report":
Historical Event: ${appState.selectedEvent.name}
Proposed Change: ${appState.selectedEvent.proposedChange}
---
Full Consequences:
${consequencesText}
---
The user is now asking questions about this completed timeline.`;
      } else {
        appContext = `The user is watching the consequences unfold for the event "${appState.selectedEvent.name}" after proposing the change: "${appState.selectedEvent.proposedChange}".`;
      }
    }

    try {
      const butlerResponse = await getButlerResponse(newHistory, appContext);
      setAppState(prevState => ({
        ...prevState,
        chatHistory: [...newHistory, { role: 'model', text: butlerResponse }],
        isChatLoading: false,
      }));
    } catch (err) {
      console.error(err);
      const errorMessage = "My sincerest apologies, Sir, but it appears there is some interference on the line. I find myself unable to respond at this moment.";
      setAppState(prevState => ({
        ...prevState,
        chatHistory: [...newHistory, { role: 'model', text: errorMessage }],
        isChatLoading: false,
      }));
    }
  };

  const renderContent = () => {
    switch (appState.view) {
      case View.SELECTION:
        return <EventSelection onStart={handleStartSimulation} />;
      case View.SIMULATING:
        return (
          <TimelineView
            isLoading={appState.isLoading}
            event={appState.selectedEvent}
            consequences={appState.consequences}
            commentary={appState.commentary}
            error={appState.error}
            onReset={handleReset}
            onSimulationComplete={handleSimulationComplete}
            onDrillDown={handleOpenDrillDown}
          />
        );
      default:
        return <EventSelection onStart={handleStartSimulation} />;
    }
  };

  return (
    <>
      <MatrixBackground />
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-body">
        <header className="w-full max-w-7xl text-center mb-8 animate-scale-in" style={{animationDuration: '0.7s'}}>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <HistoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-glow" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-text-primary tracking-wider" style={{textShadow: '0 0 8px theme(colors.cyan-glow.DEFAULT)'}}>
              Timeline Twist
            </h1>
          </div>
          <p className="mt-2 text-base sm:text-lg text-text-secondary/80">What if history had gone differently?</p>
        </header>
        <main className="w-full max-w-7xl flex-grow">
          {renderContent()}
        </main>
        <ChatAssistant
          isOpen={appState.isChatOpen}
          onToggle={handleToggleChat}
          history={appState.chatHistory}
          onSendMessage={handleSendMessageToButler}
          isLoading={appState.isChatLoading}
          onResetChat={handleResetChat}
        />
        <DrillDownModal
          isOpen={appState.drillDownModal.isOpen}
          isLoading={appState.drillDownModal.isLoading}
          content={appState.drillDownModal.content}
          consequence={appState.drillDownModal.consequence}
          onClose={handleCloseDrillDown}
        />
      </div>
    </>
  );
};

export default App;