'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTemplate } from '../../types/alert-template.type';
import { usePreviewAlertTemplate } from '../../hooks/useAlertTemplates';
import { toast } from 'sonner';

interface AlertTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AlertTemplate | null;
}

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

  const [testData, setTestData] = useState({
    station_name: 'Trạm đo Quận 1',
    water_level: '3.5m',
    water_level_raw: '3.5',
    severity: 'critical',
    time: '2024-01-15 14:30:00',
    threshold: '3.0',
    address: '123 Đường Nguyễn Huệ, Quận 1',
    message: 'Mức nước vượt ngưỡng báo động'
  });

  const handleTestChange = (field: string, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreview = async () => {
    if (!template) return;
    try {
      const result = await previewMutation.mutateAsync({
        id: template.id,
        previewData: testData
      });
      setPreviewResult(result);
      toast.success('Preview generated');
    } catch (error: any) {
      toast.error('Preview failed', { description: error.message });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setPreviewResult(null);
      }}
    >
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Preview Template: {template?.name}</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-4 border-r pr-6'>
            <h4 className='text-sm font-medium'>Test Variables</h4>
            <div className='h-[300px] space-y-3 overflow-y-auto pr-2'>
              {Object.entries(testData).map(([key, value]) => (
                <div key={key} className='space-y-1'>
                  <Label className='text-xs'>{`{{${key}}}`}</Label>
                  <Input
                    value={value}
                    onChange={(e) => handleTestChange(key, e.target.value)}
                    className='h-8 text-sm'
                  />
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>Rendered Result</h4>

            <div className='bg-muted/30 min-h-[200px] rounded-md border p-4'>
              {previewResult ? (
                <div className='space-y-4'>
                  <div>
                    <Label className='text-muted-foreground text-xs'>
                      Title
                    </Label>
                    <div className='font-semibold'>{previewResult.title}</div>
                  </div>
                  <div>
                    <Label className='text-muted-foreground text-xs'>
                      Body
                    </Label>
                    <div className='text-sm whitespace-pre-wrap'>
                      {previewResult.body}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                  Click 'Generate Preview' to see the result
                </div>
              )}
            </div>

            <Button
              className='mt-auto w-full'
              onClick={handlePreview}
              disabled={previewMutation.isPending}
            >
              Generate Preview
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
