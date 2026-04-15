import { createContext } from 'react';
import { AuthActionsContextType, AuthContextType } from '../../types';

export const AuthContext = createContext<AuthContextType | null>(null);
export const AuthActionsContext = createContext<AuthActionsContextType | null>(null);
