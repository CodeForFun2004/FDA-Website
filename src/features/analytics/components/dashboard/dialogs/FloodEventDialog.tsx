'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import {
  createFloodEventApi,
  updateFloodEventApi,
  getAdministrativeAreasApi
} from '@/features/admin/api/admin.api';
import type { FloodEvent } from '@/features/admin/types/admin.type';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// --------------- schema ---------------
const schema = z.object({
  administrativeAreaId: z.string().min(1, 'Khu vực là bắt buộc.'),
  startTime: z.string().min(1, 'Thời điểm bắt đầu là bắt buộc.'),
  endTime: z.string().min(1, 'Thời điểm kết thúc là bắt buộc.'),
  peakLevel: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  durationHours: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  )
});

type FormValues = z.infer<typeof schema>;

// Helper: convert ISO string to local datetime-local input value
function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    // Format: YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

// Helper: convert datetime-local input value to ISO string
function datetimeLocalToIso(v: string) {
  if (!v) return '';
  return new Date(v).toISOString();
}

// --------------- props ---------------
export interface FloodEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided → Edit mode */
  event?: FloodEvent | null;
  /** Pre-select area when creating from context */
  defaultAreaId?: string;
  onSuccess?: () => void;
}

// --------------- component ---------------
export function FloodEventDialog({
  open,
  onOpenChange,
  event,
  defaultAreaId,
  onSuccess
}: FloodEventDialogProps) {
  const isEdit = !!event;
  const queryClient = useQueryClient();

  const { data: areasData } = useQuery({
    queryKey: ['admin-areas-all'],
    queryFn: () => getAdministrativeAreasApi({ pageSize: 100 }),
    staleTime: 5 * 60_000,
    enabled: open,
    retry: false
  });

  const areaOptions = React.useMemo(
    () =>
      (areasData?.administrativeAreas ?? []).map((a) => ({
        label: `${a.name} (${a.level})`,
        value: a.id
      })),
    [areasData]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      administrativeAreaId: defaultAreaId ?? '',
      startTime: '',
      endTime: '',
      peakLevel: '' as any,
      durationHours: '' as any
    }
  });

  useEffect(() => {
    if (open) {
      form.reset(
        event
          ? {
              administrativeAreaId: event.administrativeAreaId,
              startTime: isoToDatetimeLocal(event.startTime),
              endTime: isoToDatetimeLocal(event.endTime),
              peakLevel: event.peakLevel ?? ('' as any),
              durationHours: event.durationHours ?? ('' as any)
            }
          : {
              administrativeAreaId: defaultAreaId ?? '',
              startTime: '',
              endTime: '',
              peakLevel: '' as any,
              durationHours: '' as any
            }
      );
    }
  }, [open, event, defaultAreaId, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        administrativeAreaId: values.administrativeAreaId,
        startTime: datetimeLocalToIso(values.startTime),
        endTime: datetimeLocalToIso(values.endTime),
        peakLevel: values.peakLevel ?? null,
        durationHours: values.durationHours ?? null
      };
      if (isEdit && event?.id) {
        return updateFloodEventApi(event.id, payload);
      }
      return createFloodEventApi(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-flood-events'] });
      toast.success(isEdit ? 'Flood event updated.' : 'Flood event created.');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(
        isEdit
          ? 'Failed to update flood event'
          : 'Failed to create flood event',
        {
          description: err?.message ?? 'Unknown error'
        }
      );
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const handleClose = (o: boolean) => {
    if (!o) form.reset();
    onOpenChange(o);
  };

  const loading = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {isEdit ? (
              <>
                <IconEdit className='text-primary h-5 w-5' />
                Edit Flood Event
              </>
            ) : (
              <>
                <IconPlus className='text-primary h-5 w-5' />
                Create Flood Event
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update flood event details.'
              : 'Record a new flood event. This data feeds into Frequency aggregation.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-4'
        >
          <FormSelect
            control={form.control as any}
            name='administrativeAreaId'
            label='Administrative area'
            placeholder='Select area'
            required
            disabled={loading}
            options={areaOptions}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormInput
              control={form.control as any}
              name='startTime'
              label='Start time'
              type='text'
              placeholder='YYYY-MM-DDTHH:mm'
              required
              disabled={loading}
            />

            <FormInput
              control={form.control as any}
              name='endTime'
              label='End time'
              type='text'
              placeholder='YYYY-MM-DDTHH:mm'
              required
              disabled={loading}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormInput
              control={form.control as any}
              name='peakLevel'
              label='Peak level (m)'
              type='number'
              placeholder='1.85'
              step='0.01'
              min={0}
              disabled={loading}
            />

            <FormInput
              control={form.control as any}
              name='durationHours'
              label='Duration (hours)'
              type='number'
              placeholder='6'
              step='0.5'
              min={0}
              disabled={loading}
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='gap-2'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {isEdit ? 'Đang lưu…' : 'Đang tạo…'}
                </>
              ) : isEdit ? (
                <>
                  <IconEdit className='h-4 w-4' />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <IconPlus className='h-4 w-4' />
                  Create event
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
