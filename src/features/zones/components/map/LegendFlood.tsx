'use client';

export default function LegendFlood({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const items = [
    { label: 'Safe (< 1.0m)', key: 'safe' },
    { label: 'Caution (1.0–1.9m)', key: 'caution' },
    { label: 'Warning (2.0–2.9m)', key: 'warning' },
    { label: 'Critical (≥ 3.0m)', key: 'critical' }
  ];

  return (
    <div className='bg-background/95 rounded-2xl border p-3 shadow-lg backdrop-blur'>
      <div className='mb-2 text-sm font-semibold'>Flood Severity</div>
      <div className='space-y-1'>
        {items.map((it) => (
          <div key={it.key} className='flex items-center gap-2 text-xs'>
            <span className='inline-block h-2.5 w-2.5 rounded-full border' />
            <span className='text-muted-foreground'>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
