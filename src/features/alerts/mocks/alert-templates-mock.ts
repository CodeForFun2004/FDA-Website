import {
  AlertTemplate,
  CreateAlertTemplatePayload,
  UpdateAlertTemplatePayload
} from '../types/alert-template.type';

// Initial Mock Data
let mockTemplates: AlertTemplate[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Critical Push Notification',
    channel: 'Push',
    severity: 'critical',
    titleTemplate: '⚠️ Cảnh báo ngập lụt nghiêm trọng - {{station_name}}',
    bodyTemplate:
      'Mức nước tại {{station_name}} đã đạt {{water_level}} lúc {{time}}. Vượt ngưỡng {{threshold}}m. Vui lòng kiểm tra ngay!',
    isActive: true,
    sortOrder: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Warning Email Template',
    channel: 'Email',
    severity: 'warning',
    titleTemplate: 'Cảnh báo ngập lụt - {{station_name}}',
    bodyTemplate:
      'Kính gửi quý khách,\n\nMức nước tại {{station_name}} đã đạt {{water_level}}.',
    isActive: true,
    sortOrder: 2,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAlertTemplatesMock = async (): Promise<AlertTemplate[]> => {
  await delay(500);
  return [...mockTemplates].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAlertTemplateByIdMock = async (
  id: string
): Promise<AlertTemplate> => {
  await delay(300);
  const template = mockTemplates.find((t) => t.id === id);
  if (!template) throw new Error('Alert template not found');
  return template;
};

export const createAlertTemplateMock = async (
  data: CreateAlertTemplatePayload
): Promise<{ success: boolean; message: string; id: string }> => {
  await delay(500);
  const newId = crypto.randomUUID();
  const newTemplate: AlertTemplate = {
    ...data,
    id: newId,
    channel: data.channel as any,
    severity: (data.severity as any) || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockTemplates.push(newTemplate);
  return {
    success: true,
    message: 'Alert template created successfully',
    id: newId
  };
};

export const updateAlertTemplateMock = async (
  id: string,
  data: UpdateAlertTemplatePayload
): Promise<{ success: boolean; message: string }> => {
  await delay(500);
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Alert template not found');

  mockTemplates[index] = {
    ...mockTemplates[index],
    ...data,
    channel: data.channel as any,
    severity: (data.severity as any) || null,
    updatedAt: new Date().toISOString()
  };

  return { success: true, message: 'Alert template updated successfully' };
};

export const deleteAlertTemplateMock = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  await delay(500);
  const initialLength = mockTemplates.length;
  mockTemplates = mockTemplates.filter((t) => t.id !== id);
  if (mockTemplates.length === initialLength)
    throw new Error('Alert template not found');

  return { success: true, message: 'Alert template deleted successfully' };
};

export const previewAlertTemplateMock = async (
  id: string,
  previewData: Record<string, any>
): Promise<{ title: string; body: string }> => {
  await delay(300);
  const template = mockTemplates.find((t) => t.id === id);
  if (!template) throw new Error('Alert template not found');

  let title = template.titleTemplate;
  let body = template.bodyTemplate;

  const replaceVars = (text: string) => {
    return text.replace(/{{([^}]+)}}/g, (match, p1) => {
      const key = p1.trim();
      // map variable names to mockup keys
      const val =
        previewData[key] !== undefined
          ? previewData[key]
          : (previewData as any)[snakeToCamel(key)];
      return val !== undefined ? String(val) : match;
    });
  };

  const snakeToCamel = (str: string) =>
    str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );

  return {
    title: replaceVars(title),
    body: replaceVars(body)
  };
};
