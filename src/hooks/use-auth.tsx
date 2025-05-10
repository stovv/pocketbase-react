import type { BaseModel } from 'pocketbase';
import { useAuthActions } from './use-auth-actions';
import { useRecord } from './use-record';

export function useAuth<UserModel extends BaseModel>(realtime?: boolean) {
  const context = useAuthActions();
  const {
    data: user,
    actions,
    ...recordState
  } = useRecord<UserModel>('users', context!.id, realtime);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...context,
    ...recordState,
    isSignLoading: context.isSigned === null,
    user,
  };
}
