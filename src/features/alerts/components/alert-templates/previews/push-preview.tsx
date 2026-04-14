'use client';

import { IconAlertTriangle, IconDroplet } from '@tabler/icons-react';

interface PushPreviewProps {
  title: string | null;
  body: string | null;
}

export function PushPreview({ title, body }: PushPreviewProps) {
  return (
    <div className='flex flex-col items-center py-2'>
      {/* Phone Frame */}
      <div className='relative h-[380px] w-60 overflow-hidden rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-200 shadow-2xl dark:border-slate-700 dark:bg-slate-800'>
        {/* Notch */}
        <div className='absolute top-0 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-b-xl bg-slate-800' />

        {/* Background Gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 opacity-30' />

        {/* Content Area */}
        <div className='relative mt-12 p-4'>
          {title || body ? (
            <>
              {/* Push Notification Card */}
              <div className='rounded-2xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:bg-slate-900/90'>
                {/* Header Row */}
                <div className='mb-2 flex items-center gap-2'>
                  <div className='flex size-5 items-center justify-center rounded bg-blue-500'>
                    <IconAlertTriangle className='size-3 text-white' />
                  </div>
                  <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                    Cảnh báo FDA
                  </span>
                  <span className='ml-auto text-[10px] text-slate-400'>
                    Vừa xong
                  </span>
                </div>

                {/* Title */}
                <h3 className='mb-1 text-xs font-bold text-slate-900 dark:text-white'>
                  {title}
                </h3>

                {/* Body */}
                <p className='text-[11px] leading-relaxed text-slate-600 dark:text-slate-300'>
                  {body}
                </p>
              </div>

              {/* Faded secondary row */}
              <div className='mt-3 flex items-center gap-3 rounded-2xl bg-white/40 p-3 shadow-sm backdrop-blur-sm dark:bg-slate-800/40'>
                <div className='flex size-8 items-center justify-center rounded-full bg-slate-400/20'>
                  <IconDroplet className='size-4 text-slate-400' />
                </div>
                <div className='h-2 w-24 rounded-full bg-slate-400/20' />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className='flex h-[220px] flex-col items-center justify-center text-center'>
              <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-slate-300/50 dark:bg-slate-700/50'>
                <IconAlertTriangle className='size-6 text-slate-400' />
              </div>
              <p className='text-xs text-slate-400'>
                Nhấn &quot;Tạo xem trước&quot; để xem thông báo đẩy
              </p>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className='absolute bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-400' />
      </div>
    </div>
  );
}
