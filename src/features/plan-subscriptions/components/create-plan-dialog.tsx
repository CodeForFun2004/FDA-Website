'use client';

import React from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { planSubscriptionApi } from '@/features/plan-subscriptions/api/plan-subscription.api';
import { getAccessToken } from '@/libs/auth-utils';
import type {
  CreatePlanPayload,
  FeatureInput
} from '@/features/plan-subscriptions/types/plan-subscription.type';
import { Loader2, Plus, Trash2, Sparkles, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FEATURE: FeatureInput = {
  featureKey: '',
  featureName: '',
  featureValue: '',
  description: null
};

interface FormState {
  code: string;
  name: string;
  description: string;
  priceMonth: string;
  priceYear: string;
  tier: string;
  sortOrder: string;
  features: FeatureInput[];
}

const DEFAULT_FORM: FormState = {
  code: '',
  name: '',
  description: '',
  priceMonth: '0',
  priceYear: '0',
  tier: '1',
  sortOrder: '1',
  features: []
};

interface FormErrors {
  code?: string;
  name?: string;
  priceMonth?: string;
  priceYear?: string;
  tier?: string;
  sortOrder?: string;
  features?: string[];
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.code.trim()) errors.code = 'Mã là bắt buộc.';
  else if (!/^[A-Z0-9_]+$/.test(form.code.trim()))
    errors.code = 'Mã chỉ gồm chữ in hoa, số và dấu gạch dưới (_).';
  if (!form.name.trim()) errors.name = 'Tên là bắt buộc.';
  if (Number(form.priceMonth) < 0) errors.priceMonth = 'Giá phải ≥ 0.';
  if (Number(form.priceYear) < 0) errors.priceYear = 'Giá phải ≥ 0.';
  if (!form.tier.trim()) errors.tier = 'Hạng là bắt buộc.';

  const featureErrors = form.features.map((f) =>
    !f.featureKey.trim() ? 'Mã tính năng là bắt buộc.' : ''
  );
  if (featureErrors.some(Boolean)) errors.features = featureErrors;

  return errors;
}

export interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  onSuccess
}: CreatePlanDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const updateField = (
    field: keyof Omit<FormState, 'features'>,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateFeature = (
    index: number,
    field: keyof FeatureInput,
    value: string | null
  ) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
    setErrors((prev) => {
      const featureErrors = [...(prev.features ?? [])];
      featureErrors[index] = '';
      return { ...prev, features: featureErrors };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { ...EMPTY_FEATURE }]
    }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePlanPayload) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');
      return planSubscriptionApi.createPlan(payload, token);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Tạo gói thành công!', {
        description: `Gói \"${res.data?.name ?? form.name}\" đã sẵn sàng.`
      });
      setForm(DEFAULT_FORM);
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Tạo gói thất bại', { description: error.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreatePlanPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      priceMonth: Number(form.priceMonth),
      priceYear: Number(form.priceYear),
      tier: Number(form.tier),
      sortOrder: Number(form.sortOrder),
      features: form.features.filter((f) => f.featureKey.trim())
    };
    createMutation.mutate(payload);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-hidden p-0 sm:max-w-2xl'>
        <div className='flex max-h-[85vh] flex-col'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='text-primary h-5 w-5' />
              Tạo gói mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo gói đăng ký mới. Các trường có dấu{' '}
              <span className='text-destructive'>*</span> là bắt buộc.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className='flex min-h-0 flex-1 flex-col'
          >
            <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
              <div className='space-y-6'>
                {/* Basic Info */}
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Code */}
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-code'>
                        Mã gói <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='create-code'
                        placeholder='VD: FREE, PREMIUM'
                        value={form.code}
                        onChange={(e) =>
                          updateField('code', e.target.value.toUpperCase())
                        }
                        disabled={isLoading}
                        className={`font-mono uppercase ${errors.code ? 'border-destructive' : ''}`}
                      />
                      {errors.code && (
                        <p className='text-destructive text-xs'>
                          {errors.code}
                        </p>
                      )}
                    </div>

                    {/* Name */}
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-name'>
                        Tên gói <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='create-name'
                        placeholder='VD: Gói cao cấp'
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        disabled={isLoading}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className='text-destructive text-xs'>
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='create-desc'>Mô tả</Label>
                    <Textarea
                      id='create-desc'
                      placeholder='Mô tả ngắn về gói và các quyền lợi…'
                      value={form.description}
                      onChange={(e) =>
                        updateField('description', e.target.value)
                      }
                      disabled={isLoading}
                      rows={2}
                      className='resize-none'
                    />
                  </div>

                  {/* Pricing */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-price-month'>
                        Giá / tháng (VND){' '}
                        <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='create-price-month'
                        type='number'
                        min={0}
                        placeholder='0'
                        value={form.priceMonth}
                        onChange={(e) =>
                          updateField('priceMonth', e.target.value)
                        }
                        disabled={isLoading}
                        className={
                          errors.priceMonth ? 'border-destructive' : ''
                        }
                      />
                      {errors.priceMonth && (
                        <p className='text-destructive text-xs'>
                          {errors.priceMonth}
                        </p>
                      )}
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-price-year'>
                        Giá / năm (VND){' '}
                        <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='create-price-year'
                        type='number'
                        min={0}
                        placeholder='0'
                        value={form.priceYear}
                        onChange={(e) =>
                          updateField('priceYear', e.target.value)
                        }
                        disabled={isLoading}
                        className={errors.priceYear ? 'border-destructive' : ''}
                      />
                      {errors.priceYear && (
                        <p className='text-destructive text-xs'>
                          {errors.priceYear}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tier & Sort Order */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-tier'>
                        Hạng <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='create-tier'
                        type='number'
                        min={1}
                        placeholder='1'
                        value={form.tier}
                        onChange={(e) => updateField('tier', e.target.value)}
                        disabled={isLoading}
                        className={errors.tier ? 'border-destructive' : ''}
                      />
                      {errors.tier && (
                        <p className='text-destructive text-xs'>
                          {errors.tier}
                        </p>
                      )}
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='create-sort'>Thứ tự</Label>
                      <Input
                        id='create-sort'
                        type='number'
                        min={0}
                        placeholder='1'
                        value={form.sortOrder}
                        onChange={(e) =>
                          updateField('sortOrder', e.target.value)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features Section */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Sparkles className='h-4 w-4 text-violet-500' />
                      <Label className='text-sm font-semibold'>
                        Tính năng{' '}
                        {form.features.length > 0 && (
                          <Badge variant='secondary' className='ml-1 text-xs'>
                            {form.features.length}
                          </Badge>
                        )}
                      </Label>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addFeature}
                      disabled={isLoading}
                      className='gap-1.5 text-xs'
                    >
                      <Plus className='h-3.5 w-3.5' />
                      Thêm tính năng
                    </Button>
                  </div>

                  {form.features.length === 0 && (
                    <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm'>
                      Chưa có tính năng. Nhấn “Thêm tính năng” để khai báo quyền
                      lợi cho gói.
                    </div>
                  )}

                  <div className='space-y-3'>
                    {form.features.map((feature, index) => (
                      <div
                        key={index}
                        className='bg-muted/30 relative space-y-2 rounded-lg border p-3'
                      >
                        <div className='mb-1 flex items-center justify-between'>
                          <span className='text-muted-foreground text-xs font-medium'>
                            Tính năng #{index + 1}
                          </span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeFeature(index)}
                            disabled={isLoading}
                            className='text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 p-0'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label className='text-xs'>
                              Mã tính năng{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                              placeholder='Mã dùng để phân biệt'
                              value={feature.featureKey}
                              onChange={(e) =>
                                updateFeature(
                                  index,
                                  'featureKey',
                                  e.target.value
                                )
                              }
                              disabled={isLoading}
                              className={`placeholder:text-muted-foreground h-8 font-sans text-xs placeholder:font-normal ${errors.features?.[index] ? 'border-destructive' : ''}`}
                            />
                            {errors.features?.[index] && (
                              <p className='text-destructive text-xs'>
                                {errors.features[index]}
                              </p>
                            )}
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-xs'>Tên tính năng</Label>
                            <Input
                              placeholder='VD: Số trạm tối đa'
                              value={feature.featureName}
                              onChange={(e) =>
                                updateFeature(
                                  index,
                                  'featureName',
                                  e.target.value
                                )
                              }
                              disabled={isLoading}
                              className='h-8 text-xs'
                            />
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label className='text-xs'>Giá trị</Label>
                            <Input
                              placeholder='VD: Không giới hạn'
                              value={feature.featureValue}
                              onChange={(e) =>
                                updateFeature(
                                  index,
                                  'featureValue',
                                  e.target.value
                                )
                              }
                              disabled={isLoading}
                              className='h-8 text-xs'
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-xs'>Mô tả</Label>
                            <Input
                              placeholder='Mô tả (không bắt buộc)'
                              value={feature.description ?? ''}
                              onChange={(e) =>
                                updateFeature(
                                  index,
                                  'description',
                                  e.target.value || null
                                )
                              }
                              disabled={isLoading}
                              className='h-8 text-xs'
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className='border-t px-6 py-4'>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={isLoading} className='gap-2'>
                  {isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Đang tạo…
                    </>
                  ) : (
                    <>
                      <Plus className='h-4 w-4' />
                      Tạo gói
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
