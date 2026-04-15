import type { BaseModel } from 'pocketbase';
import { useAuthContext } from './use-auth-context';
import { useRecord } from './use-record';
import { useAuthActions } from './use-auth-actions';

// Gets auth data, user expanded info and auth actions
export function useAuth<UserModel extends BaseModel>(realtime?: boolean) {
  const auth = useAuthContext();
  const actions = useAuthActions();

  const {
    data: user,
    actions: _actions,
    ...recordState
  } = useRecord<UserModel>('users', auth!.id, realtime);

  if (!auth || !_actions) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...auth,
    actions,
    ...recordState,
    isSignLoading: auth.isSigned === null,
    user,
  };
}
