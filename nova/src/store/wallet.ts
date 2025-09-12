import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import useSWR, { mutate } from 'swr';
import { request } from '@utils';
import { getCoinUrl } from '@utils/others';
import bridge from './bridge';
import { useLocalCurrency } from './system';
import { useOnMessage } from './ws';

export enum AccountType {
  DEMO = 0,
  REAL = 1,
}

interface AccountItem {
  accountBalanceList: {
    currency: string;
    quantity: number;
    name: string;
  }[];
  accountId: number;
  type: AccountType;
}

interface AccountState {
  type: AccountType;
  currency: string;
}

const initialState: AccountState = {
  type: AccountType.DEMO, // 当前账户类型
  currency: 'USDT', // 当前下单币种
};

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    changeAccountType(state, action: PayloadAction<AccountType>) {
      state.type = action.payload;
    },
  },
});

export const { changeAccountType, setCurrency } = slice.actions;
export default slice.reducer;

export function useUpdateWalletBalance() {
  useOnMessage((message) => {
    if (message.cmd === '/account/balanceChange') {
      mutate(
        (key: string[]) => key && key[0] === 'wallet-assets-list',
        () => formatAccounts(message.resp),
        false
      );
    }
  });
}

const currencySelector = createSelector(
  (state: StoreState) => state.account.currency,
  (currency) => ({
    name: currency,
    logo: currency ? getCoinUrl(currency) : '',
  })
);
// 获取当前下单币种
export const useCurrency = () => {
  return useSelector(currencySelector);
};

export const useAllAssetsWithLocaleAmount = () => {
  const assets = useAllAssets();
  const exchanges = useExchanges();
  const currency = useLocalCurrency();

  return useMemo(() => {
    return assets.map((asset) => {
      const currencyExchange = exchanges[asset.currency];
      const localeExchange = exchanges[currency];
      return {
        ...asset,
        // exchange: exchange,
        localeAmount: (asset.amount * currencyExchange) / localeExchange,
      };
    });
  }, [assets, exchanges, currency]);
};

export type CurrencyAsset = ReturnType<typeof useAllAssetsWithLocaleAmount>[number];

export const useRealAssetsWithLocaleAmount = () => {
  const assets = useAllAssetsWithLocaleAmount();
  return useMemo(() => assets.filter((asset) => asset.type === AccountType.REAL), [assets]);
};
export const useRealAssets = () => {
  const assets = useAllAssets();
  return useMemo(() => assets.filter((asset) => asset.type === AccountType.REAL), [assets]);
};

export const useActiveAsset = () => {
  const currency = useSelector((state) => state.account.currency);
  const accountType = useSelector((state) => state.account.type);
  const assets = useAllAssets();
  return useMemo(
    () =>
      assets.find((asset) => asset.type === accountType && asset.currency === currency) || {
        currency,
        amount: 0,
        name: currency,
        type: accountType,
      },
    [assets, accountType, currency]
  );
};

// 三方平台拿不到余额, 设置成无穷大, 绕开余额不足的校验
export const useBalance = bridge.get().micro ? () => Infinity : () => useActiveAsset().amount;

function formatAccounts(accounts: AccountItem[]) {
  return accounts.flatMap((account) => {
    return account.accountBalanceList.map((asset) => {
      return {
        type: account.type,
        name: asset.name,
        currency: asset.currency,
        amount: asset.quantity,
      };
    });
  });
}

function useAllAssets() {
  const token = useSelector((state) => state.user.token);
  return useSWR(
    !bridge.get().micro && token ? ['wallet-assets-list', token] : null,
    async () => {
      const accounts = await request.get<AccountItem[]>(`/api/account/account/list`);
      return formatAccounts(accounts);
    },
    {
      suspense: true,
    }
  ).data;
}

export function useAccountType() {
  return useSelector((state: StoreState) => state.account.type);
}

export function useSupportList() {
  return useSWR(
    ['fiat-list'],
    async () => {
      return await request.get<Fiat[]>('/api/account/fiat/payment/currency/list');
    },
    { fallbackData: [] }
  );
}

export type Fiat = {
  currency: string;
  fullName: string;
};

type Method = {
  category: string;
  channelId: number;
  displayName: string;
  expiredTime: number;
  feeFixed: number;
  feePercent: number;
  icon: string;
  kycRequirement: number;
  maxLimit: number;
  minLimit: number;
  transactionType: 1;
};

export function useFiatMethods(type: 'deposit' | 'withdraw', currency?: string) {
  return useSWR(
    currency ? ['fiat-method', type, currency] : null,
    async ([_, type, currency]: string[]) => {
      const categories = await request.get<Record<string, Method[]>>(
        `/api/account/fiat/payment/${type}/methods?currency=${currency}`
      );
      return Object.values(categories).flatMap((item) => item.map((method) => ({ ...method, currency })));
    },
    { fallbackData: [], keepPreviousData: Boolean(currency) }
  );
}

export type FormField = {
  label: string;
  commonKey: string;
  hide: boolean;
  readOnly: boolean;
  validPatterns: {
    validMessage: string;
    validRule: string;
  }[];
} & (
  | { type: 'select'; options: string[] }
  | {
      type: 'map_select';
      mapOptions: [string, string][];
    }
  | { type: 'email' }
);

export function useFiatMethodForm(type: 'deposit' | 'withdraw', currency?: string, channelId?: number) {
  const fallbackData = useMemo(() => [], []);
  return useSWR(
    currency && channelId ? ['fiat-form', type, currency, channelId] : null,
    async ([_, type, currency, channelId]: string[]) => {
      const fields = await request.get<FormField[] | null>(
        `/api/account/fiat/payment/${type}/confirm/form?currency=${currency}&channelId=${channelId}`
      );
      return fields || fallbackData;
    },
    { fallbackData, keepPreviousData: Boolean(currency && channelId) }
  );
}

// 真实账户总资产
export function useTotalLocaleAmount() {
  const assets = useRealAssetsWithLocaleAmount();
  return useMemo(() => assets.reduce((total, next) => total + next.localeAmount, 0), [assets]);
}

// Demo账户资产
export function useDemoAmount() {
  const assets = useAllAssetsWithLocaleAmount();
  return useMemo(() => {
    const asset = assets.find((asset) => asset.type === AccountType.DEMO);
    return asset?.localeAmount || 0;
  }, [assets]);
}

export function useExchanges() {
  return useSWR(
    ['exchange-rate-all'],
    async () => {
      const exchanges = await request.get<{ rate: string; currency: string }[]>(`/api/account/exchange/rate/all`);
      return exchanges.reduce(
        (rates, item) => {
          const [currency] = item.currency.split('-');
          const rate = Number(item.rate);
          rates[currency] = rate;
          precisions[currency] = calcRatePrecision(rate);
          return rates;
        },
        { USDFIAT: 1 } as Record<string, number>
      );
    },
    {
      refreshInterval: 30 * 1000,
      suspense: true,
    }
  ).data;
}

export function useCurrencyExchange() {
  const exchanges = useExchanges();
  const currency = useCurrency();
  return exchanges[currency.name];
}

export const precisions: Record<string, number> = {};

function calcRatePrecision(rate: number): number {
  if (rate >= 1000) return 5;
  if (rate >= 100) return 4;
  if (rate >= 10) return 3;
  if (rate >= 1) return 2;
  if (rate >= 0.1) return 1;
  return 0;
}
