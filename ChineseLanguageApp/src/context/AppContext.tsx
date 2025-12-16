import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Message, Correction } from '../types/message.types';

// State interface
interface AppState {
  conversationHistory: Message[];
  currentCorrection: Correction | null;
  isProcessing: boolean;
  autoSpeak: boolean;
  recordedMessage: string;
  isRecording: boolean;
}

// Action types
type AppAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CORRECTION'; payload: Correction | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'TOGGLE_AUTO_SPEAK' }
  | { type: 'SET_RECORDED_MESSAGE'; payload: string }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'CLEAR_CONVERSATION' };

// Initial state
const initialState: AppState = {
  conversationHistory: [],
  currentCorrection: null,
  isProcessing: false,
  autoSpeak: true,
  recordedMessage: '',
  isRecording: false
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, action.payload]
      };

    case 'SET_CORRECTION':
      return {
        ...state,
        currentCorrection: action.payload
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'TOGGLE_AUTO_SPEAK':
      return {
        ...state,
        autoSpeak: !state.autoSpeak
      };

    case 'SET_RECORDED_MESSAGE':
      return {
        ...state,
        recordedMessage: action.payload
      };

    case 'SET_RECORDING':
      return {
        ...state,
        isRecording: action.payload
      };

    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        conversationHistory: [],
        currentCorrection: null
      };

    default:
      return state;
  }
}

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
