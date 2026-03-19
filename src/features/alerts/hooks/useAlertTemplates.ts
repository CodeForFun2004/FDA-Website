import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertTemplatesApi } from '../api/alert-templates.api';
import {
  CreateAlertTemplatePayload,
  UpdateAlertTemplatePayload
} from '../types/alert-template.type';

export const ALERT_TEMPLATES_KEY = ['alert-templates'];

export const useAlertTemplates = (token?: string) => {
  return useQuery({
    queryKey: ALERT_TEMPLATES_KEY,
    queryFn: () => alertTemplatesApi.getTemplates(token)
  });
};

export const useAlertTemplate = (id: string, token?: string) => {
  return useQuery({
    queryKey: [...ALERT_TEMPLATES_KEY, id],
    queryFn: () => alertTemplatesApi.getTemplateById(id, token),
    enabled: !!id
  });
};

export const useCreateAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      token
    }: {
      data: CreateAlertTemplatePayload;
      token?: string;
    }) => alertTemplatesApi.createTemplate(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
    }
  });
};

export const useUpdateAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      token
    }: {
      id: string;
      data: UpdateAlertTemplatePayload;
      token?: string;
    }) => alertTemplatesApi.updateTemplate(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALERT_TEMPLATES_KEY, id] });
    }
  });
};

export const useDeleteAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      alertTemplatesApi.deleteTemplate(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
    }
  });
};

export const usePreviewAlertTemplate = () => {
  return useMutation({
    mutationFn: ({
      id,
      previewData,
      token
    }: {
      id: string;
      previewData: Record<string, any>;
      token?: string;
    }) => alertTemplatesApi.previewTemplate(id, previewData, token)
  });
};
