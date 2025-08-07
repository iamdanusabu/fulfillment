
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  domain: string;
}

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type StoreAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: StoreState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true,
        loading: false,
        error: null 
      };
    case 'CLEAR_USER':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        loading: false 
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    default:
      return state;
  }
}

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'token_expires_in'
      ]);
      dispatch({ type: 'CLEAR_USER' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, logout }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
