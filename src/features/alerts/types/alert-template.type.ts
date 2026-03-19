export interface AlertTemplate {
  id: string;
  name: string;
  channel: 'Push' | 'Email' | 'SMS' | 'InApp';
  severity: 'info' | 'caution' | 'warning' | 'critical' | null;
  titleTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAlertTemplatePayload {
  name: string;
  channel: string;
  severity?: string | null;
  titleTemplate: string;
  bodyTemplate: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateAlertTemplatePayload
  extends CreateAlertTemplatePayload {}
