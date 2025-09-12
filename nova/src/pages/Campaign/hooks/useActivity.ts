/**
 * 获取活动基本信息, 包含airdrop、daily、weekly
 */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { request } from '@utils/axios';

interface ActivityDetail {
  banner: string;
  description: string;
  endTime: number;
  id: number;
  name: string;
  rule: string;
  startTime: number;
}

interface ActivityInfo {
  endTime: number;
  id: number;
  name: string;
  startTime: number;
  currentCount: number; // 已发送券数量
  prizePool: number; // 奖金池金额
  ticketQuota: number; // 获得券的门槛
  quota: number; // 前xx名获奖
}

function useActivity(type: 'airdrop' | 'daily' | 'weekly') {
  const [activity, setActivity] = useState<ActivityInfo>({
    endTime: 0,
    id: 0,
    name: '',
    startTime: 0,
    currentCount: 0,
    prizePool: 0,
    ticketQuota: 0,
    quota: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await request.get<ActivityInfo>('/api/promotion/activity/info', { type });
        // 活动信息为null则使用默认数据
        if (res) {
          setActivity(res);
        }
      } catch (error) {
        console.error('Failed to fetch activity info:', error);
      }
    };
    fetchData();
  }, [type]);

  return activity;
}

export function useActivityDetail(id: string) {
  const language = useSelector((state) => state.system.lang);
  return useSWR(['activity-detail', id, language], async ([_, id]) => {
    return await request.get<ActivityDetail>(`/api/promotion/activity/detail`, {
      id,
    });
  });
}

export default useActivity;
