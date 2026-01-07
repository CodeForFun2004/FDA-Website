// src/features/users/index.ts
export {
  useUsers,
  type UseUsersParams,
  type UseUsersResult
} from './hooks/useUsers';
export { generateUsers } from './mocks/users-mock';
export { UsersView, type UsersViewProps } from './views/UsersView';
export { CreateUserDialog, type CreateUserDialogProps } from './components';
export type { User, Role } from './types';
