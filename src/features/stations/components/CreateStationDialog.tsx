// src/features/stations/components/CreateStationDialog.tsx
'use client';

import React, { useState } from 'react';
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
import type { StationUpsertPayload } from '@/features/stations/types/station.type';
import { Loader2, Plus } from 'lucide-react';
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

  status: z.enum(['active', 'offline', 'maintenance']),
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

export type CreateStationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CreateStationDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateStationDialogProps) {
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

  // Create station mutation
  const createStationMutation = useMutation({
    mutationFn: async (data: StationUpsertPayload) => {
      const token = await getAccessToken();

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('🔑 Token retrieved: Valid token obtained');
      console.log('📤 Creating station with data:', data);

      return stationsApi.createStation(data, token);
    },
    onSuccess: async (response) => {
      if (response.success) {
        // Invalidate and refetch stations query immediately
        await queryClient.invalidateQueries({ queryKey: ['stations'] });

        // Show success toast after UI updates
        toast.success('Station created successfully!', {
          description: `Station: ${response.data.name}`
        });

        // Reset form
        form.reset();

        // Close dialog
        onOpenChange(false);

        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Failed to create station', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Error creating station', {
        description: error.message
      });
    }
  });

  const onSubmit = async (values: StationFormValues) => {
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
      lastSeenAt: null
    };

    createStationMutation.mutate(payload);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const isLoading = createStationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='text-primary h-5 w-5' />
            Create New Station
          </DialogTitle>
          <DialogDescription>
            Fill in the information to create a new monitoring station. Fields
            marked with * are required.
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
                { label: 'Offline', value: 'offline' },
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className='h-4 w-4' />
                  Create Station
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
