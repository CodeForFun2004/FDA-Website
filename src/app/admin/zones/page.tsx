"use client";

import { ZonesView, type Zone } from "@/features/zones";

export default function ZonesPage() {
  const handleAddZone = () => {
    // TODO: Implement add zone modal
    console.log("Add zone clicked");
  };

  const handleViewZone = (zone: Zone) => {
    // TODO: Navigate to zone detail or map
    console.log("View zone:", zone.id);
  };

  return (
    <ZonesView 
      onAddZone={handleAddZone}
      onViewZone={handleViewZone}
    />
  );
}