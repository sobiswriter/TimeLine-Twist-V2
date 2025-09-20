export enum View {
  SELECTION = 'SELECTION',
  SIMULATING = 'SIMULATING',
}

export interface HistoricalEvent {
  id: string;
  name: string;
  description: string;
  proposedChange: string;
}

export interface Consequence {
  id: string;
  year: number | string;
  event: string;
  type: 'event' | 'header' | 'summary';
  imageUrl?: string;
  imageIsLoading?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Commentary {
  initial: string | null;
  mid: string | null;
  final: string | null;
}

export interface DrillDownModalState {
  isOpen: boolean;
  isLoading: boolean;
  content: string | null;
  consequence: Consequence | null;
}

export interface AppState {
  view: View;
  selectedEvent: HistoricalEvent | null;
  consequences: Consequence[];
  commentary: Commentary | null;
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  isSimulationComplete: boolean;
  drillDownModal: DrillDownModalState;
}