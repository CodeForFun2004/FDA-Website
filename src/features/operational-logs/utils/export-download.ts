export function downloadStringAsFile(args: {
  content: string;
  filename: string;
  mimeType: string;
}) {
  const blob = new Blob([args.content], { type: args.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = args.filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildExportFilename(format: 'csv' | 'json') {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `operational_logs_${y}${m}${d}.${format}`;
}
