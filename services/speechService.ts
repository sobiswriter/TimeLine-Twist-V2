
let voices: SpeechSynthesisVoice[] = [];
let voiceToUse: SpeechSynthesisVoice | null = null;
const desiredVoiceName = "Umbriel";
const fallbackVoiceNames = ["Google UK English Male", "Daniel"];

let utteranceQueue: SpeechSynthesisUtterance[] = [];
let finalCallback: (() => void) | undefined;

const populateVoices = () => {
  voices = window.speechSynthesis.getVoices();
  voiceToUse = 
    voices.find(voice => voice.name.includes(desiredVoiceName)) ||
    voices.find(voice => fallbackVoiceNames.includes(voice.name)) ||
    voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Male')) ||
    voices.find(voice => voice.lang === 'en-GB') ||
    null;
};

export const initSpeechSynthesis = () => {
  if (typeof window.speechSynthesis === 'undefined') {
    console.error('Speech Synthesis is not supported by this browser.');
    return;
  }
  
  populateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
};

const playNextInQueue = () => {
  if (utteranceQueue.length === 0) {
    if (finalCallback) {
      finalCallback();
      finalCallback = undefined;
    }
    return;
  }

  const utterance = utteranceQueue.shift()!;
  
  // Configure and speak the utterance
  utterance.onend = playNextInQueue;
  utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
    // Log a more descriptive error and continue with the queue
    console.error(`Speech synthesis error: ${event.error}`, { utteranceText: utterance.text });
    playNextInQueue();
  };

  if (voiceToUse) {
    utterance.voice = voiceToUse;
  } else if (!voiceToUse && voices.length > 0) {
    console.warn("Could not find desired 'Umbriel' voice or a suitable fallback. Using browser default.");
  }
  
  utterance.pitch = 0.8;
  utterance.rate = 0.95; 

  window.speechSynthesis.speak(utterance);
};

export const speak = (text: string, onEndCallback?: () => void) => {
  if (typeof window.speechSynthesis === 'undefined') {
    console.error('Speech Synthesis not supported.');
    if (onEndCallback) onEndCallback();
    return;
  }

  // Stop any current speech and clear the old queue/callback
  cancel();
  finalCallback = onEndCallback;

  // Split text into chunks. Using a double newline as a delimiter,
  // which matches how the full timeline text is constructed.
  const chunks = text.split('\n\n').filter(chunk => chunk.trim().length > 0);

  if (chunks.length === 0) {
    if (onEndCallback) {
      onEndCallback();
    }
    return;
  }
  
  utteranceQueue = chunks.map(chunk => new SpeechSynthesisUtterance(chunk));
  
  playNextInQueue();
};

export const cancel = () => {
  if (typeof window.speechSynthesis !== 'undefined') {
    utteranceQueue = [];
    finalCallback = undefined;
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
  }
};
