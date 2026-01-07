// src/features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { generateUsers } from "../mocks/users-mock";

export const useUsers = () => useQuery({
    queryKey: ['users'],
    queryFn: async () => generateUsers()
});
