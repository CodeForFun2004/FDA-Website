'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { newsApi } from '@/features/news/api/news.api';
import type {
  Announcement,
  AnnouncementTarget,
  AnnouncementPriority,
  UpdateAnnouncementPayload
} from '@/features/news/types/news.type';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  announcementData: Announcement;
  onSuccess?: () => void;
};

const PRIORITY_OPTIONS: { value: AnnouncementPriority; label: string }[] = [
  { value: 'low', label: 'Thấp' },
  { value: 'normal', label: 'Bình thường' },
  { value: 'high', label: 'Cao' },
  { value: 'urgent', label: 'Khẩn cấp' }
];

const TARGET_OPTIONS: { value: AnnouncementTarget; label: string }[] = [
  { value: 'all', label: 'Tất cả người dùng' },
  { value: 'region', label: 'Theo khu vực' },
  { value: 'role', label: 'Theo vai trò' }
];

export function EditNewsDialog({
  open,
  onOpenChange,
  announcementData,
  onSuccess
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UpdateAnnouncementPayload>({});
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when dialog opens
  useEffect(() => {
    if (open && announcementData) {
      setForm({
        title: announcementData.title,
        content: announcementData.content ?? '',
        summary: announcementData.summary,
        imageUrl: announcementData.imageUrl,
        attachments: announcementData.attachments,
        target: announcementData.target,
        targetValue: announcementData.targetValue,
        priority: announcementData.priority
      });

      if (announcementData.scheduledAt) {
        setScheduleEnabled(true);
        // Convert UTC to local datetime-local format
        const local = new Date(announcementData.scheduledAt);
        const offset = local.getTimezoneOffset();
        const localDate = new Date(local.getTime() - offset * 60000);
        setScheduleDateTime(localDate.toISOString().slice(0, 16));
      } else {
        setScheduleEnabled(false);
        setScheduleDateTime('');
      }
    }
  }, [open, announcementData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const title = form.title ?? announcementData.title;
    const content = form.content ?? announcementData.content ?? '';
    if (!title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (title.length > 200) newErrors.title = 'Tiêu đề tối đa 200 ký tự';
    if (!content.trim()) newErrors.content = 'Nội dung là bắt buộc';
    if (content.length > 10000)
      newErrors.content = 'Nội dung tối đa 10,000 ký tự';
    if (scheduleEnabled && !scheduleDateTime)
      newErrors.scheduleDateTime = 'Vui lòng chọn ngày giờ';
    if (scheduleEnabled && scheduleDateTime) {
      const dt = new Date(scheduleDateTime);
      if (dt <= new Date())
        newErrors.scheduleDateTime = 'Thời gian phải lớn hơn hiện tại';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload: UpdateAnnouncementPayload = {
        ...form,
        scheduledAt:
          scheduleEnabled && scheduleDateTime
            ? new Date(scheduleDateTime).toISOString()
            : form.scheduledAt !== undefined
              ? form.scheduledAt
              : null
      };

      await newsApi.updateAnnouncement(announcementData.id, payload);
      toast.success('Cập nhật thông báo thành công!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.message || 'Không thể cập nhật thông báo';
      toast.error(message);

      if (error?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const err of error.data.errors) {
          fieldErrors[err.field] = err.message;
        }
        setErrors(fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setErrors({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông báo</DialogTitle>
          <DialogDescription>
            Cập nhật nội dung thông báo. Chỉ có thể sửa khi trạng thái là Bản
            nháp hoặc Chờ đăng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Title */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-title'>
              Tiêu đề <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='edit-title'
              value={form.title ?? announcementData.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='Nhập tiêu đề thông báo...'
              maxLength={200}
              aria-invalid={!!errors.title}
            />
            <div className='flex justify-between'>
              {errors.title ? (
                <span className='text-destructive text-xs'>{errors.title}</span>
              ) : (
                <span />
              )}
              <span className='text-muted-foreground text-xs'>
                {(form.title ?? announcementData.title).length}/200
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-summary'>Tóm tắt</Label>
            <Input
              id='edit-summary'
              value={form.summary ?? announcementData.summary ?? ''}
              onChange={(e) =>
                setForm({ ...form, summary: e.target.value || null })
              }
              placeholder='Mô tả ngắn (tùy chọn)...'
              maxLength={500}
            />
          </div>

          {/* Content */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-content'>
              Nội dung <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='edit-content'
              value={form.content ?? announcementData.content ?? ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder='Nhập nội dung thông báo (hỗ trợ HTML)...'
              rows={6}
              maxLength={10000}
              aria-invalid={!!errors.content}
            />
            <div className='flex justify-between'>
              {errors.content ? (
                <span className='text-destructive text-xs'>
                  {errors.content}
                </span>
              ) : (
                <span />
              )}
              <span className='text-muted-foreground text-xs'>
                {(form.content ?? announcementData.content ?? '').length}/10,000
              </span>
            </div>
          </div>

          {/* Image URL */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-imageUrl'>Hình ảnh đại diện</Label>
            <Input
              id='edit-imageUrl'
              type='url'
              value={form.imageUrl ?? announcementData.imageUrl ?? ''}
              onChange={(e) =>
                setForm({ ...form, imageUrl: e.target.value || null })
              }
              placeholder='https://example.com/image.jpg'
            />
          </div>

          {/* Target */}
          <div className='space-y-1.5'>
            <Label>Đối tượng nhận</Label>
            <div className='flex flex-col gap-2'>
              {TARGET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className='flex cursor-pointer items-center gap-2'
                >
                  <input
                    type='radio'
                    name='edit-target'
                    value={opt.value}
                    checked={
                      (form.target ?? announcementData.target) === opt.value
                    }
                    onChange={() =>
                      setForm({ ...form, target: opt.value, targetValue: null })
                    }
                    className='accent-primary'
                  />
                  <span className='text-sm'>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Value */}
          {(form.target ?? announcementData.target) !== 'all' && (
            <div className='space-y-1.5'>
              <Label htmlFor='edit-targetValue'>
                {form.target === 'region' ? 'Mã khu vực' : 'Tên vai trò'}
              </Label>
              <Input
                id='edit-targetValue'
                value={form.targetValue ?? announcementData.targetValue ?? ''}
                onChange={(e) =>
                  setForm({ ...form, targetValue: e.target.value || null })
                }
                placeholder={
                  (form.target ?? announcementData.target) === 'region'
                    ? 'VD: HCM, HN...'
                    : 'VD: USER, MODERATOR...'
                }
              />
            </div>
          )}

          {/* Priority */}
          <div className='space-y-1.5'>
            <Label>Độ ưu tiên</Label>
            <div className='flex flex-wrap gap-3'>
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className='flex cursor-pointer items-center gap-1.5'
                >
                  <input
                    type='radio'
                    name='edit-priority'
                    value={opt.value}
                    checked={
                      (form.priority ?? announcementData.priority) === opt.value
                    }
                    onChange={() => setForm({ ...form, priority: opt.value })}
                    className='accent-primary'
                  />
                  <span className='text-sm'>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={scheduleEnabled}
                onChange={(e) => {
                  setScheduleEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setForm({ ...form, scheduledAt: null });
                    setScheduleDateTime('');
                  }
                }}
                className='accent-primary'
              />
              Đặt lịch đăng
            </Label>
            {scheduleEnabled && (
              <div>
                <Input
                  type='datetime-local'
                  value={scheduleDateTime}
                  onChange={(e) => {
                    setScheduleDateTime(e.target.value);
                    setErrors({ ...errors, scheduleDateTime: '' });
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  aria-invalid={!!errors.scheduleDateTime}
                />
                {errors.scheduleDateTime && (
                  <span className='text-destructive text-xs'>
                    {errors.scheduleDateTime}
                  </span>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleClose(false)}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
