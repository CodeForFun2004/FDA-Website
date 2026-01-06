"use client";

import { RoutesView, type Route } from "@/features/routes";

export default function RoutesPage() {
  const handleAddRoute = () => {
    // TODO: Implement add route modal
    console.log("Add route clicked");
  };

  const handleViewRoute = (route: Route) => {
    // TODO: Navigate to map with route highlighted
    console.log("View route:", route.id);
  };

  const handleEditRoute = (route: Route) => {
    // TODO: Implement edit route modal
    console.log("Edit route:", route.id);
  };

  return (
    <RoutesView 
      onAddRoute={handleAddRoute}
      onViewRoute={handleViewRoute}
      onEditRoute={handleEditRoute}
    />
  );
}