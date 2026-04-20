export function stripHtmlToText(input: string): string {
  const raw = String(input ?? '');
  if (!raw) return '';

  // Remove script/style blocks first
  let s = raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Normalize common block/line break tags into newlines
  s = s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<(li)\b[^>]*>/gi, '• ')
    .replace(/<\/(ul|ol|table)\s*>/gi, '\n');

  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, '');

  // Decode a small set of entities we commonly see
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    );

  // Collapse whitespace + excessive newlines
  s = s
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return s;
}
