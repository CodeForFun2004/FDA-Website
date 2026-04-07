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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { planSubscriptionApi } from '@/features/plan-subscriptions/api/plan-subscription.api';
import { getAccessToken } from '@/libs/auth-utils';
import type {
  PricingPlan,
  UpdatePlanPayload,
  FeatureInput
} from '@/features/plan-subscriptions/types/plan-subscription.type';
import { Loader2, Save, Trash2, Plus, Sparkles, Edit } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FEATURE: FeatureInput = {
  featureKey: '',
  featureName: '',
  featureValue: '',
  description: null
};

interface EditFormState {
  name: string;
  description: string;
  priceMonth: string;
  priceYear: string;
  tier: string;
  isActive: boolean;
  sortOrder: string;
  features: FeatureInput[];
}

interface FormErrors {
  name?: string;
  priceMonth?: string;
  priceYear?: string;
  features?: string[];
}

function validate(form: EditFormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (Number(form.priceMonth) < 0) errors.priceMonth = 'Must be ≥ 0';
  if (Number(form.priceYear) < 0) errors.priceYear = 'Must be ≥ 0';

  const featureErrors = form.features.map((f) =>
    !f.featureKey.trim() ? 'Feature Key is required' : ''
  );
  if (featureErrors.some(Boolean)) errors.features = featureErrors;
  return errors;
}

export interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PricingPlan;
  onSuccess?: () => void;
}

export function EditPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess
}: EditPlanDialogProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = React.useState<EditFormState>({
    name: plan.name,
    description: plan.description ?? '',
    priceMonth: String(plan.priceMonth),
    priceYear: String(plan.priceYear),
    tier: String(plan.tier),
    isActive: plan.isActive,
    sortOrder: String(plan.sortOrder),
    features: plan.features.map((f) => ({
      featureKey: f.featureKey,
      featureName: f.featureName,
      featureValue: f.featureValue,
      description: f.description
    }))
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Sync form when plan changes (e.g., dialog reopened with different plan)
  React.useEffect(() => {
    if (open) {
      setForm({
        name: plan.name,
        description: plan.description ?? '',
        priceMonth: String(plan.priceMonth),
        priceYear: String(plan.priceYear),
        tier: String(plan.tier),
        isActive: plan.isActive,
        sortOrder: String(plan.sortOrder),
        features: plan.features.map((f) => ({
          featureKey: f.featureKey,
          featureName: f.featureName,
          featureValue: f.featureValue,
          description: f.description
        }))
      });
      setErrors({});
    }
  }, [open, plan]);

  const updateField = (
    field: keyof Omit<EditFormState, 'features' | 'isActive'>,
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

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdatePlanPayload) => {
      const token = await getAccessToken();
      if (!token)
        throw new Error('Authentication required. Please log in again.');
      return planSubscriptionApi.updatePlan(plan.id, payload, token);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully!', {
        description: `"${form.name}" has been updated.`
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to update plan', { description: error.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: UpdatePlanPayload = {
      code: plan.code,
      tier: Number(form.tier),
      name: form.name.trim(),
      description: form.description.trim(),
      priceMonth: Number(form.priceMonth),
      priceYear: Number(form.priceYear),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
      features: form.features.filter((f) => f.featureKey.trim())
    };
    updateMutation.mutate(payload);
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='text-primary h-5 w-5' />
            Edit Plan
          </DialogTitle>
          <DialogDescription className='flex items-center gap-2'>
            Editing plan:
            <Badge variant='secondary' className='font-mono text-xs'>
              {plan.code}
            </Badge>
            <span className='text-muted-foreground text-xs'>
              (Code is read-only)
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Code (read-only) */}
          <div className='space-y-1.5'>
            <Label>Plan Code</Label>
            <Input
              value={plan.code}
              disabled
              className='bg-muted/50 text-muted-foreground cursor-not-allowed font-mono'
            />
          </div>

          {/* Name */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-name'>
              Plan Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='edit-name'
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={isLoading}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className='text-destructive text-xs'>{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-1.5'>
            <Label htmlFor='edit-desc'>Description</Label>
            <Textarea
              id='edit-desc'
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              disabled={isLoading}
              rows={2}
              className='resize-none'
            />
          </div>

          {/* Pricing */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-price-month'>Price / Month (VND)</Label>
              <Input
                id='edit-price-month'
                type='number'
                min={0}
                value={form.priceMonth}
                onChange={(e) => updateField('priceMonth', e.target.value)}
                disabled={isLoading}
                className={errors.priceMonth ? 'border-destructive' : ''}
              />
              {errors.priceMonth && (
                <p className='text-destructive text-xs'>{errors.priceMonth}</p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-price-year'>Price / Year (VND)</Label>
              <Input
                id='edit-price-year'
                type='number'
                min={0}
                value={form.priceYear}
                onChange={(e) => updateField('priceYear', e.target.value)}
                disabled={isLoading}
                className={errors.priceYear ? 'border-destructive' : ''}
              />
              {errors.priceYear && (
                <p className='text-destructive text-xs'>{errors.priceYear}</p>
              )}
            </div>
          </div>

          {/* Sort Order & Active Status */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-tier'>Tier</Label>
              <select
                id='edit-tier'
                value={form.tier}
                onChange={(e) => updateField('tier', e.target.value)}
                disabled={isLoading}
                className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value='Free'>Free</option>
                <option value='Basic'>Basic</option>
                <option value='Premium'>Premium</option>
                <option value='Monitor'>Monitor</option>
              </select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-sort'>Sort Order</Label>
              <Input
                id='edit-sort'
                type='number'
                min={0}
                value={form.sortOrder}
                onChange={(e) => updateField('sortOrder', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Status</Label>
              <div className='flex h-10 items-center gap-3 rounded-md border px-3'>
                <Switch
                  id='edit-active'
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor='edit-active' className='cursor-pointer text-sm'>
                  {form.isActive ? (
                    <span className='text-emerald-600 dark:text-emerald-400'>
                      Active
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>Inactive</span>
                  )}
                </Label>
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
                  Features{' '}
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
                Add Feature
              </Button>
            </div>

            {form.features.length === 0 && (
              <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm'>
                No features. Click "Add Feature" to define plan features.
              </div>
            )}

            <div className='space-y-3'>
              {form.features.map((feature, index) => (
                <div
                  key={index}
                  className='bg-muted/30 space-y-2 rounded-lg border p-3'
                >
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-muted-foreground text-xs font-medium'>
                      Feature #{index + 1}
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
                        Feature Key <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        placeholder='max_stations'
                        value={feature.featureKey}
                        onChange={(e) =>
                          updateFeature(index, 'featureKey', e.target.value)
                        }
                        disabled={isLoading}
                        className={`h-8 font-mono text-xs ${errors.features?.[index] ? 'border-destructive' : ''}`}
                      />
                      {errors.features?.[index] && (
                        <p className='text-destructive text-xs'>
                          {errors.features[index]}
                        </p>
                      )}
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Feature Name</Label>
                      <Input
                        placeholder='Max Stations'
                        value={feature.featureName}
                        onChange={(e) =>
                          updateFeature(index, 'featureName', e.target.value)
                        }
                        disabled={isLoading}
                        className='h-8 text-xs'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Value</Label>
                      <Input
                        placeholder='Unlimited'
                        value={feature.featureValue}
                        onChange={(e) =>
                          updateFeature(index, 'featureValue', e.target.value)
                        }
                        disabled={isLoading}
                        className='h-8 text-xs'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Description</Label>
                      <Input
                        placeholder='Optional'
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

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
