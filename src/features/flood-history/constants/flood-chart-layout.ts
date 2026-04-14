/** Plot area — cùng chiều cao mọi chart (line/area/bar) */
export const FLOOD_CHART_PLOT_CLASS = 'h-[400px] w-full shrink-0';

/** 4 ô KPI — luôn render (kể cả placeholder) để không nhảy khi đổi preset giờ */
export const FLOOD_KPI_STRIP_CLASS =
  'grid min-h-[92px] shrink-0 grid-cols-2 gap-2 md:grid-cols-4';

/**
 * Khung phân tích: cố định 560px, cuộn nội dung bên trong (heatmap / cảnh báo).
 */
export const FLOOD_ANALYSIS_PANEL_CLASS =
  'flex h-[560px] max-h-[560px] w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border/40 bg-muted/20';

export const FLOOD_ANALYSIS_PANEL_SCROLL_CLASS =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto';
