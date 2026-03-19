import {
  AlertTemplate,
  CreateAlertTemplatePayload,
  UpdateAlertTemplatePayload
} from '../types/alert-template.type';
import {
  getAlertTemplatesMock,
  getAlertTemplateByIdMock,
  createAlertTemplateMock,
  updateAlertTemplateMock,
  deleteAlertTemplateMock,
  previewAlertTemplateMock
} from '../mocks/alert-templates-mock';

// Change this boolean to switch to real API calls when the backend is ready
const USE_MOCK = true;

// Define base URL for real API
// const BASE_URL = '/api/v1/admin/alert-templates';

export const alertTemplatesApi = {
  getTemplates: async (token?: string): Promise<AlertTemplate[]> => {
    if (USE_MOCK) return getAlertTemplatesMock();
    // Real implementation goes here
    throw new Error('Real API not implemented yet');
  },

  getTemplateById: async (
    id: string,
    token?: string
  ): Promise<AlertTemplate> => {
    if (USE_MOCK) return getAlertTemplateByIdMock(id);
    throw new Error('Real API not implemented yet');
  },

  createTemplate: async (data: CreateAlertTemplatePayload, token?: string) => {
    if (USE_MOCK) return createAlertTemplateMock(data);
    throw new Error('Real API not implemented yet');
  },

  updateTemplate: async (
    id: string,
    data: UpdateAlertTemplatePayload,
    token?: string
  ) => {
    if (USE_MOCK) return updateAlertTemplateMock(id, data);
    throw new Error('Real API not implemented yet');
  },

  deleteTemplate: async (id: string, token?: string) => {
    if (USE_MOCK) return deleteAlertTemplateMock(id);
    throw new Error('Real API not implemented yet');
  },

  previewTemplate: async (
    id: string,
    previewData: Record<string, any>,
    token?: string
  ) => {
    if (USE_MOCK) return previewAlertTemplateMock(id, previewData);
    throw new Error('Real API not implemented yet');
  }
};
