"use client";

import { DashboardView } from "@/features/dashboard";

export default function DashboardPage() {
  const handleCreateAlert = () => {
    // TODO: Implement create alert modal
    console.log("Create alert clicked");
  };

  const handleAddDevice = () => {
    // TODO: Implement add device modal
    console.log("Add device clicked");
  };

  return (
    <DashboardView 
      onCreateAlert={handleCreateAlert} 
      onAddDevice={handleAddDevice} 
    />
  );
}
