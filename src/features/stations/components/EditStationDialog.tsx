// src/features/stations/components/EditStationDialog.tsx
'use client';

import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Station,
  StationUpsertPayload
} from '@/features/stations/types/station.type';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Helpers
const toNumberOrUndefined = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const formSchema = z.object({
  code: z.string().min(2, { message: 'Code must be at least 2 characters.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  locationDesc: z.string().optional().nullable(),
  roadName: z.string().optional().nullable(),
  direction: z.string().optional().nullable(),

  latitude: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(-90).max(90))
    .optional(),
  longitude: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(-180).max(180))
    .optional(),

  status: z.enum(['active', 'inactive', 'maintenance']),
  thresholdWarning: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(0))
    .optional()
    .nullable(),
  thresholdCritical: z
    .preprocess((v) => toNumberOrUndefined(v), z.number().min(0))
    .optional()
    .nullable(),

  installedAt: z.string().optional().nullable()
});

type StationFormValues = z.infer<typeof formSchema>;

import { getAccessToken } from '@/features/stations/utils/auth';

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
  const router = useRouter();

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
      status: 'active' as const,
      thresholdWarning: null,
      thresholdCritical: null,
      installedAt: null
    }
  });

  // Type-safe control
  const formControl = form.control as unknown as Control<StationFormValues>;

  // Update form when station data changes
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
        status: (station.status as StationFormValues['status']) ?? 'active',
        thresholdWarning: station.thresholdWarning ?? null,
        thresholdCritical: station.thresholdCritical ?? null,
        installedAt: station.installedAt ?? null
      } as any);
    }
  }, [station, form]);

  // Update station mutation
  const updateStationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StationUpsertPayload }) => {
      const token = getAccessToken();
      console.log(
        '🔑 Token retrieved:',
        token ? 'Token exists' : 'No token found'
      );
      console.log('📤 Updating station with ID:', id);
      console.log('📦 Payload:', data);
      return stationsApi.updateStationFull(id, data, token ?? undefined);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Station updated successfully!');
        // Invalidate stations query to refetch
        queryClient.invalidateQueries({ queryKey: ['stations'] });
        // Close dialog
        onOpenChange(false);
        // Refresh the page
        router.refresh();
        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Failed to update station', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Error updating station', {
        description: error.message
      });
    }
  });

  const onSubmit = async (values: StationFormValues) => {
    if (!station?.id) {
      toast.error('Station ID is missing');
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
      installedAt: values.installedAt || null,
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
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='text-primary h-5 w-5' />
            Edit Station
          </DialogTitle>
          <DialogDescription>
            Update the station information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='code'
              label='Station Code'
              placeholder='ST_DN_DRAGON_01'
              required
              disabled={isLoading}
            />

            <FormInput
              control={formControl}
              name='name'
              label='Station Name'
              placeholder='Dragon Bridge Station'
              required
              disabled={isLoading}
            />

            <FormSelect
              control={formControl}
              name='status'
              label='Status'
              placeholder='Select status'
              required
              disabled={isLoading}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Maintenance', value: 'maintenance' }
              ]}
            />

            <FormInput
              control={formControl}
              name='roadName'
              label='Road Name'
              placeholder='2 Thang 9 Street'
              disabled={isLoading}
            />
          </div>

          <FormTextarea
            control={formControl}
            name='locationDesc'
            label='Location Description'
            placeholder='Located on the west side of Dragon Bridge...'
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
              label='Direction'
              placeholder='upstream / downstream'
              disabled={isLoading}
            />

            <FormInput
              control={formControl}
              name='installedAt'
              label='Installed At (ISO)'
              placeholder='2026-01-13T10:00:00+00:00'
              disabled={isLoading}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='latitude'
              label='Latitude'
              placeholder='16.061153'
              type='number'
              step='0.000001'
              disabled={isLoading}
            />

            <FormInput
              control={formControl}
              name='longitude'
              label='Longitude'
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
              label='Threshold Warning'
              placeholder='0.5'
              type='number'
              step='0.0001'
              min={0}
              disabled={isLoading}
            />

            <FormInput
              control={formControl}
              name='thresholdCritical'
              label='Threshold Critical'
              placeholder='1.2'
              type='number'
              step='0.0001'
              min={0}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4' />
                  Update Station
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
