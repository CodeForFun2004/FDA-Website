// src/features/stations/components/station-detail/component-create-dialog.tsx
'use client';

import React from 'react';
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
import type { ComponentUpsertPayload } from '@/features/stations/types/station.type';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/features/stations/utils/auth';

const COMPONENT_TYPE_OPTIONS = [
  { label: 'ESP32 (MCU)', value: 'esp32' },
  { label: 'Ultrasonic Sensor (SRT04)', value: 'srt04' },
  { label: 'Temperature Sensor', value: 'temperature_sensor' },
  { label: 'Battery', value: 'battery' },
  { label: 'Speaker', value: 'speaker' },
  { label: 'GSM Module', value: 'gsm_module' },
  { label: 'Solar Panel', value: 'solar_panel' },
  { label: 'Rain Sensor', value: 'rain_sensor' }
];

const formSchema = z.object({
  componentType: z.string().min(1, { message: 'Component type is required.' }),
  name: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  firmwareVersion: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

type FormValues = z.infer<typeof formSchema>;

export interface ComponentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: string;
  onSuccess?: () => void;
}

export function ComponentCreateDialog({
  open,
  onOpenChange,
  stationId,
  onSuccess
}: ComponentCreateDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      componentType: '',
      name: '',
      model: '',
      serialNumber: '',
      firmwareVersion: '',
      notes: ''
    }
  });

  const formControl = form.control as unknown as Control<FormValues>;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token)
        throw new Error('Authentication required. Please log in again.');

      const payload: ComponentUpsertPayload = {
        componentType: values.componentType,
        name: values.name || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        firmwareVersion: values.firmwareVersion || null,
        notes: values.notes || null
      };

      const res = await stationsApi.createComponent(stationId, payload, token);
      if (res.success) {
        toast.success('Component created successfully!', {
          description: `Component: ${res.component?.name || values.componentType}`
        });
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Failed to create component', { description: res.message });
      }
    } catch (error: any) {
      toast.error('Error creating component', { description: error.message });
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
            <Plus className='text-primary h-5 w-5' />
            Add Component
          </DialogTitle>
          <DialogDescription>
            Add a new hardware component to this station. Component type is
            required.
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
            label='Component Type'
            placeholder='Select type'
            required
            disabled={isLoading}
            options={COMPONENT_TYPE_OPTIONS}
          />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='name'
              label='Name'
              placeholder='ESP32 Main Controller'
              disabled={isLoading}
            />
            <FormInput
              control={formControl}
              name='model'
              label='Model'
              placeholder='ESP32-WROOM-32'
              disabled={isLoading}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='serialNumber'
              label='Serial Number'
              placeholder='ESP32-001234'
              disabled={isLoading}
            />
            <FormInput
              control={formControl}
              name='firmwareVersion'
              label='Firmware Version'
              placeholder='1.0.0'
              disabled={isLoading}
            />
          </div>

          <FormTextarea
            control={formControl}
            name='notes'
            label='Notes'
            placeholder='Additional notes about this component...'
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
                  Add Component
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
