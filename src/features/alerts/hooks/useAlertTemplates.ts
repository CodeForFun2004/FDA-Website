import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertTemplatesApi } from '../api/alert-templates.api';
import {
  CreateAlertTemplatePayload,
  UpdateAlertTemplatePayload
} from '../types/alert-template.type';
import { getAccessToken } from '@/libs/auth-utils';

export const ALERT_TEMPLATES_KEY = ['alert-templates'];

export const useAlertTemplates = () => {
  return useQuery({
    queryKey: ALERT_TEMPLATES_KEY,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.getTemplates(token);
    }
  });
};

export const useAlertTemplate = (id: string) => {
  return useQuery({
    queryKey: [...ALERT_TEMPLATES_KEY, id],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.getTemplateById(id, token);
    },
    enabled: !!id
  });
};

export const useCreateAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: CreateAlertTemplatePayload }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.createTemplate(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
    }
  });
};

export const useUpdateAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: UpdateAlertTemplatePayload;
    }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.updateTemplate(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALERT_TEMPLATES_KEY, id] });
    }
  });
};

export const useDeleteAlertTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.deleteTemplate(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_TEMPLATES_KEY });
    }
  });
};

export const usePreviewAlertTemplate = () => {
  return useMutation({
    mutationFn: async (body: {
      templateId: string;
      titleTemplate: string;
      bodyTemplate: string;
      stationName?: string;
      waterLevel?: number;
      threshold?: number;
      severity?: string;
      address?: string;
    }) => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      return alertTemplatesApi.previewTemplate(body, token);
    }
  });
};
