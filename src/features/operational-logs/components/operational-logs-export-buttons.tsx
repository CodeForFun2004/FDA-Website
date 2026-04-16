'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/common';
import type { OperationalLogsQueryParams } from '../types';
import { exportOperationalLogs } from '../api';
import { buildExportFilename, downloadStringAsFile } from '../utils';

export type OperationalLogsExportButtonsProps = {
  params: OperationalLogsQueryParams;
};

export function OperationalLogsExportButtons({
  params
}: OperationalLogsExportButtonsProps) {
  const [loading, setLoading] = React.useState<'csv' | 'json' | null>(null);

  const run = async (format: 'csv' | 'json') => {
    try {
      setLoading(format);
      const res = await exportOperationalLogs({ format, params });
      const filename = buildExportFilename(format);
      downloadStringAsFile({
        content: res.data,
        filename,
        mimeType: format === 'json' ? 'application/json' : 'text/csv'
      });
      toast.success('Đã tạo file xuất');
    } catch (e: any) {
      toast.error(e?.message ?? 'Xuất dữ liệu thất bại');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        disabled={loading !== null}
        onClick={() => run('csv')}
      >
        {loading === 'csv' ? 'Đang xuất CSV…' : 'Xuất CSV'}
      </Button>
      <Button
        variant='outline'
        size='sm'
        disabled={loading !== null}
        onClick={() => run('json')}
      >
        {loading === 'json' ? 'Đang xuất JSON…' : 'Xuất JSON'}
      </Button>
    </div>
  );
}
