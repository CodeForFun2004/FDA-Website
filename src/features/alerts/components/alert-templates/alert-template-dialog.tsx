'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertTemplate } from '../../types/alert-template.type';
import {
  useCreateAlertTemplate,
  useUpdateAlertTemplate
} from '../../hooks/useAlertTemplates';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  channel: z.enum(['Push', 'Email', 'SMS', 'InApp']),
  severity: z
    .enum(['info', 'caution', 'warning', 'critical'])
    .nullable()
    .optional(),
  titleTemplate: z.string().min(1, 'Title template is required'),
  bodyTemplate: z.string().min(1, 'Body template is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0)
});

type FormValues = z.infer<typeof formSchema>;

interface AlertTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AlertTemplate | null;
}

export function AlertTemplateDialog({
  open,
  onOpenChange,
  template
}: AlertTemplateDialogProps) {
  const createMutation = useCreateAlertTemplate();
  const updateMutation = useUpdateAlertTemplate();

  const isEditing = !!template;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      channel: 'Push',
      severity: null,
      titleTemplate: '',
      bodyTemplate: '',
      isActive: true,
      sortOrder: 0
    }
  });

  useEffect(() => {
    if (template && open) {
      form.reset({
        name: template.name,
        channel: template.channel,
        severity: template.severity,
        titleTemplate: template.titleTemplate,
        bodyTemplate: template.bodyTemplate,
        isActive: template.isActive,
        sortOrder: template.sortOrder
      });
    } else if (!open) {
      form.reset({
        name: '',
        channel: 'Push',
        severity: null,
        titleTemplate: '',
        bodyTemplate: '',
        isActive: true,
        sortOrder: 0
      });
    }
  }, [template, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: template!.id, data: values });
        toast.success('Template updated successfully');
      } else {
        await createMutation.mutateAsync({ data: values });
        toast.success('Template created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Operation failed', { description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Alert Template' : 'Create Alert Template'}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit as any)}
          className='space-y-4'
        >
          <FormField
            control={form.control as any}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Critical Push Template' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control as any}
              name='channel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select channel' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Push'>Push</SelectItem>
                      <SelectItem value='Email'>Email</SelectItem>
                      <SelectItem value='SMS'>SMS</SelectItem>
                      <SelectItem value='InApp'>InApp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name='severity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity (Optional)</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === 'null' ? null : val)
                    }
                    value={field.value || 'null'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='All' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='null'>All (Fallback)</SelectItem>
                      <SelectItem value='info'>Info</SelectItem>
                      <SelectItem value='caution'>Caution</SelectItem>
                      <SelectItem value='warning'>Warning</SelectItem>
                      <SelectItem value='critical'>Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control as any}
            name='titleTemplate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Template</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g. ⚠️ Warning - {{station_name}}'
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-xs'>
                  Supports variables like {`{{station_name}}`},{' '}
                  {`{{water_level}}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name='bodyTemplate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Template</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='e.g. Water level at {{station_name}} reached {{water_level}}.'
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                <div className='space-y-0.5'>
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription>
                    Enable or disable this template
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
