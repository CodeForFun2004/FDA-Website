// src/features/stations/components/station-detail/component-edit-dialog.tsx
'use client';

import React, { useEffect } from 'react';
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
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Form } from '@/components/ui/form';
import { stationsApi } from '@/features/stations/api/station.api';
import type {
  Component,
  ComponentUpsertPayload
} from '@/features/stations/types/station.type';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/features/stations/utils/auth';

const COMPONENT_TYPE_OPTIONS = [
  { label: 'ESP32 (MCU)', value: 'esp32' },
  { label: 'Cảm biến siêu âm (SRT04)', value: 'srt04' },
  { label: 'Cảm biến nhiệt độ', value: 'temperature_sensor' },
  { label: 'Pin', value: 'battery' },
  { label: 'Loa', value: 'speaker' },
  { label: 'GSM Module', value: 'gsm_module' },
  { label: 'Tấm pin năng lượng mặt trời', value: 'solar_panel' },
  { label: 'Cảm biến mưa', value: 'rain_sensor' }
];

const COMPONENT_STATUS_OPTIONS = [
  { label: 'Hoạt động', value: 'active' },
  { label: 'Không hoạt động', value: 'inactive' },
  { label: 'Lỗi', value: 'faulty' }
];

const formSchema = z.object({
  componentType: z.string().min(1, { message: 'Loại thiết bị là bắt buộc.' }),
  name: z.string().min(1, { message: 'Tên là bắt buộc.' }),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  firmwareVersion: z.string().optional().nullable(),
  status: z.string().min(1, { message: 'Trạng thái là bắt buộc.' }),
  notes: z.string().optional().nullable()
});

type FormValues = z.infer<typeof formSchema>;

export interface ComponentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: string;
  component: Component | null;
  onSuccess?: () => void;
}

export function ComponentEditDialog({
  open,
  onOpenChange,
  stationId,
  component,
  onSuccess
}: ComponentEditDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      componentType: '',
      name: '',
      model: '',
      serialNumber: '',
      firmwareVersion: '',
      status: 'active',
      notes: ''
    }
  });

  const formControl = form.control as unknown as Control<FormValues>;

  useEffect(() => {
    if (component) {
      form.reset({
        componentType: component.componentType ?? '',
        name: component.name ?? '',
        model: component.model ?? '',
        serialNumber: component.serialNumber ?? '',
        firmwareVersion: component.firmwareVersion ?? '',
        status: component.status ?? 'active',
        notes: component.notes ?? ''
      });
    }
  }, [component, form]);

  const onSubmit = async (values: FormValues) => {
    if (!component?.id) {
      toast.error('Thiếu mã thiết bị');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');

      const payload: ComponentUpsertPayload = {
        componentType: values.componentType,
        name: values.name || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        firmwareVersion: values.firmwareVersion || null,
        status: values.status || null,
        notes: values.notes || null
      };

      const res = await stationsApi.updateComponent(
        stationId,
        component.id,
        payload,
        token
      );

      if (res.success) {
        toast.success('Cập nhật thiết bị thành công!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Cập nhật thiết bị thất bại', { description: res.message });
      }
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật thiết bị', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='text-primary h-5 w-5' />
            Sửa thiết bị
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thiết bị. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-4'
        >
          <FormSelect
            control={formControl}
            name='componentType'
            label='Loại thiết bị'
            placeholder='Chọn loại'
            required
            disabled={isLoading}
            options={COMPONENT_TYPE_OPTIONS}
          />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='name'
              label='Tên'
              placeholder='ESP32 Main Controller'
              required
              disabled={isLoading}
            />
            <FormSelect
              control={formControl}
              name='status'
              label='Trạng thái'
              placeholder='Chọn trạng thái'
              required
              disabled={isLoading}
              options={COMPONENT_STATUS_OPTIONS}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='model'
              label='Mẫu'
              placeholder='ESP32-WROOM-32'
              disabled={isLoading}
            />
            <FormInput
              control={formControl}
              name='serialNumber'
              label='Số serial'
              placeholder='ESP32-001234'
              disabled={isLoading}
            />
          </div>

          <FormInput
            control={formControl}
            name='firmwareVersion'
            label='Phiên bản firmware'
            placeholder='1.0.0'
            disabled={isLoading}
          />

          <FormTextarea
            control={formControl}
            name='notes'
            label='Ghi chú'
            placeholder='Ghi chú thêm...'
            disabled={isLoading}
            config={{ maxLength: 500, showCharCount: true, rows: 3 }}
          />

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4' />
                  Cập nhật thiết bị
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
