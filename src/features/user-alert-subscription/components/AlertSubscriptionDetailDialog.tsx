'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import type { AlertSubscription } from '../types/alert-subscription.type';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  Mail,
  MessageSquare,
  MapPin,
  AlertTriangle,
  AlertCircle,
  User,
  Phone
} from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subscriptionData: AlertSubscription;
};

export function AlertSubscriptionDetailDialog({
  open,
  onOpenChange,
  subscriptionData
}: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simulate loading for a brief moment to show the transition
      const timer = setTimeout(() => setLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'caution':
        return <AlertCircle className='h-4 w-4 text-blue-500' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'critical':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Alert Subscription Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            {/* User Information */}
            <div className='space-y-2'>
              <h4 className='flex items-center gap-2 text-base font-semibold'>
                <User className='h-4 w-4' />
                User Information
              </h4>
              <div className='space-y-1 pl-6'>
                <div>
                  <b>Email:</b> {subscriptionData.userEmail}
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-3 w-3' />
                  <span>
                    <b>Phone:</b> {subscriptionData.userPhone}
                  </span>
                </div>
                <div>
                  <b>User ID:</b> {subscriptionData.userId}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className='space-y-2'>
              <h4 className='flex items-center gap-2 text-base font-semibold'>
                <MapPin className='h-4 w-4' />
                Location
              </h4>
              <div className='space-y-1 pl-6'>
                {subscriptionData.areaName && (
                  <div>
                    <b>Area:</b> {subscriptionData.areaName}
                  </div>
                )}
                {subscriptionData.stationName && (
                  <div>
                    <b>Station:</b> {subscriptionData.stationName}
                  </div>
                )}
                {!subscriptionData.areaName &&
                  !subscriptionData.stationName && (
                    <div className='text-muted-foreground'>
                      No specific location
                    </div>
                  )}
                {subscriptionData.areaId && (
                  <div>
                    <b>Area ID:</b> {subscriptionData.areaId}
                  </div>
                )}
                {subscriptionData.stationId && (
                  <div>
                    <b>Station ID:</b> {subscriptionData.stationId}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Configuration */}
            <div className='space-y-2'>
              <h4 className='flex items-center gap-2 text-base font-semibold'>
                <AlertTriangle className='h-4 w-4' />
                Alert Configuration
              </h4>
              <div className='space-y-2 pl-6'>
                <div className='flex items-center gap-2'>
                  <span>
                    <b>Minimum Severity:</b>
                  </span>
                  <Badge variant='outline' className='flex items-center gap-1'>
                    {getSeverityIcon(subscriptionData.minSeverity)}
                    {subscriptionData.minSeverity.charAt(0).toUpperCase() +
                      subscriptionData.minSeverity.slice(1)}
                  </Badge>
                </div>

                <div>
                  <b>Notification Channels:</b>
                  <div className='mt-1 flex gap-2'>
                    {subscriptionData.enablePush && (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1'
                      >
                        <Bell className='h-3 w-3' />
                        Push
                      </Badge>
                    )}
                    {subscriptionData.enableEmail && (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1'
                      >
                        <Mail className='h-3 w-3' />
                        Email
                      </Badge>
                    )}
                    {subscriptionData.enableSms && (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1'
                      >
                        <MessageSquare className='h-3 w-3' />
                        SMS
                      </Badge>
                    )}
                    {!subscriptionData.enablePush &&
                      !subscriptionData.enableEmail &&
                      !subscriptionData.enableSms && (
                        <span className='text-muted-foreground'>
                          None enabled
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className='space-y-2'>
              <h4 className='text-base font-semibold'>Metadata</h4>
              <div className='space-y-1 pl-6'>
                <div>
                  <b>Subscription ID:</b> {subscriptionData.subscriptionId}
                </div>
                <div>
                  <b>Created:</b> {formatDate(subscriptionData.createdAt)}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
