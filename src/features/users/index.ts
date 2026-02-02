// src/features/users/index.ts
export {
  useUsers,
  type UseUsersParams,
  type UseUsersResult
} from './hooks/useUsers';

export { default as UsersView } from './views/users-view';
export { CreateUserDialog, type CreateUserDialogProps } from './components';
export type { User, Role } from './types';
