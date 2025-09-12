import useSWR from 'swr';
import { useUserInfo } from '@store/user';
import { request } from '@utils/axios';
import { VIPInfo } from './types';

export function useVipInfo() {
  const { id } = useUserInfo().data;
  return useSWR(['vip-info', id], () => request.get<VIPInfo>('/api/account/vip/level/info'), { suspense: true });
}
