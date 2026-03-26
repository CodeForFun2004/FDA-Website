'use client';

import { useMemo } from 'react';
import {
  IconChevronLeft,
  IconUser,
  IconSend,
  IconMessage
} from '@tabler/icons-react';

interface SmsPreviewProps {
  title: string | null;
  body: string | null;
}

export function SmsPreview({ title, body }: SmsPreviewProps) {
  // Build a combined SMS text from title + body (SMS is typically a single text)
  const smsText = useMemo(() => {
    if (!title && !body) return null;
    const parts: string[] = [];
    if (title) parts.push(title);
    if (body) parts.push(body);
    return parts.join('\n');
  }, [title, body]);

  const charCount = smsText?.length ?? 0;

  return (
    <div className='flex flex-col items-center py-4'>
      {/* Phone Frame */}
      <div className='relative h-[480px] w-72 overflow-hidden rounded-[3rem] border-[8px] border-slate-800 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Notch */}
        <div className='absolute top-0 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-800' />

        {/* Chat Header */}
        <div className='flex h-20 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 pt-10 dark:border-slate-700 dark:bg-slate-800'>
          <IconChevronLeft className='size-4 text-slate-400' />
          <div className='flex size-8 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-600'>
            <IconUser className='size-4 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='text-[10px] font-bold text-slate-900 dark:text-white'>
              FDA_SYSTEM
            </span>
            <span className='text-[8px] text-slate-400'>
              Thông tin khẩn cấp
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className='flex flex-col p-4'>
          {smsText ? (
            <>
              {/* Timestamp Pill */}
              <div className='mb-4 self-center rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800'>
                <span className='text-[8px] font-medium text-slate-500'>
                  Hôm nay 08:31
                </span>
              </div>

              {/* SMS Bubble */}
              <div className='max-w-[85%] rounded-2xl bg-slate-100 p-3 text-[11px] leading-snug text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-200'>
                {smsText}
              </div>

              {/* Delivery Time */}
              <div className='mt-2 ml-1'>
                <span className='text-[8px] text-slate-400'>8:31 AM</span>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className='flex h-[280px] flex-col items-center justify-center text-center'>
              <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/50'>
                <IconMessage className='size-6 text-slate-400' />
              </div>
              <p className='text-[10px] text-slate-400'>
                Click &quot;Generate Preview&quot; to see the SMS
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className='absolute right-0 bottom-0 left-0 flex h-12 items-center gap-2 bg-slate-50 px-4 dark:bg-slate-800'>
          <div className='flex h-8 flex-1 items-center rounded-full border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900'>
            <span className='text-[10px] text-slate-400'>Tin nhắn văn bản</span>
          </div>
          <IconSend className='size-5 text-blue-500' />
        </div>

        {/* Home Indicator */}
        <div className='absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-400' />
      </div>

      {/* Character Count (below the phone) */}
      {smsText && (
        <div className='mt-4 font-mono text-[10px] text-slate-400'>
          Độ dài: {charCount}/160 ký tự
        </div>
      )}
    </div>
  );
}
