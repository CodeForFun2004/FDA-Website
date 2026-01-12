'use client';

import { AlertTriangle, Droplets, Activity } from 'lucide-react';

export default function LegendFlood({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const items = [
    {
      label: 'Safe (< 1.0m)',
      key: 'safe',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500',
      icon: <Droplets className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Caution (1.0–1.9m)',
      key: 'caution',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500',
      icon: <Activity className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Warning (2.0–2.9m)',
      key: 'warning',
      color: 'text-orange-600',
      bg: 'bg-orange-500',
      icon: <AlertTriangle className='h-3.5 w-3.5' />,
      ping: false
    },
    {
      label: 'Critical (≥ 3.0m)',
      key: 'critical',
      color: 'text-red-600',
      bg: 'bg-red-500',
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
