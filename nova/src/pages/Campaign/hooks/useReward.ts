import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { request } from '@utils/axios';

export interface RewardRecordItem {
  amount: number;
  id: number;
  time: number;
  type: string;
}

export function useRewardAmount() {
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  useEffect(() => {
    const fetchRewardAmount = async () => {
      const res = await request.get<number>('/api/promotion/activity/reward/amount');
      setRewardAmount(res);
    };
    fetchRewardAmount();
  }, []);

  return rewardAmount;
}

export function useRewardRecord(filters: { page: number; pageSize: number }) {
  return useSWR(
    ['reward-record', filters],
    async ([_, filters]) => {
      return await request.get<{ items: RewardRecordItem[]; total: number }>(
        '/api/promotion/activity/reward/record',
        filters
      );
    },
    { fallbackData: { items: [], total: 0 } }
  );
}
