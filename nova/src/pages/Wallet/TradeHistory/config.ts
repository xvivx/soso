import { useTranslation } from 'react-i18next';
import { TimeRange } from '../common';

export interface BetHistoryParams {
  profit?: ProfitType;
  currency: string;
  page: number;
  pageSize: number;
  timeRange: TimeRange;
  bizType?: BizType;
}

export enum ShowType {
  All = 0,
  HighLow = 1,
  Leverage = 2,
  UpDown = 3,
  TradingCost = 4,
  HighLowSpread = 6,
}

export enum BizType {
  All = '',
  BINARY_ORDER = 'BINARY_ORDER',
  BINARY_SPREAD_ORDER = 'BINARY_SPREAD_ORDER',
  CONTRACT_ORDER = 'CONTRACT_ORDER',
  CONTRACT_ENTRUST_ORDER = 'CONTRACT_ENTRUST_ORDER',
  CONTEST_ORDER = 'CONTEST_ORDER',
  TAP_ORDER = 'TAP_ORDER',
}

export const useShowTypeOptions = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('High Low'),
      value: BizType.BINARY_ORDER,
    },
    {
      label: t('Spread'),
      value: BizType.BINARY_SPREAD_ORDER,
    },
    {
      label: t('Futures'),
      value: BizType.CONTRACT_ORDER,
    },
    {
      label: t('Futures Entrust'),
      value: BizType.CONTRACT_ENTRUST_ORDER,
    },
    {
      label: t('Up Down'),
      value: BizType.CONTEST_ORDER,
    },
    {
      label: t('Tap Trading'),
      value: BizType.TAP_ORDER,
    },
  ];
};

export enum ProfitType {
  Income = 1,
  Outflow = -1,
}

export const useProfitTypeOptions = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('Income'),
      value: ProfitType.Income,
    },
    {
      label: t('Outflow'),
      value: ProfitType.Outflow,
    },
  ];
};

export interface BetHistoryItem {
  id: number;
  bizId: string;
  userId: number;
  currency: string;
  source: string;
  changeAmount: number;
  usdAmount: number;
  createTime: string;
  showType: ShowType;
  bizType: string;
}
