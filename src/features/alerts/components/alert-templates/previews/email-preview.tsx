'use client';

import {
  IconMail,
  IconArchive,
  IconFlag,
  IconTrash,
  IconAlertTriangle,
  IconWaveSine
} from '@tabler/icons-react';

interface EmailPreviewProps {
  title: string | null;
  body: string | null;
}

export function EmailPreview({ title, body }: EmailPreviewProps) {
  return (
    <div className='flex flex-col py-4'>
      {/* Desktop Email Client Mockup */}
      <div className='flex max-h-[380px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800'>
        {/* Toolbar — traffic light dots + action icons */}
        <div className='flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/80'>
          <div className='flex gap-1.5'>
            <div className='size-3 rounded-full bg-red-400' />
            <div className='size-3 rounded-full bg-amber-400' />
            <div className='size-3 rounded-full bg-emerald-400' />
          </div>
          <div className='mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700' />
          <div className='flex gap-4'>
            <IconArchive className='size-3.5 text-slate-400' />
            <IconFlag className='size-3.5 text-slate-400' />
            <IconTrash className='size-3.5 text-slate-400' />
          </div>
        </div>

        {title || body ? (
          <>
            {/* Email Headers */}
            <div className='flex flex-col gap-2 border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-800'>
              <div className='flex items-start justify-between'>
                <h3 className='text-sm leading-tight font-bold text-slate-900 dark:text-white'>
                  {title}
                </h3>
                <span className='shrink-0 text-[10px] text-slate-400'>
                  08:31, 27/10/2023
                </span>
              </div>
              <div className='mt-1 flex items-center gap-2'>
                <div className='flex size-7 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600'>
                  FS
                </div>
                <div className='flex flex-col'>
                  <div className='flex items-center gap-1'>
                    <span className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                      FDA System
                    </span>
                    <span className='text-[10px] text-slate-400'>
                      &lt;noreply@fda.gov.vn&gt;
                    </span>
                  </div>
                  <div className='text-[10px] text-slate-500'>
                    to recipient@mail.com
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className='flex-1 overflow-y-auto bg-slate-100 p-5 dark:bg-slate-900'>
              <div className='mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
                {/* FDA Logo */}
                <div className='mb-5 flex justify-center'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-blue-500 text-white'>
                    <IconWaveSine className='size-6' />
                  </div>
                </div>

                {/* Email Main Title */}
                <h2 className='mb-4 text-center text-base font-bold text-slate-900 dark:text-white'>
                  FLOOD ALERT NOTIFICATION
                </h2>

                {/* Email Content */}
                <div className='space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                  <p className='whitespace-pre-wrap'>{body}</p>

                  {/* Alert details box */}
                  <div className='my-3 rounded border-l-4 border-amber-500 bg-amber-50 p-3 dark:bg-amber-900/20'>
                    <ul className='space-y-1 text-[11px]'>
                      <li>
                        • Severity: <span className='font-bold'>Warning</span>
                      </li>
                    </ul>
                  </div>

                  <p className='text-center'>
                    <span className='inline-block rounded-lg bg-blue-500 px-5 py-1.5 text-[11px] font-bold text-white'>
                      View Forecast Details
                    </span>
                  </p>
                </div>

                {/* Footer */}
                <div className='mt-6 border-t border-slate-100 pt-4 text-center text-[9px] text-slate-400 dark:border-slate-700'>
                  This is an automated message from the FDA System. Please do
                  not reply to this email.
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className='flex flex-1 flex-col items-center justify-center text-center'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/50'>
              <IconMail className='size-6 text-slate-400' />
            </div>
            <p className='text-xs text-slate-400'>
              Click &quot;Generate Preview&quot; to see the email preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
