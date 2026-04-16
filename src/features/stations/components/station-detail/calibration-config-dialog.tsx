'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormInput } from '@/components/forms/form-input';
import { Form } from '@/components/ui/form';
import { stationsApi } from '@/features/stations/api/station.api';
import { Loader2, Settings2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/features/stations/utils/auth';

const formSchema = z.object({
  calibrationOffset: z.coerce
    .number()
    .min(0, { message: 'Calibration offset must be at least 0 cm.' })
    .max(50, { message: 'Calibration offset must not exceed 50 cm.' })
});

type FormValues = z.infer<typeof formSchema>;

export interface CalibrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: string;
  onSuccess?: () => void;
}

export function CalibrationConfigDialog({
  open,
  onOpenChange,
  stationId,
  onSuccess
}: CalibrationConfigDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      calibrationOffset: 5
    }
  });

  const formControl = form.control as unknown as Control<FormValues>;

  // Fetch current value when dialog opens
  useEffect(() => {
    async function fetchCurrentCalibration() {
      if (!open || !stationId) return;

      setIsFetching(true);
      try {
        const token = await getAccessToken();
        const res = await stationsApi.getCalibration(
          stationId,
          token ?? undefined
        );
        if (res.success) {
          form.reset({
            calibrationOffset: res.calibrationOffset ?? 5
          });
        }
      } catch (error) {
        console.warn(
          'Could not fetch calibration offset, using default 5cm.',
          error
        );
        form.reset({ calibrationOffset: 5 });
      } finally {
        setIsFetching(false);
      }
    }

    fetchCurrentCalibration();
  }, [open, stationId, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');

      const res = await stationsApi.updateCalibration(
        stationId,
        values.calibrationOffset,
        token
      );

      if (res.success) {
        toast.success('Cập nhật hiệu chuẩn thành công!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Cập nhật hiệu chuẩn thất bại', {
          description: res.message
        });
      }
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật hiệu chuẩn', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings2 className='text-primary h-5 w-5' />
            Cập nhật offset hiệu chuẩn
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh sai số hiển thị cho trạm này.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className='flex h-24 items-center justify-center'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          </div>
        ) : (
          <Form
            form={form as any}
            onSubmit={form.handleSubmit(onSubmit as any)}
            className='space-y-4'
          >
            <FormInput
              control={formControl}
              type='number'
              name='calibrationOffset'
              label='Offset mới (cm)'
              placeholder='5'
              description='Cho phép: 0–50 cm (mặc định: 5cm)'
              disabled={isLoading}
            />

            <div className='bg-primary/5 border-primary/20 mt-4 rounded-md border p-3 text-sm'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='text-primary mt-0.5 h-4 w-4 shrink-0' />
                <p className='text-muted-foreground'>
                  <strong>Lưu ý:</strong> Giá trị này chỉ để hiển thị, không ảnh
                  hưởng kết quả đo hoặc các tính toán của hệ thống.
                </p>
              </div>
            </div>

            <DialogFooter className='pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu'
                )}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
