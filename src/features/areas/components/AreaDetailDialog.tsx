'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { areasApi } from '../api/area.api';
import { getAccessToken } from '@/features/stations/utils/auth';
import { useEffect, useState } from 'react';
import type { AreaDetail } from '../types/area.type';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  areaId: string;
};

export function AreaDetailDialog({ open, onOpenChange, areaId }: Props) {
  const [data, setData] = useState<AreaDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchDetail = async () => {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const res = await areasApi.getAreaById(areaId, token);
      setData(res.data);
      setLoading(false);
    };

    fetchDetail();
  }, [open, areaId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Area detail</DialogTitle>
        </DialogHeader>

        {loading || !data ? (
          <div className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        ) : (
          <div className='space-y-2 text-sm'>
            <div>
              <b>Name:</b> {data.name}
            </div>
            <div>
              <b>Address:</b> {data.addressText}
            </div>
            <div>
              <b>Latitude:</b> {data.latitude}
            </div>
            <div>
              <b>Longitude:</b> {data.longitude}
            </div>
            <div>
              <b>Radius:</b> {data.radiusMeters} m
            </div>
            <div>
              <b>Created:</b> {new Date(data.createdAt).toLocaleString()}
            </div>
            <div>
              <b>Updated:</b> {new Date(data.updatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
