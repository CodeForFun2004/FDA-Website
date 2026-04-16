import type {
  OperationalLogCategory,
  OperationalLogLevel
} from './operational-log-filters.type';

export type ApiWrapper<T> = {
  success: boolean;
  message?: string;
  statusCode?: number;
  data: T;
};

export type PaginatedData<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type OperationalLogListItem = {
  id: string;
  category: OperationalLogCategory;
  action: string;
  level: OperationalLogLevel;
  userId?: string | null;
  userName?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  ipAddress?: string | null;
  details?: unknown;
  errorMessage?: string | null;
  createdAt: string; // ISO
};

export type OperationalLogDetail = OperationalLogListItem & {
  // backend có thể trả thêm fields; FE giữ mở rộng an toàn
  [k: string]: unknown;
};

export type OperationalLogDetailResult =
  | { notFound: true }
  | { notFound: false; data: OperationalLogDetail };
