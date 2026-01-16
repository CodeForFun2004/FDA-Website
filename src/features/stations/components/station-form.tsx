// src/features/stations/components/station-form.tsx
'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type { Station } from '@/features/stations/types/station.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm, Control } from 'react-hook-form';
import * as z from 'zod';

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

export type StationFormValues = z.infer<typeof formSchema>;

export default function StationForm({
  initialData,
  pageTitle
}: {
  initialData: Station | null;
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = useMemo<StationFormValues>(
    () => ({
      code: initialData?.code ?? '',
      name: initialData?.name ?? '',
      locationDesc: initialData?.locationDesc ?? '',
      roadName: initialData?.roadName ?? '',
      direction: initialData?.direction ?? '',
      latitude: initialData?.latitude ?? undefined,
      longitude: initialData?.longitude ?? undefined,
      status: (initialData?.status as StationFormValues['status']) ?? 'active',
      thresholdWarning: initialData?.thresholdWarning ?? null,
      thresholdCritical: initialData?.thresholdCritical ?? null,
      installedAt: initialData?.installedAt ?? null
    }),
    [initialData]
  );

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues
  });

  // Type-safe control
  const formControl = form.control as unknown as Control<StationFormValues>;

  async function onSubmit(values: StationFormValues) {
    // TODO: wire create/update API
    // if (initialData?.id) await stationsApi.updateStation(initialData.id, values)
    // else await stationsApi.createStation(values)

    console.log('submit station', values);
    router.push('/admin/stations');
    router.refresh();
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-8'
        >
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='code'
              label='Station Code'
              placeholder='ST_DN_DRAGON_01'
              required
            />

            <FormInput
              control={formControl}
              name='name'
              label='Station Name'
              placeholder='Trạm Quan Trắc Giao Thông Cầu Rồng'
              required
            />

            <FormSelect
              control={formControl}
              name='status'
              label='Status'
              placeholder='Select status'
              required
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
              placeholder='Đường 2 tháng 9'
            />
          </div>

          <FormTextarea
            control={formControl}
            name='locationDesc'
            label='Location Description'
            placeholder='Nằm ở phía Tây cầu Rồng, gần bảo tàng...'
            config={{
              maxLength: 500,
              showCharCount: true,
              rows: 3
            }}
          />

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='direction'
              label='Direction'
              placeholder='upstream / downstream / road section...'
            />

            <FormInput
              control={formControl}
              name='installedAt'
              label='Installed At (ISO)'
              placeholder='2026-01-13T10:00:00+00:00'
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='latitude'
              label='Latitude'
              placeholder='16.061153'
              type='number'
              step='0.000001'
            />

            <FormInput
              control={formControl}
              name='longitude'
              label='Longitude'
              placeholder='108.221589'
              type='number'
              step='0.000001'
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={formControl}
              name='thresholdWarning'
              label='Threshold Warning'
              placeholder='0.5'
              type='number'
              step='0.0001'
              min={0}
            />

            <FormInput
              control={formControl}
              name='thresholdCritical'
              label='Threshold Critical'
              placeholder='1.2'
              type='number'
              step='0.0001'
              min={0}
            />
          </div>

          <Button type='submit'>
            {initialData?.id ? 'Update Station' : 'Create Station'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
