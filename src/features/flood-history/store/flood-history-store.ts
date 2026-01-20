'use client';

import { create } from 'zustand';
import {
  getFloodHistoryApi,
  getFloodStatisticsApi,
  getFloodTrendsApi
} from '../api/flood-history.api';
import type {
  FloodHistoryDto,
  FloodStatisticsDto,
  FloodTrendDto,
  GetFloodHistoryParams,
  GetFloodStatisticsParams,
  GetFloodTrendsParams
} from '../types/flood-history.type';

export type FloodHistoryStatus = 'idle' | 'loading' | 'success' | 'error';

type FloodHistoryState = {
  status: FloodHistoryStatus;
  trendData: FloodTrendDto | null;
  historyData: FloodHistoryDto[];
  statistics: FloodStatisticsDto[];
  error: string | null;

  fetchTrends: (params: GetFloodTrendsParams) => Promise<void>;
  fetchHistory: (params: GetFloodHistoryParams) => Promise<void>;
  fetchStatistics: (params: GetFloodStatisticsParams) => Promise<void>;

  clearError: () => void;
  reset: () => void;
};

const initialState = {
  status: 'idle' as FloodHistoryStatus,
  trendData: null as FloodTrendDto | null,
  historyData: [] as FloodHistoryDto[],
  statistics: [] as FloodStatisticsDto[],
  error: null as string | null
};

export const useFloodHistoryStore = create<FloodHistoryState>()((set) => ({
  ...initialState,

  fetchTrends: async (params) => {
    set({ status: 'loading', error: null });

    try {
      const res = await getFloodTrendsApi(params);

      if (!res.success) {
        set({
          status: 'error',
          error: res.message || 'Failed to fetch flood trends'
        });
        return;
      }

      set({
        status: 'success',
        trendData: res.data,
        error: null
      });
    } catch (error: any) {
      set({
        status: 'error',
        trendData: null,
        error: error?.message ?? 'Failed to fetch flood trends'
      });
      throw error;
    }
  },

  fetchHistory: async (params) => {
    set({ status: 'loading', error: null });

    try {
      const res = await getFloodHistoryApi(params);

      if (!res.success) {
        set({
          status: 'error',
          error: res.message || 'Failed to fetch flood history'
        });
        return;
      }

      const items = Array.isArray(res.data) ? res.data : [res.data];

      set({
        status: 'success',
        historyData: items,
        error: null
      });
    } catch (error: any) {
      set({
        status: 'error',
        historyData: [],
        error: error?.message ?? 'Failed to fetch flood history'
      });
      throw error;
    }
  },

  fetchStatistics: async (params) => {
    set({ status: 'loading', error: null });

    try {
      const res = await getFloodStatisticsApi(params);

      if (!res.success) {
        set({
          status: 'error',
          error: res.message || 'Failed to fetch flood statistics'
        });
        return;
      }

      const items = Array.isArray(res.data) ? res.data : [res.data];

      set({
        status: 'success',
        statistics: items,
        error: null
      });
    } catch (error: any) {
      set({
        status: 'error',
        statistics: [],
        error: error?.message ?? 'Failed to fetch flood statistics'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState)
}));
