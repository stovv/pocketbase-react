import { useContext } from 'react';
import { AuthActionsContext, AuthContext } from '../context/auth/context';

export const useAuthContext = () => useContext(AuthContext);
