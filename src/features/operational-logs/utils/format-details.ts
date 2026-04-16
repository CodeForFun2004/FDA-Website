export function toPrettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function normalizeDetailsText(details: unknown) {
  if (details === null || details === undefined) return '';
  if (typeof details === 'string') return details;
  if (typeof details === 'number' || typeof details === 'boolean')
    return String(details);
  return toPrettyJson(details);
}
