'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/libs/api/client';
import {
  fetchCommunityFloodReportsPaged,
  hideCommunityFloodReport
} from '../api/community-report.api';
import type {
  CommunityFloodReport,
  CommunityFloodReportsQuery,
  CommunityReporterProfile
} from '../types/community-report.type';

const MODERATOR_REPORTS_QUERY_KEY = 'moderator-community-reports';

export function useModeratorCommunityReports(
  query: CommunityFloodReportsQuery
) {
  return useQuery({
    queryKey: [MODERATOR_REPORTS_QUERY_KEY, query],
    queryFn: () => fetchCommunityFloodReportsPaged(query)
  });
}

export function useHideCommunityReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => hideCommunityFloodReport(reportId),
    onSuccess: () => {
      toast.success('Đã ẩn bài phản ánh');
      queryClient.invalidateQueries({
        queryKey: [MODERATOR_REPORTS_QUERY_KEY]
      });
    },
    onError: (error: Error) => {
      toast.error('Ẩn bài thất bại', {
        description: error.message
      });
    }
  });
}

export function useCommunityReporterProfiles(items: CommunityFloodReport[]) {
  const reporterUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const report of items) {
      if (report.reporterUserId) {
        ids.add(String(report.reporterUserId));
      }
    }
    return Array.from(ids);
  }, [items]);

  return useQuery({
    queryKey: ['moderator-community-reporters', reporterUserIds.join(',')],
    enabled: reporterUserIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const normalizeUser = (raw: unknown): CommunityReporterProfile => {
        const root = (raw ?? {}) as Record<string, any>;
        const user = (root.user ?? root.data ?? root) as Record<string, any>;
        const name =
          user.fullName ??
          user.name ??
          user.userName ??
          user.username ??
          user.displayName;
        const email = user.email;

        return {
          name: typeof name === 'string' ? name : undefined,
          email: typeof email === 'string' ? email : undefined
        };
      };

      const entries = await Promise.all(
        reporterUserIds.map(async (id) => {
          try {
            const raw = await apiFetch<unknown>(`/users/${id}`, {
              method: 'GET'
            });
            return [id, normalizeUser(raw)] as const;
          } catch {
            return [id, {}] as const;
          }
        })
      );

      return new Map(entries);
    }
  });
}
