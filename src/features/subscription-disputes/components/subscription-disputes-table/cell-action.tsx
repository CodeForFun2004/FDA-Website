'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type {
  AdminComplaint,
  ResolveComplaintPayload
} from '../../types/subscription-dispute.type';
import { getAccessToken } from '@/libs/auth-utils';
import { subscriptionDisputeApi } from '../../api/subscription-dispute.api';
import { ResolveDisputeDialog } from '../resolve-dispute-dialog';

interface SubscriptionDisputeCellActionProps {
  complaint: AdminComplaint;
}

export function SubscriptionDisputeCellAction({
  complaint
}: SubscriptionDisputeCellActionProps) {
  const [openResolve, setOpenResolve] = React.useState(false);
  const [resolveError, setResolveError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const resolveMutation = useMutation({
    mutationFn: async (payload: ResolveComplaintPayload) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');
      }
      return subscriptionDisputeApi.resolveComplaint(
        complaint.id,
        payload,
        token
      );
    },
    onSuccess: async (res) => {
      setResolveError(null);
      await queryClient.invalidateQueries({
        queryKey: ['subscription-disputes']
      });
      toast.success(res.message || 'Đã cập nhật khiếu nại.');
      setOpenResolve(false);
    },
    onError: (error: Error) => {
      setResolveError(error.message || 'Không thể xử lý khiếu nại.');
      toast.error('Không thể xử lý khiếu nại', {
        description: error.message
      });
    }
  });

  return (
    <>
      <ResolveDisputeDialog
        open={openResolve}
        onOpenChange={setOpenResolve}
        complaint={complaint}
        isSubmitting={resolveMutation.isPending}
        errorMessage={resolveError}
        onConfirm={async (payload) => {
          setResolveError(null);
          await resolveMutation.mutateAsync(payload);
        }}
      />

      {complaint.status === 'open' ? (
        <Button
          size='sm'
          variant='outline'
          onClick={() => setOpenResolve(true)}
          disabled={resolveMutation.isPending}
        >
          Resolve
        </Button>
      ) : (
        <span className='text-muted-foreground text-sm'>Resolved</span>
      )}
    </>
  );
}
