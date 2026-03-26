import {
  AlertTemplate,
  CreateAlertTemplatePayload,
  UpdateAlertTemplatePayload
} from '../types/alert-template.type';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fda.id.vn/api/v1';
const BASE_URL = `${API_BASE_URL}/admin/alert-templates`;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function fetchJson<T>(
  url: string,
  method: HttpMethod,
  body?: unknown,
  accessToken?: string
): Promise<T> {
  const hasBody = body !== undefined && body !== null;

  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export const alertTemplatesApi = {
  getTemplates: async (token?: string): Promise<AlertTemplate[]> => {
    const res = await fetchJson<{
      success: boolean;
      templates: AlertTemplate[];
    }>(BASE_URL, 'GET', undefined, token);
    return res.templates;
  },

  getTemplateById: async (
    id: string,
    token?: string
  ): Promise<AlertTemplate> => {
    const res = await fetchJson<{
      success: boolean;
      message: string;
      id: string;
      template: AlertTemplate;
    }>(`${BASE_URL}/${id}`, 'GET', undefined, token);
    return res.template;
  },

  createTemplate: async (data: CreateAlertTemplatePayload, token?: string) => {
    return fetchJson<{ success: boolean; message: string; id: string }>(
      BASE_URL,
      'POST',
      data,
      token
    );
  },

  updateTemplate: async (
    id: string,
    data: UpdateAlertTemplatePayload,
    token?: string
  ) => {
    return fetchJson<{ success: boolean; message: string }>(
      `${BASE_URL}/${id}`,
      'PUT',
      data,
      token
    );
  },

  deleteTemplate: async (id: string, token?: string) => {
    return fetchJson<{ success: boolean; message: string }>(
      `${BASE_URL}/${id}`,
      'DELETE',
      undefined,
      token
    );
  },

  previewTemplate: async (
    body: {
      templateId: string;
      titleTemplate: string;
      bodyTemplate: string;
      stationName?: string;
      waterLevel?: number;
      threshold?: number;
      severity?: string;
      address?: string;
    },
    token?: string
  ) => {
    const res = await fetchJson<{
      success: boolean;
      message: string;
      title: string;
      body: string;
    }>(`${BASE_URL}/preview`, 'POST', body, token);
    return { title: res.title, body: res.body };
  }
};
