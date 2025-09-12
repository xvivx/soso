/**
 * 币种/法币充值的搜索历史
 */

import { useMemo, useState } from 'react';

interface SearchHistoryItem {
  logoUrl: string;
  value: string;
  label?: string;
}

type HistoryCacheKey = 'depositHistory' | 'fiatDepositHistory';

/** 目前只保留三条记录 */

const maximumHistoryCount = 3;

export default function useSearchHistory<T>({
  values,
  filter,
  cacheKey = 'depositHistory',
}: {
  values: T[];
  filter: (searchHistoryCaches: string[], values: T[]) => SearchHistoryItem[];
  cacheKey?: HistoryCacheKey;
}) {
  const [searchHistoryCaches, setSearchHistoryCaches] = useState(() => {
    try {
      const _caches = localStorage.getItem(cacheKey);
      return _caches ? _caches.split('_') : [];
    } catch {
      return [];
    }
  });

  const searchHistories = useMemo(() => {
    /** 本地缓存只保存用户选择的symbol，通过symbol在cryptos列表中进行检索 */
    if (!searchHistoryCaches.length) return [];
    return filter(searchHistoryCaches, values);
  }, [searchHistoryCaches, values, filter]);

  const onHistoryCancel = () => {
    localStorage.removeItem(cacheKey);
    setSearchHistoryCaches([]);
  };

  const onHistoryUpdate = (value: string) => {
    if (!searchHistoryCaches.includes(value)) {
      setSearchHistoryCaches((prevHistories) => {
        let newHistories = [...prevHistories];
        if (newHistories.length === maximumHistoryCount) {
          newHistories.pop();
        }
        newHistories = [value, ...newHistories];
        newHistories.length && localStorage.setItem(cacheKey, newHistories.join('_'));
        return newHistories;
      });
    }
  };
  return {
    searchHistories,
    onHistoryCancel,
    onHistoryUpdate,
  };
}
