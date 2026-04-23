// src/features/stations/components/EditStationDialog.tsx
'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getAdministrativeAreasApi } from '@/features/admin/api/admin.api';
import type {
  Station,
  StationUpsertPayload
} from '@/features/stations/types/station.type';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/features/stations/utils/auth';

const toNumberOrUndefined = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const formSchema = z.object({
  code: z.string().min(2, { message: 'Mã phải có ít nhất 2 ký tự.' }),
  name: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự.' }),
  locationDesc: z.string().optional().nullable(),
  roadName: z.string().optional().nullable(),
  direction: z.string().optional().nullable(),
  latitude: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(-90).max(90))
    .optional(),
  longitude: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(-180).max(180))
    .optional(),
  status: z.enum(['online', 'offline', 'maintenance']),
  thresholdWarning: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(0))
    .optional()
    .nullable(),
  thresholdCritical: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(0))
    .optional()
    .nullable(),
  calibrationOffset: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(0).max(50))
    .optional()
    .nullable()
});

type StationFormValues = z.infer<typeof formSchema>;

export type EditStationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: Station | null;
  onSuccess?: () => void;
};

export function EditStationDialog({
  open,
  onOpenChange,
  station,
  onSuccess
}: EditStationDialogProps) {
  const queryClient = useQueryClient();

  const { data: areasData, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['administrative-areas'],
    queryFn: () => getAdministrativeAreasApi(),
    staleTime: 5 * 60 * 1000
  });

  const areaOptions =
    areasData?.administrativeAreas?.map((area) => ({
      label: area.name,
      value: area.id
    })) ?? [];

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      locationDesc: '',
      roadName: '',
      direction: '',
      latitude: undefined,
      longitude: undefined,
      status: 'online' as const,
      thresholdWarning: null,
      thresholdCritical: null,
      calibrationOffset: null
    }
  });

  const formControl = form.control as unknown as Control<StationFormValues>;

  useEffect(() => {
    if (station) {
      form.reset({
        code: station.code ?? '',
        name: station.name ?? '',
        locationDesc: station.locationDesc ?? '',
        roadName: station.roadName ?? '',
        direction: station.direction ?? '',
        latitude: station.latitude ?? undefined,
        longitude: station.longitude ?? undefined,
        status: (station.status as StationFormValues['status']) ?? 'online',
        thresholdWarning: station.thresholdWarning ?? null,
        thresholdCritical: station.thresholdCritical ?? null,
        calibrationOffset: station.calibrationOffset ?? null
      } as any);
    }
  }, [station, form]);

  const updateStationMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: StationUpsertPayload;
    }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');
      }
      return stationsApi.updateStationFull(id, data, token);
    },
    onSuccess: async (response) => {
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['stations'] });
        toast.success('Cập nhật trạm thành công!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Cập nhật trạm thất bại', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi cập nhật trạm', {
        description: error.message
      });
    }
  });

  const onSubmit = async (values: StationFormValues) => {
    if (!station?.id) {
      toast.error('Thiếu mã trạm');
      return;
    }

    const payload: StationUpsertPayload = {
      code: values.code,
      name: values.name,
      locationDesc: values.locationDesc || null,
      roadName: values.roadName || null,
      direction: values.direction || null,
      latitude: values.latitude ?? 0,
      longitude: values.longitude ?? 0,
      status: values.status,
      thresholdWarning: values.thresholdWarning ?? null,
      thresholdCritical: values.thresholdCritical ?? null,
      calibrationOffset: values.calibrationOffset ?? null,
      installedAt: station.installedAt || null,
      lastSeenAt: station.lastSeenAt || null
    };

    updateStationMutation.mutate({ id: station.id, data: payload });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const isLoading = updateStationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-hidden p-0 sm:max-w-[600px]'>
        <div className='flex max-h-[90vh] flex-col'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle className='flex items-center gap-2'>
              <Edit className='text-primary h-5 w-5' />
              Sửa trạm
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin trạm. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <Form
            form={form as any}
            onSubmit={form.handleSubmit(onSubmit as any)}
            className='flex min-h-0 flex-1 flex-col'
          >
            <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormInput
                    control={formControl}
                    name='code'
                    label='Mã trạm'
                    placeholder='ST_DN_DRAGON_01'
                    required
                    disabled={isLoading}
                  />

                  <FormInput
                    control={formControl}
                    name='name'
                    label='Tên trạm'
                    placeholder='Trạm Cầu Rồng'
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
                    options={[
                      { label: 'Đang hoạt động', value: 'online' },
                      { label: 'Ngoại tuyến', value: 'offline' },
                      { label: 'Bảo trì', value: 'maintenance' }
                    ]}
                  />

                  <FormInput
                    control={formControl}
                    name='roadName'
                    label='Tuyến đường'
                    placeholder='Đường 2 Tháng 9'
                    disabled={isLoading}
                  />
                </div>

                <FormTextarea
                  control={formControl}
                  name='locationDesc'
                  label='Mô tả vị trí'
                  placeholder='Ví dụ: Nằm phía tây Cầu Rồng...'
                  disabled={isLoading}
                  config={{
                    maxLength: 500,
                    showCharCount: true,
                    rows: 3
                  }}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormInput
                    control={formControl}
                    name='direction'
                    label='Hướng'
                    placeholder='thượng lưu / hạ lưu'
                    disabled={isLoading}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormInput
                    control={formControl}
                    name='latitude'
                    label='Vĩ độ'
                    placeholder='16.061153'
                    type='number'
                    step='0.000001'
                    disabled={isLoading}
                  />

                  <FormInput
                    control={formControl}
                    name='longitude'
                    label='Kinh độ'
                    placeholder='108.221589'
                    type='number'
                    step='0.000001'
                    disabled={isLoading}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormInput
                    control={formControl}
                    name='thresholdWarning'
                    label='Ngưỡng cảnh báo'
                    placeholder='0.5'
                    type='number'
                    step='0.0001'
                    min={0}
                    disabled={isLoading}
                  />

                  <FormInput
                    control={formControl}
                    name='thresholdCritical'
                    label='Ngưỡng khẩn cấp'
                    placeholder='1.2'
                    type='number'
                    step='0.0001'
                    min={0}
                    disabled={isLoading}
                  />

                  <FormInput
                    control={formControl}
                    name='calibrationOffset'
                    label='Offset hiệu chuẩn (±cm)'
                    placeholder='5'
                    type='number'
                    step='0.1'
                    min={0}
                    max={50}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className='border-t px-6 py-4'>
              <DialogFooter>
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
                      Cập nhật trạm
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
