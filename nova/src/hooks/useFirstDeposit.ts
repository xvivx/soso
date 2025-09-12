import { useMemo } from 'react';
import { useUserInfo } from '@store/user';
import { useTotalLocaleAmount } from '@store/wallet';
import { getServerTime } from '@utils';

export default function useFirstDeposit() {
  const assetsAmount = useTotalLocaleAmount();
  const { createTime } = useUserInfo().data;
  // 首充逻辑, 注册一周内, 余额为0
  const createMoreThanWeek = useMemo(
    () => getServerTime() - new Date(createTime).getTime() < 7 * 24 * 3600 * 1000,
    [createTime]
  );
  return assetsAmount === 0 && createMoreThanWeek;
}
