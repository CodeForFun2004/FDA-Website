"use client";

import { DevicesView, type Device } from "@/features/devices";

export default function DevicesPage() {
  const handleAddDevice = () => {
    // TODO: Implement add device modal
    console.log("Add device clicked");
  };

  const handleConfigDevice = (device: Device) => {
    // TODO: Implement device config modal
    console.log("Config device:", device.id);
  };

  const handleLocateDevice = (device: Device) => {
    // TODO: Navigate to map with device location
    console.log("Locate device:", device.id, device.coordinates);
  };

  return (
    <DevicesView 
      onAddDevice={handleAddDevice}
      onConfigDevice={handleConfigDevice}
      onLocateDevice={handleLocateDevice}
    />
  );
}