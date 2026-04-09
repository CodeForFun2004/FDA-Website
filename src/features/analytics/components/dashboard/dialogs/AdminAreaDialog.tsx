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
import { FormTextarea } from '@/components/forms/form-textarea';
import {
  createAdministrativeAreaApi,
  updateAdministrativeAreaApi,
  getAdministrativeAreasApi
} from '@/features/admin/api/admin.api';
import type { AdministrativeArea } from '@/features/admin/types/admin.type';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// --------------- schema ---------------
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  level: z.enum(['province', 'district', 'ward', 'street']),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().optional().nullable(),
  geometry: z.string().optional().nullable()
});

type FormValues = z.infer<typeof schema>;

// --------------- helpers ---------------
function formatValidationError(err: any): string {
  // Try to extract detailed field errors from backend response
  const errors = err?.data?.errors;
  if (errors && typeof errors === 'object') {
    return Object.entries(errors)
      .map(
        ([field, msgs]) =>
          `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
      )
      .join(' | ');
  }
  return err?.message ?? 'Unknown error';
}

// --------------- props ---------------
export interface AdminAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided → Edit mode, else → Create mode */
  area?: AdministrativeArea | null;
  onSuccess?: () => void;
}

// --------------- component ---------------
export function AdminAreaDialog({
  open,
  onOpenChange,
  area,
  onSuccess
}: AdminAreaDialogProps) {
  const isEdit = !!area;
  const queryClient = useQueryClient();

  const { data: areasData } = useQuery({
    queryKey: ['admin-areas-all'],
    queryFn: () => getAdministrativeAreasApi({ pageSize: 100 }),
    staleTime: 5 * 60_000,
    enabled: open,
    retry: false
  });

  const parentOptions = React.useMemo(
    () =>
      (areasData?.administrativeAreas ?? [])
        .filter((a) => a.id !== area?.id)
        .map((a) => ({ label: `${a.name} (${a.level})`, value: a.id })),
    [areasData, area?.id]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      level: 'province' as any,
      code: '',
      parentId: '__none__',
      geometry: ''
    }
  });

  // Reset form when dialog opens / area changes
  useEffect(() => {
    if (open) {
      form.reset(
        area
          ? {
              name: area.name,
              level: area.level as FormValues['level'],
              code: area.code,
              parentId: area.parentId ?? '__none__',
              geometry: area.geometry ?? ''
            }
          : {
              name: '',
              level: 'province' as any,
              code: '',
              parentId: '__none__',
              geometry: ''
            }
      );
    }
  }, [open, area, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        level: values.level,
        code: values.code,
        parentId:
          values.parentId && values.parentId !== '__none__'
            ? values.parentId
            : null,
        geometry: values.geometry?.trim() || null
      };
      console.log(
        '[AdminAreaDialog] Submitting payload:',
        JSON.stringify(payload, null, 2)
      );
      if (isEdit && area?.id) {
        return updateAdministrativeAreaApi(area.id, payload);
      }
      return createAdministrativeAreaApi(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-areas-all'] });
      toast.success(
        isEdit ? 'Administrative area updated.' : 'Administrative area created.'
      );
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: any) => {
      console.error('[AdminAreaDialog] Mutation error:', err);
      toast.error(isEdit ? 'Failed to update area' : 'Failed to create area', {
        description: formatValidationError(err)
      });
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
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {isEdit ? (
              <>
                <IconEdit className='text-primary h-5 w-5' />
                Edit Administrative Area
              </>
            ) : (
              <>
                <IconPlus className='text-primary h-5 w-5' />
                Create Administrative Area
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the area information below.'
              : 'Fill in the details to create a new administrative area.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-4'
        >
          <FormInput
            control={form.control as any}
            name='name'
            label='Name'
            placeholder='Hai Chau District'
            required
            disabled={loading}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormSelect
              control={form.control as any}
              name='level'
              label='Level'
              placeholder='Select level'
              required
              disabled={loading}
              options={[
                { label: 'Province', value: 'province' },
                { label: 'District', value: 'district' },
                { label: 'Ward', value: 'ward' },
                { label: 'Street', value: 'street' }
              ]}
            />

            <FormInput
              control={form.control as any}
              name='code'
              label='Code'
              placeholder='HC-01'
              required
              disabled={loading}
            />
          </div>

          <FormSelect
            control={form.control as any}
            name='parentId'
            label='Parent area (optional)'
            placeholder='None (top-level)'
            disabled={loading}
            options={[
              { label: '— None —', value: '__none__' },
              ...parentOptions
            ]}
          />

          <FormTextarea
            control={form.control as any}
            name='geometry'
            label='Geometry (GeoJSON string, optional)'
            placeholder='{"type":"Polygon","coordinates":[[[108.165,16.020],[108.190,16.020],[108.190,16.055],[108.165,16.020]]]}'
            disabled={loading}
            config={{ rows: 3, maxLength: 5000, showCharCount: false }}
            description='JSON string of a GeoJSON Polygon. Leave empty if not available.'
          />

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='gap-2'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? (
                <>
                  <IconEdit className='h-4 w-4' />
                  Save changes
                </>
              ) : (
                <>
                  <IconPlus className='h-4 w-4' />
                  Create area
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
