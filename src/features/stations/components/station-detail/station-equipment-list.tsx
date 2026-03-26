// src/features/stations/components/station-detail/station-equipment-list.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Component } from '@/features/stations/types/station.type';
import {
  Cpu,
  Radio,
  Thermometer,
  Battery,
  Camera,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { ComponentCreateDialog } from './component-create-dialog';
import { ComponentEditDialog } from './component-edit-dialog';
import { ComponentDetailDialog } from './component-detail-dialog';
import { ComponentDeleteDialog } from './component-delete-dialog';

interface StationEquipmentListProps {
  stationId: string;
  components: Component[];
  onRefresh?: () => void;
}

function getComponentIcon(type: string) {
  switch (type) {
    case 'esp32':
      return Cpu;
    case 'srt04':
      return Radio;
    case 'temperature_sensor':
      return Thermometer;
    case 'battery':
      return Battery;
    default:
      return Camera;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant='outline'
          className='border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
        >
          Active
        </Badge>
      );
    case 'faulty':
      return (
        <Badge
          variant='outline'
          className='border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'
        >
          Faulty
        </Badge>
      );
    default:
      return (
        <Badge
          variant='outline'
          className='border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
        >
          Inactive
        </Badge>
      );
  }
}

export function StationEquipmentList({
  stationId,
  components,
  onRefresh
}: StationEquipmentListProps) {
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );

  const handleRowClick = (comp: Component) => {
    setSelectedComponent(comp);
    setDetailOpen(true);
  };

  const handleEdit = (comp: Component) => {
    setSelectedComponent(comp);
    setEditOpen(true);
  };

  const handleDelete = (comp: Component) => {
    setSelectedComponent(comp);
    setDeleteOpen(true);
  };

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <Card className='border-border bg-card'>
        <CardHeader className='flex flex-row items-center justify-between px-5 pt-5 pb-0'>
          <CardTitle className='text-foreground text-sm font-semibold'>
            Equipment Components
          </CardTitle>
          <Button
            variant='outline'
            size='sm'
            className='bg-primary text-primary-foreground hover:bg-primary/90 h-7 gap-1 text-xs'
            onClick={() => setCreateOpen(true)}
          >
            <Plus className='h-3.5 w-3.5' />
            Add
          </Button>
        </CardHeader>
        <CardContent className='p-5'>
          {components.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center justify-center py-8 text-center'>
              <Cpu className='mb-2 h-8 w-8 opacity-40' />
              <p className='text-sm'>No components yet</p>
              <p className='text-xs'>
                Click &quot;Add&quot; to add a hardware component.
              </p>
            </div>
          ) : (
            <ul className='max-h-[360px] space-y-2 overflow-y-auto pr-1'>
              {components.map((comp) => {
                const Icon = getComponentIcon(comp.componentType);
                return (
                  <li
                    key={comp.id}
                    className='hover:bg-muted/50 group flex cursor-pointer items-center justify-between rounded-lg p-2 transition'
                    onClick={() => handleRowClick(comp)}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded'>
                        <Icon className='h-5 w-5' />
                      </div>
                      <div>
                        <p className='text-foreground text-sm font-medium'>
                          {comp.name || comp.componentType}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {comp.model || comp.firmwareVersion || '-'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {/* Action buttons – visible on hover */}
                      <div className='flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(comp);
                          }}
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-destructive hover:bg-destructive/10 h-7 w-7'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(comp);
                          }}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                      {getStatusBadge(comp.status)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ComponentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        stationId={stationId}
        onSuccess={handleSuccess}
      />

      <ComponentEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        stationId={stationId}
        component={selectedComponent}
        onSuccess={handleSuccess}
      />

      <ComponentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        component={selectedComponent}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ComponentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        stationId={stationId}
        component={selectedComponent}
        onSuccess={handleSuccess}
      />
    </>
  );
}
