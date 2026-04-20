import { vi } from './vi';

type AnyRecord = Record<string, any>;

function get(obj: AnyRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as AnyRecord)) {
      return (acc as AnyRecord)[key];
    }
    return undefined;
  }, obj);
}

export function t(key: string, params?: Record<string, string | number>) {
  const raw = get(vi as AnyRecord, key);
  const template = typeof raw === 'string' ? raw : key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] === undefined ? `{${k}}` : String(params[k])
  );
}
