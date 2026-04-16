import type { OperationalLogLevel } from '../types';

export function levelLabelVi(level: OperationalLogLevel) {
  switch (level) {
    case 'info':
      return 'Thông tin';
    case 'warning':
      return 'Cảnh báo';
    case 'error':
      return 'Lỗi';
    default:
      return String(level);
  }
}

export function levelBadgeClass(level: OperationalLogLevel) {
  switch (level) {
    case 'info':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
