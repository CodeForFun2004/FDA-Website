"use client";

import { LogsView } from "@/features/logs";

export default function LogsPage() {
  const handleExportLogs = () => {
    // TODO: Implement export logs as CSV/JSON
    console.log("Export logs clicked");
  };

  return (
    <LogsView onExportLogs={handleExportLogs} />
  );
}
