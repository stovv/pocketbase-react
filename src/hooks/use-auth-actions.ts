import { useContext } from 'react';
import { AuthActionsContext } from '../context/auth/context';

// Gets only auth actions without user auth data
export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);

  return context?.actions;
};
