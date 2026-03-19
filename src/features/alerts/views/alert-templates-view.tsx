'use client';

import React, { useState, useEffect } from 'react';
import { useAlertTemplates } from '../hooks/useAlertTemplates';
import { LoadingState } from '@/components/ui/common';
import { AlertTemplatesTable } from '../components/alert-templates';
import { columns } from '../components/alert-templates/columns';
import { AlertTemplateDialog } from '../components/alert-templates/alert-template-dialog';
import { AlertTemplatePreviewDialog } from '../components/alert-templates/alert-template-preview-dialog';
import { AlertTemplate } from '../types/alert-template.type';

export function AlertTemplatesView() {
  const { data: templates, isLoading } = useAlertTemplates();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AlertTemplate | null>(null);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<AlertTemplate | null>(
    null
  );

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent<AlertTemplate>;
      setSelectedTemplate(customEvent.detail);
      setCreateDialogOpen(true);
    };

    const handlePreview = (e: Event) => {
      const customEvent = e as CustomEvent<AlertTemplate>;
      setPreviewTemplate(customEvent.detail);
      setPreviewDialogOpen(true);
    };

    document.addEventListener('edit-alert-template', handleEdit);
    document.addEventListener('preview-alert-template', handlePreview);

    return () => {
      document.removeEventListener('edit-alert-template', handleEdit);
      document.removeEventListener('preview-alert-template', handlePreview);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedTemplate(null), 200);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className='space-y-6'>
      <AlertTemplatesTable
        data={templates || []}
        totalItems={templates?.length || 0}
        columns={columns}
        onOpenCreate={() => setCreateDialogOpen(true)}
      />

      <AlertTemplateDialog
        open={createDialogOpen}
        onOpenChange={handleOpenChange}
        template={selectedTemplate}
      />

      <AlertTemplatePreviewDialog
        open={previewDialogOpen}
        onOpenChange={(open) => {
          setPreviewDialogOpen(open);
          if (!open) setTimeout(() => setPreviewTemplate(null), 200);
        }}
        template={previewTemplate}
      />
    </div>
  );
}
