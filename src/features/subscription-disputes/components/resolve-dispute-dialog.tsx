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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type {
  AdminComplaint,
  ResolveNewStatus
} from '../types/subscription-dispute.type';

interface ResolveDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: AdminComplaint | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onConfirm: (payload: {
    adminResponse: string;
    newStatus: ResolveNewStatus;
  }) => Promise<void>;
}

export function ResolveDisputeDialog({
  open,
  onOpenChange,
  complaint,
  isSubmitting,
  errorMessage,
  onConfirm
}: ResolveDisputeDialogProps) {
  const [adminResponse, setAdminResponse] = React.useState('');
  const [newStatus, setNewStatus] =
    React.useState<ResolveNewStatus>('resolved');

  React.useEffect(() => {
    if (!open) return;
    setAdminResponse('');
    setNewStatus('resolved');
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = adminResponse.trim();
    if (!trimmed) return;
    try {
      await onConfirm({ adminResponse: trimmed, newStatus });
    } catch {
      // Errors are handled by the parent (toast / errorMessage).
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[720px]'>
        <DialogHeader>
          <DialogTitle>Resolve Subscription Complaint</DialogTitle>
          <DialogDescription>
            Provide admin response and choose the new status.
          </DialogDescription>
        </DialogHeader>

        {complaint ? (
          <div className='space-y-4'>
            <div className='rounded-lg border p-3'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Subject</p>
                <p className='font-semibold'>{complaint.subject}</p>
              </div>
              <div className='mt-3 space-y-1'>
                <p className='text-muted-foreground text-xs'>Description</p>
                <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                  {complaint.description}
                </pre>
              </div>
              <div className='mt-3 space-y-1'>
                <p className='text-muted-foreground text-xs'>User</p>
                <p className='font-semibold'>
                  {complaint.userFullName} ({complaint.userEmail})
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='admin-response'>Admin Response</Label>
              <Textarea
                id='admin-response'
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder='Write a clear response for the user...'
                rows={5}
                disabled={isSubmitting}
              />
              {errorMessage ? (
                <p className='text-destructive text-sm'>{errorMessage}</p>
              ) : null}
            </div>

            <div className='space-y-2'>
              <Label>New Status</Label>
              <RadioGroup
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as ResolveNewStatus)}
                className='flex flex-col gap-3'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='resolved' id='status-resolved' />
                  <Label htmlFor='status-resolved' className='font-normal'>
                    Resolve
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='rejected' id='status-rejected' />
                  <Label htmlFor='status-rejected' className='font-normal'>
                    Reject
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        ) : (
          <div className='text-muted-foreground text-sm'>
            No complaint selected.
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !adminResponse.trim()}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
