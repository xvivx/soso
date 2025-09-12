import useSWR from 'swr';
import { request } from '@utils/axios';

export type Sort = 'COUNTS' | 'PNL' | 'ROI' | 'VOLUME' | 'WIN_RATE';

export interface LeaderboardParams {
  currencies?: string;
  page: number;
  pageSize: number;
  sort: Sort;
  timeRange?: number;
}

export interface LeaderboardItem {
  userId: number;
  avatar: string;
  name: string;
  pnl: number;
  rank: number;
  roi: number;
  topTokens: { currency: string; logo: string }[];
  topTrade: string;
  totalAssets: number;
  totalTrades: number;
  volume: number;
  winRate: number;
  privateHide: boolean;
}

export function useLeaderboard(params: LeaderboardParams) {
  return useSWR(
    ['leaderboard-rank-list', params],
    async ([_, params]) => {
      return await request.get<{ items: LeaderboardItem[]; total: number }>('/api/statistic/leaderboard/rank', params);
    },
    { fallbackData: { items: [], total: 0 }, keepPreviousData: true }
  );
}
