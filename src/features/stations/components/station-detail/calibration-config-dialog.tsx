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
      if (!token)
        throw new Error('Authentication required. Please log in again.');

      const res = await stationsApi.updateCalibration(
        stationId,
        values.calibrationOffset,
        token
      );

      if (res.success) {
        toast.success('Calibration updated successfully!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Failed to update calibration', {
          description: res.message
        });
      }
    } catch (error: any) {
      toast.error('Error updating calibration', { description: error.message });
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
            Update Calibration Offset
          </DialogTitle>
          <DialogDescription>
            Current allowable error display for this station.
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
              label='New Offset (cm)'
              placeholder='5'
              description='Allowed: 0-50 cm (Default: 5cm)'
              disabled={isLoading}
            />

            <div className='bg-primary/5 border-primary/20 mt-4 rounded-md border p-3 text-sm'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='text-primary mt-0.5 h-4 w-4 shrink-0' />
                <p className='text-muted-foreground'>
                  <strong>Note:</strong> This value is for display purposes
                  only. It does not affect measurement results or any system
                  calculations.
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
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
