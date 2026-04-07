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
import type { AdminComplaint } from '../types/subscription-dispute.type';

interface SubscriptionDisputeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: AdminComplaint | null;
}

export function SubscriptionDisputeDetailsDialog({
  open,
  onOpenChange,
  complaint
}: SubscriptionDisputeDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[680px]'>
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
          <DialogDescription>
            Read-only information about the selected subscription dispute.
          </DialogDescription>
        </DialogHeader>

        {complaint ? (
          <div className='space-y-4'>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Subject</p>
              <p className='font-semibold'>{complaint.subject}</p>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>User</p>
              <p className='font-semibold'>
                {complaint.userFullName} ({complaint.userEmail})
              </p>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Description</p>
              <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                {complaint.description}
              </pre>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Status</p>
                <p className='font-semibold'>{complaint.status}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Created At</p>
                <p className='font-semibold'>
                  {new Date(complaint.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {complaint.adminResponse ? (
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Admin Response</p>
                <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                  {complaint.adminResponse}
                </pre>
              </div>
            ) : null}

            {complaint.resolvedAt ? (
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Resolved At</p>
                <p className='font-semibold'>
                  {new Date(complaint.resolvedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className='text-muted-foreground text-sm'>
            No complaint selected.
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
