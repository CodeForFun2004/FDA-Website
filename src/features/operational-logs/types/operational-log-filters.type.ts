export type OperationalLogLevel = 'info' | 'warning' | 'error';

export type OperationalLogCategory =
  | 'system'
  | 'alert'
  | 'sensor'
  | 'moderation'
  | (string & {});

export type OperationalLogOrderBy =
  | 'CreatedAt'
  | 'Action'
  | 'Category'
  | 'Level'
  | (string & {});

export type OperationalLogsQueryParams = {
  category?: OperationalLogCategory;
  action?: string;
  level?: OperationalLogLevel;
  userId?: string;
  entityId?: string;
  entityType?: string;
  fromDate?: string; // ISO UTC
  toDate?: string; // ISO UTC
  searchText?: string;
  page?: number;
  pageSize?: number;
  orderBy?: OperationalLogOrderBy;
  orderDescending?: boolean;
};
