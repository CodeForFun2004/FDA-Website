"use client";

import { AlertsView, type Alert } from "@/features/alerts";

export default function AlertsPage() {
  const handleCreateAlert = () => {
    // TODO: Implement create alert modal
    console.log("Create alert clicked");
  };

  const handleAcknowledgeAlert = (alert: Alert) => {
    // TODO: Implement acknowledge alert API call
    console.log("Acknowledge alert:", alert.id);
  };

  const handleResolveAlert = (alert: Alert) => {
    // TODO: Implement resolve alert API call
    console.log("Resolve alert:", alert.id);
  };

  const handleViewAlert = (alert: Alert) => {
    // TODO: Navigate to alert detail or open modal
    console.log("View alert:", alert.id);
  };

  return (
    <AlertsView 
      onCreateAlert={handleCreateAlert}
      onAcknowledgeAlert={handleAcknowledgeAlert}
      onResolveAlert={handleResolveAlert}
      onViewAlert={handleViewAlert}
    />
  );
}