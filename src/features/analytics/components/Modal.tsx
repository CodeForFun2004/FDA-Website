'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Minimal modal wrapper consistent with app Dialog (shadcn).
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]'>
        <DialogHeader className='border-border shrink-0 border-b px-6 py-4 pr-14'>
          <div className='min-w-0 space-y-1'>
            <DialogTitle className='text-left text-base'>{title}</DialogTitle>
            {description ? (
              <DialogDescription className='text-left text-xs'>
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
          {children}
        </div>
        {footer ? (
          <DialogFooter className='border-border shrink-0 border-t px-6 py-4'>
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
