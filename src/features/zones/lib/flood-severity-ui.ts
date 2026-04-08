/**
 * Tier UI (4 bậc) — ưu tiên map theo xác suất ensemble [0,1]:
 * - p > 0.70  → Cao     → đỏ   #DC2626
 * - (0.50, 0.70] → Cam  → cam  #EA580C
 * - (0.15, 0.50] → Vàng → vàng #CA8A04
 * - p ≤ 0.15  → Thấp    → xanh #16A34A
 */
export type FloodSeverityTier = 'safe' | 'caution' | 'warning' | 'critical';

/** Màu chính theo bậc (đồng bộ UI AI + badge). */
export const FLOOD_TIER_HEX: Record<FloodSeverityTier, string> = {
  safe: '#16A34A',
  caution: '#CA8A04',
  warning: '#EA580C',
  critical: '#DC2626'
};

/**
 * Map xác suất mô hình (0–1) → tier. Luôn trả về 1 trong 4 bậc.
 */
export function resolveTierFromEnsembleProbability(
  p: number
): FloodSeverityTier {
  if (!Number.isFinite(p)) return 'caution';
  if (p > 0.7) return 'critical';
  if (p > 0.5) return 'warning';
  if (p > 0.15) return 'caution';
  return 'safe';
}

/** Nhãn tiếng Việt theo bậc xác suất (hiển thị cạnh %). */
export function probabilityBandLabelVi(p: number): string {
  if (p > 0.7) return 'Cao';
  if (p > 0.5) return 'Trung bình';
  if (p > 0.15) return 'Vừa';
  return 'Thấp';
}

export function resolveFloodSeverityTier(
  riskLevel: string | undefined,
  severityLevel?: number | null
): FloodSeverityTier {
  const r = (riskLevel ?? '').toUpperCase().trim();

  if (typeof severityLevel === 'number' && Number.isFinite(severityLevel)) {
    const s = Math.round(severityLevel);
    if (s >= 4) return 'critical';
    if (s === 3) return 'warning';
    if (s === 2) return 'caution';
    if (s === 1 || s === 0) return 'safe';
  }

  if (
    r.includes('CRITICAL') ||
    r === 'CRITICAL' ||
    r === 'EXTREME' ||
    r === 'SEVERE'
  ) {
    return 'critical';
  }
  if (r.includes('WARN') || r === 'HIGH') return 'warning';
  if (r === 'MEDIUM' || r === 'MODERATE' || r.includes('CAUTION')) {
    return 'caution';
  }
  if (
    r === 'LOW' ||
    r.includes('SAFE') ||
    r === 'MINIMAL' ||
    r === 'NONE' ||
    r === 'NORMAL'
  ) {
    return 'safe';
  }

  return 'caution';
}

/**
 * Tier hiển thị panel AI: ưu tiên xác suất ensemble; không có thì risk/severity.
 */
export function resolveModelUiTier(args: {
  ensembleProbability?: number | null;
  riskLevel?: string | null;
  severityLevel?: number | null;
}): FloodSeverityTier {
  const p = args.ensembleProbability;
  if (typeof p === 'number' && Number.isFinite(p)) {
    return resolveTierFromEnsembleProbability(p);
  }
  return resolveFloodSeverityTier(
    args.riskLevel ?? undefined,
    args.severityLevel
  );
}

/** Tailwind + màu hex cố định (hero gradient theo tier). */
export const FLOOD_TIER_UI: Record<
  FloodSeverityTier,
  {
    hero: string;
    heroSub: string;
    heroMuted: string;
    badge: string;
    pill: string;
    windowChip: string;
    recBox: string;
  }
> = {
  safe: {
    hero: 'border-[#16A34A]/60 bg-gradient-to-br from-[#16A34A] via-[#15803d] to-[#14532d]',
    heroSub: 'text-white/95',
    heroMuted: 'text-white/80',
    badge: 'bg-[#dcfce7] text-[#14532d] border-[#16A34A]/40',
    pill: 'bg-[#dcfce7] text-[#14532d] border-[#16A34A]/35',
    windowChip: 'border-[#16A34A]/35 bg-[#f0fdf4] text-[#14532d]',
    recBox: 'border-[#16A34A]/40 bg-[#f0fdf4] text-[#14532d]'
  },
  caution: {
    hero: 'border-[#CA8A04]/60 bg-gradient-to-br from-[#CA8A04] via-[#a16207] to-[#713f12]',
    heroSub: 'text-white/95',
    heroMuted: 'text-white/80',
    badge: 'bg-[#fef9c3] text-[#713f12] border-[#CA8A04]/45',
    pill: 'bg-[#fef9c3] text-[#713f12] border-[#CA8A04]/40',
    windowChip: 'border-[#CA8A04]/40 bg-[#fffbeb] text-[#713f12]',
    recBox: 'border-[#CA8A04]/45 bg-[#fffbeb] text-[#713f12]'
  },
  warning: {
    hero: 'border-[#EA580C]/60 bg-gradient-to-br from-[#EA580C] via-[#c2410c] to-[#9a3412]',
    heroSub: 'text-white/95',
    heroMuted: 'text-white/80',
    badge: 'bg-[#ffedd5] text-[#7c2d12] border-[#EA580C]/45',
    pill: 'bg-[#ffedd5] text-[#7c2d12] border-[#EA580C]/40',
    windowChip: 'border-[#EA580C]/40 bg-[#fff7ed] text-[#7c2d12]',
    recBox: 'border-[#EA580C]/45 bg-[#fff7ed] text-[#7c2d12]'
  },
  critical: {
    hero: 'border-[#DC2626]/60 bg-gradient-to-br from-[#DC2626] via-[#b91c1c] to-[#7f1d1d]',
    heroSub: 'text-white/95',
    heroMuted: 'text-white/80',
    badge: 'bg-[#fee2e2] text-[#7f1d1d] border-[#DC2626]/45',
    pill: 'bg-[#fee2e2] text-[#7f1d1d] border-[#DC2626]/40',
    windowChip: 'border-[#DC2626]/40 bg-[#fef2f2] text-[#7f1d1d]',
    recBox: 'border-[#DC2626]/45 bg-[#fef2f2] text-[#7f1d1d]'
  }
};

export function tierFromSeverityString(
  sev?: string | null
): FloodSeverityTier | null {
  if (!sev) return null;
  const s = sev.toLowerCase();
  if (s === 'safe' || s === 'normal' || s === 'low') return 'safe';
  if (s === 'caution' || s === 'alarm' || s === 'moderate') return 'caution';
  if (s === 'warning' || s === 'high') return 'warning';
  if (s === 'critical') return 'critical';
  return null;
}
