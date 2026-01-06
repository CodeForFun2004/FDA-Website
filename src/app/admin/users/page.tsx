"use client";

import { UsersView, type User } from "@/features/users";

export default function UsersPage() {
  const handleCreateUser = () => {
    // TODO: Implement create user modal
    console.log("Create user clicked");
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user modal
    console.log("Edit user:", user.id);
  };

  const handleDeleteUser = (user: User) => {
    // TODO: Implement delete user confirmation
    console.log("Delete user:", user.id);
  };

  return (
    <UsersView 
      onCreateUser={handleCreateUser}
      onEditUser={handleEditUser}
      onDeleteUser={handleDeleteUser}
    />
  );
}