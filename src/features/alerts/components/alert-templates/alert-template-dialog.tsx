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
  name: z.string().min(1, 'Tên là bắt buộc'),
  channel: z.enum(['Push', 'Email', 'SMS', 'InApp']),
  severity: z
    .enum(['info', 'caution', 'warning', 'critical'])
    .nullable()
    .optional(),
  titleTemplate: z.string().min(1, 'Mẫu tiêu đề là bắt buộc'),
  bodyTemplate: z.string().min(1, 'Mẫu nội dung là bắt buộc'),
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
        toast.success('Cập nhật mẫu thành công');
      } else {
        await createMutation.mutateAsync({ data: values });
        toast.success('Tạo mẫu thành công');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Thao tác thất bại', { description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Sửa mẫu cảnh báo' : 'Tạo mẫu cảnh báo'}
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
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder='VD: Mẫu Push khẩn cấp' {...field} />
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
                  <FormLabel>Kênh</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn kênh' />
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
                  <FormLabel>Mức độ (tùy chọn)</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === 'null' ? null : val)
                    }
                    value={field.value || 'null'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Tất cả' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='null'>Tất cả (mặc định)</SelectItem>
                      <SelectItem value='info'>Thông tin</SelectItem>
                      <SelectItem value='caution'>Cảnh giác</SelectItem>
                      <SelectItem value='warning'>Cảnh báo</SelectItem>
                      <SelectItem value='critical'>Khẩn cấp</SelectItem>
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
                <FormLabel>Mẫu tiêu đề</FormLabel>
                <FormControl>
                  <Input
                    placeholder='VD: Cảnh báo - {{station_name}}'
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-xs'>
                  Hỗ trợ biến như {`{{station_name}}`}, {`{{water_level}}`}
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
                <FormLabel>Mẫu nội dung</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='VD: Mực nước tại {{station_name}} đã đạt {{water_level}}.'
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
                  <FormLabel>Trạng thái hoạt động</FormLabel>
                  <FormDescription>Bật hoặc tắt mẫu này</FormDescription>
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
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Lưu thay đổi' : 'Tạo'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
