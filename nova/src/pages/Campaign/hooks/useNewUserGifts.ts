import { useMemo } from 'react';
import useSWR from 'swr';
import { useUserInfo } from '@store/user';
import { getServerTime } from '@utils';
import { request } from '@utils/axios';

export enum ParticipantType {
  Deposit = 'deposit',
  Invited = 'invited',
  Trade = 'trade',
}
export enum ActivityStatus {
  NotCompleted = 'NotCompleted',
  Completed = 'Completed',
  Processing = 'Processing',
  Expired = 'Expired',
}

export type ParticipantItemDetail = {
  progress: string;
  status: ActivityStatus;
};

export interface ParticipantItem {
  activityDescription: string;
  activityId: number;
  activityName: string;
  activityType: ParticipantType;
  details: ParticipantItemDetail;
  openId: string;
  platformName: string;
  userId: number;
}

export function useNewUserGiftsActive() {
  const { createTime } = useUserInfo().data;
  // 注册一个月内
  const createMoreThanMonth = useMemo(
    () => getServerTime() - new Date(createTime).getTime() < 30 * 24 * 3600 * 1000,
    [createTime]
  );
  return createMoreThanMonth;
}

// 活动列表、参与情况
export function useNewUserParticipant() {
  return useSWR(
    '/api/promotion/activity/participant',
    () => {
      return request.get<{ items: ParticipantItem[]; total: number }>('/api/promotion/activity/participant');
    },
    { suspense: true }
  );
}
