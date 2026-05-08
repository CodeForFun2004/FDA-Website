'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTemplate } from '../../types/alert-template.type';
import { usePreviewAlertTemplate } from '../../hooks/useAlertTemplates';
import { toast } from 'sonner';
import {
  IconPlayerPlay,
  IconRefresh,
  IconEye,
  IconEditCircle,
  IconAlertCircle
} from '@tabler/icons-react';
import { cn } from '@/libs/utils';
import { stripHtmlToText } from '@/libs/strip-html';

import { PushPreview } from './previews/push-preview';
import { EmailPreview } from './previews/email-preview';
import { SmsPreview } from './previews/sms-preview';
import { InAppPreview } from './previews/inapp-preview';

interface AlertTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AlertTemplate | null;
}

const DEFAULT_TEST_DATA = {
  areaName: 'Trạm thủy văn Đà Nẵng',
  stationName: 'Trạm thủy văn Đà Nẵng',
  waterLevel: '4.12',
  threshold: '3.50',
  address: 'Phường An Khê, TP. Đà Nẵng'
};

const CHANNEL_TABS = [
  { value: 'Push' as const, label: 'Push' },
  { value: 'Email' as const, label: 'Email' },
  { value: 'SMS' as const, label: 'SMS' },
  { value: 'InApp' as const, label: 'In-App' }
] as const;

export function AlertTemplatePreviewDialog({
  open,
  onOpenChange,
  template
}: AlertTemplatePreviewDialogProps) {
  const previewMutation = usePreviewAlertTemplate();
  const [previewResult, setPreviewResult] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const [testData, setTestData] = useState<Record<string, string>>({
    ...DEFAULT_TEST_DATA
  });

  const activeChannel = template?.channel ?? 'Push';

  const handleTestChange = (field: string, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setTestData({ ...DEFAULT_TEST_DATA });
    setPreviewResult(null);
  };

  const handlePreview = async () => {
    if (!template) return;
    try {
      const result = await previewMutation.mutateAsync({
        templateId: template.id,
        titleTemplate: template.titleTemplate,
        bodyTemplate: template.bodyTemplate,
        ...testData,
        severity: template.severity || 'warning',
        waterLevel: Number(testData.waterLevel) || 0,
        threshold: Number(testData.threshold) || 0
      });
      setPreviewResult(result);
      toast.success('Đã tạo bản xem trước');
    } catch (error: any) {
      toast.error('Xem trước thất bại', { description: error.message });
    }
  };

  // Detect unreplaced variables in the rendered result
  const unreplacedVars = useMemo(() => {
    if (!previewResult) return [];
    const combined = `${previewResult.title} ${previewResult.body}`;
    const matches = combined.match(/\{\{([^}]+)\}\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  }, [previewResult]);

  const previewText = useMemo(() => {
    if (!previewResult) return null;
    return {
      title: stripHtmlToText(previewResult.title),
      body: stripHtmlToText(previewResult.body)
    };
  }, [previewResult]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setPreviewResult(null);
          setTestData({ ...DEFAULT_TEST_DATA });
        }
      }}
    >
      <DialogContent className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl'>
        {/* Header */}
        <DialogHeader className='bg-muted/30 flex-shrink-0 border-b px-5 py-4 sm:px-6'>
          <DialogTitle className='text-lg'>
            Xem trước: {template?.name}
          </DialogTitle>
          <DialogDescription>
            Thử hiển thị mẫu với dữ liệu giả trước khi áp dụng
          </DialogDescription>
        </DialogHeader>

        {/* Two-Column Body */}
        <div className='flex flex-1 flex-col overflow-y-auto lg:flex-row'>
          {/* ─── Left Column: Input Data ─── */}
          <div className='flex-1 border-b p-5 sm:p-6 lg:border-r lg:border-b-0'>
            <div className='mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400'>
              <IconEditCircle className='size-5' />
              <h2 className='text-base font-bold'>Dữ liệu mẫu</h2>
            </div>

            <div className='space-y-4'>
              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                  Tên Trạm
                </Label>
                <Input
                  value={testData.areaName || ''}
                  onChange={(e) => {
                    handleTestChange('areaName', e.target.value);
                    handleTestChange('stationName', e.target.value);
                  }}
                  className='h-9 text-sm'
                  placeholder='Nhập tên trạm…'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                  Mực Nước
                </Label>
                <Input
                  value={testData.waterLevel || ''}
                  onChange={(e) =>
                    handleTestChange('waterLevel', e.target.value)
                  }
                  className='h-9 text-sm'
                  placeholder='Nhập mực nước…'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                  Ngưỡng
                </Label>
                <Input
                  value={testData.threshold || ''}
                  disabled
                  className='bg-muted text-muted-foreground h-9 text-sm'
                  placeholder='Nhập ngưỡng cảnh báo…'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                  Mức độ
                </Label>
                <Input
                  value={template?.severity || 'warning'}
                  disabled
                  className='bg-muted text-muted-foreground h-9 text-sm'
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex flex-col gap-3'>
              <Button
                onClick={handlePreview}
                disabled={previewMutation.isPending}
                className='w-full gap-2 shadow-lg'
              >
                <IconPlayerPlay className='size-4' />
                Tạo xem trước
              </Button>
              <Button
                variant='outline'
                onClick={handleReset}
                className='w-full gap-2'
              >
                <IconRefresh className='size-4' />
                Đặt lại dữ liệu
              </Button>
            </div>
          </div>

          {/* ─── Right Column: Render Result ─── */}
          <div className='bg-muted/20 flex-1 p-5 sm:p-6'>
            <div className='mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400'>
              <IconEye className='size-5' />
              <h2 className='text-base font-bold'>Kết quả hiển thị</h2>
            </div>

            {/* Channel Tabs */}
            <Tabs defaultValue={activeChannel} className='w-full'>
              <TabsList className='bg-muted/50 mb-6 grid h-auto w-full grid-cols-4 gap-1 rounded-lg p-1'>
                {CHANNEL_TABS.map(({ value: ch, label }) => {
                  const enabled = ch === activeChannel;
                  return (
                    <TabsTrigger
                      key={ch}
                      value={ch}
                      disabled={!enabled}
                      className={cn(
                        'h-9 w-full rounded-md px-2 text-xs font-semibold transition-colors sm:h-10 sm:px-3 sm:text-sm',
                        'data-[state=active]:bg-primary',
                        'data-[state=active]:text-primary-foreground',
                        'data-[state=active]:shadow-none',
                        !enabled ? 'cursor-not-allowed opacity-50' : '',
                        label.length > 8 ? 'tracking-[-0.01em]' : ''
                      )}
                    >
                      <span className='block w-full truncate text-center'>
                        {label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value='Push'>
                <PushPreview
                  title={previewText?.title ?? null}
                  body={previewText?.body ?? null}
                />
              </TabsContent>

              <TabsContent value='Email'>
                <EmailPreview
                  title={previewText?.title ?? null}
                  body={previewText?.body ?? null}
                  severity={template?.severity ?? null}
                />
              </TabsContent>

              <TabsContent value='SMS'>
                <SmsPreview
                  title={previewText?.title ?? null}
                  body={previewText?.body ?? null}
                />
              </TabsContent>

              <TabsContent value='InApp'>
                <InAppPreview
                  title={previewText?.title ?? null}
                  body={previewText?.body ?? null}
                />
              </TabsContent>
            </Tabs>

            {/* Unreplaced Variables Warning */}
            {unreplacedVars.length > 0 && (
              <div className='mt-6'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                    Biến chưa thay
                  </h3>
                  <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
                    {unreplacedVars.length} lỗi
                  </span>
                </div>
                <div className='bg-background rounded-lg border p-4'>
                  <ul className='space-y-2'>
                    {unreplacedVars.map((v) => (
                      <li
                        key={v}
                        className='flex items-center gap-2 font-mono text-xs text-slate-500'
                      >
                        <IconAlertCircle className='size-4 text-red-500' />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className='flex-shrink-0 border-t px-5 py-3 sm:px-6'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
