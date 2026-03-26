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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { newsApi } from '@/features/news/api/news.api';
import type {
  Announcement,
  AnnouncementTarget,
  AnnouncementPriority,
  CreateAnnouncementPayload
} from '@/features/news/types/news.type';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: (created: Announcement) => void;
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

function getUploadedImageUrl(uploadResult: any): string | null {
  return (
    uploadResult?.url ??
    uploadResult?.imageUrl ??
    uploadResult?.data?.url ??
    uploadResult?.data?.imageUrl ??
    null
  );
}

async function uploadNewsImage(file: File): Promise<string> {
  const uploadEndpoint = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_ENDPOINT;

  if (!uploadEndpoint) {
    throw new Error('Thiếu cấu hình NEXT_PUBLIC_UPLOAD_IMAGE_ENDPOINT');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message || 'Upload ảnh thất bại';
    throw new Error(message);
  }

  const imageUrl = getUploadedImageUrl(body);
  if (!imageUrl) {
    throw new Error('Không lấy được image URL từ response upload');
  }

  return imageUrl;
}

export function CreateNewsDialog({ open, onOpenChange, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState<CreateAnnouncementPayload>({
    title: '',
    content: '',
    summary: null,
    imageUrl: null,
    attachments: null,
    scheduledAt: null,
    target: 'all',
    targetValue: null,
    priority: 'normal'
  });

  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    null
  );
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    };
  }, [localImagePreview]);

  const resetImageState = () => {
    if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    setSelectedImageFile(null);
    setLocalImagePreview(null);
    setForm((prev) => ({ ...prev, imageUrl: null }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (form.title.length > 200) newErrors.title = 'Tiêu đề tối đa 200 ký tự';
    if (!form.content.trim()) newErrors.content = 'Nội dung là bắt buộc';
    if (form.content.length > 10000)
      newErrors.content = 'Nội dung tối đa 10,000 ký tự';
    if (selectedImageFile && !form.imageUrl)
      newErrors.imageUrl = 'Ảnh đang được chọn nhưng chưa upload thành công.';
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

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    const preview = URL.createObjectURL(file);

    setSelectedImageFile(file);
    setLocalImagePreview(preview);
    setErrors((prev) => ({ ...prev, imageUrl: '' }));
    setForm((prev) => ({ ...prev, imageUrl: null }));

    try {
      setUploadingImage(true);
      const imageUrl = await uploadNewsImage(file);
      setForm((prev) => ({ ...prev, imageUrl }));
      toast.success('Upload ảnh thành công');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể upload ảnh');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload: CreateAnnouncementPayload = {
        ...form,
        scheduledAt:
          scheduleEnabled && scheduleDateTime
            ? new Date(scheduleDateTime).toISOString()
            : null
      };

      const response = await newsApi.createAnnouncement(payload);
      toast.success('Tạo thông báo thành công!');
      onSuccess?.(response.data);

      setForm({
        title: '',
        content: '',
        summary: null,
        imageUrl: null,
        attachments: null,
        scheduledAt: null,
        target: 'all',
        targetValue: null,
        priority: 'normal'
      });
      setScheduleEnabled(false);
      setScheduleDateTime('');
      resetImageState();
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.message || 'Không thể tạo thông báo';
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

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm({
        title: '',
        content: '',
        summary: null,
        imageUrl: null,
        attachments: null,
        scheduledAt: null,
        target: 'all',
        targetValue: null,
        priority: 'normal'
      });
      setScheduleEnabled(false);
      setScheduleDateTime('');
      resetImageState();
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo thông báo</DialogTitle>
          <DialogDescription>
            Tạo thông báo mới để gửi đến người dùng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='title'>
              Tiêu đề <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              value={form.title}
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
                {form.title.length}/200
              </span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='content'>
              Nội dung <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='content'
              value={form.content}
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
                {form.content.length}/10,000
              </span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='summary'>Tóm tắt</Label>
            <Input
              id='summary'
              value={form.summary ?? ''}
              onChange={(e) =>
                setForm({ ...form, summary: e.target.value || null })
              }
              placeholder='Mô tả ngắn cho danh sách (tùy chọn)...'
              maxLength={500}
            />
            <span className='text-muted-foreground text-xs'>
              {form.summary?.length ?? 0}/500
            </span>
          </div>

          <div className='space-y-2'>
            <Label>Hình ảnh đại diện</Label>

            <div className='flex gap-4'>
              <label className='flex cursor-pointer items-center gap-1.5'>
                <input
                  type='radio'
                  name='imageMode'
                  value='url'
                  checked={imageMode === 'url'}
                  onChange={() => {
                    setImageMode('url');
                    resetImageState();
                  }}
                  className='accent-primary'
                />
                <span className='text-sm'>Nhập URL</span>
              </label>
              <label className='flex cursor-pointer items-center gap-1.5'>
                <input
                  type='radio'
                  name='imageMode'
                  value='upload'
                  checked={imageMode === 'upload'}
                  onChange={() => {
                    setImageMode('upload');
                    setForm((prev) => ({ ...prev, imageUrl: null }));
                  }}
                  className='accent-primary'
                />
                <span className='text-sm'>Upload file</span>
              </label>
            </div>

            {imageMode === 'url' ? (
              <div className='space-y-1'>
                <Input
                  id='imageUrl'
                  type='url'
                  value={form.imageUrl ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value || null
                    }))
                  }
                  placeholder='https://example.com/image.jpg'
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt='Preview'
                    className='h-36 w-full max-w-sm rounded-md border object-cover'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className='max-w-sm'
                  />
                  {selectedImageFile && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={resetImageState}
                      disabled={uploadingImage}
                    >
                      Bỏ ảnh
                    </Button>
                  )}
                </div>

                {selectedImageFile && (
                  <div className='text-muted-foreground text-xs'>
                    File: {selectedImageFile.name}
                    {uploadingImage ? ' • Đang upload...' : ''}
                  </div>
                )}

                {localImagePreview && (
                  <img
                    src={localImagePreview}
                    alt='News image preview'
                    className='h-36 w-full max-w-sm rounded-md border object-cover'
                  />
                )}

                {form.imageUrl && (
                  <Input
                    value={form.imageUrl}
                    readOnly
                    placeholder='URL sau khi upload'
                  />
                )}

                {errors.imageUrl && (
                  <span className='text-destructive text-xs'>
                    {errors.imageUrl}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label>
              Đối tượng nhận <span className='text-destructive'>*</span>
            </Label>
            <div className='flex flex-col gap-2'>
              {TARGET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className='flex cursor-pointer items-center gap-2'
                >
                  <input
                    type='radio'
                    name='target'
                    value={opt.value}
                    checked={form.target === opt.value}
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

          {form.target !== 'all' && (
            <div className='space-y-1.5'>
              <Label htmlFor='targetValue'>
                {form.target === 'region' ? 'Mã khu vực' : 'Tên vai trò'}
              </Label>
              <Input
                id='targetValue'
                value={form.targetValue ?? ''}
                onChange={(e) =>
                  setForm({ ...form, targetValue: e.target.value || null })
                }
                placeholder={
                  form.target === 'region'
                    ? 'VD: HCM, HN...'
                    : 'VD: USER, MODERATOR...'
                }
              />
            </div>
          )}

          <div className='space-y-1.5'>
            <Label>
              Độ ưu tiên <span className='text-destructive'>*</span>
            </Label>
            <div className='flex flex-wrap gap-3'>
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className='flex cursor-pointer items-center gap-1.5'
                >
                  <input
                    type='radio'
                    name='priority'
                    value={opt.value}
                    checked={form.priority === opt.value}
                    onChange={() => setForm({ ...form, priority: opt.value })}
                    className='accent-primary'
                  />
                  <span className='text-sm'>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

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
            <Button type='submit' disabled={submitting || uploadingImage}>
              {submitting ? 'Đang tạo...' : 'Tạo thông báo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
