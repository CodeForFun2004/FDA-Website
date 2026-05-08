'use client';

import { AlertTriangle, Droplets, Activity } from 'lucide-react';

export default function LegendFlood({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const items = [
    {
      label: 'Safe (< 10 cm)',
      key: 'safe',
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]',
      icon: <Droplets className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Caution (10–20 cm)',
      key: 'caution',
      color: 'text-[#CA8A04]',
      bg: 'bg-[#CA8A04]',
      icon: <Activity className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Warning (20–40 cm)',
      key: 'warning',
      color: 'text-[#EA580C]',
      bg: 'bg-[#EA580C]',
      icon: <AlertTriangle className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Critical (≥ 40 cm)',
      key: 'critical',
      color: 'text-[#DC2626]',
      bg: 'bg-[#DC2626]',
      icon: null,
      ping: true
    }
  ];

  return (
    <div className='animate-in slide-in-from-bottom-2 fade-in rounded-2xl border-none bg-white/95 p-4 shadow-xl backdrop-blur-md duration-300'>
      <div className='mb-3 text-sm font-bold text-slate-800'>
        Flood Severity
      </div>
      <div className='space-y-2.5'>
        {items.map((it) => (
          <div key={it.key} className='flex items-center gap-2.5 text-xs'>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full ${it.color} bg-slate-50`}
            >
              {it.ping ? (
                <span className='relative flex h-2.5 w-2.5'>
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full ${it.bg} opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${it.bg}`}
                  ></span>
                </span>
              ) : (
                it.icon
              )}
            </div>
            <span className='font-medium text-slate-600'>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
