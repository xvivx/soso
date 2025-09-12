import { useCallback } from 'react';
import { CommissionType, useLever, useTradingPairParam } from '@store/contract';
import { useCurrencyExchange } from '@store/wallet';
import { Direction } from '@/type';
import { calcSymbolBustPrice } from '../ROI';
import useActiveBetsImpact from './useActiveBetsImpact';

export default function useCalcBustPrice(symbol: string) {
  const lever = useLever();
  const symbolPriceInfo = useTradingPairParam(symbol);
  // 进行中的订单对ROI的影响因素
  const activeBetsImpact = useActiveBetsImpact();
  const exchange = useCurrencyExchange();

  return useCallback(
    (entryPrice: number, amount: number, direction: Direction, feeType: CommissionType) => {
      if (!symbolPriceInfo) return 0;
      const usdAmount = amount * exchange;
      return calcSymbolBustPrice({
        entryPrice,
        wager: usdAmount,
        multiplier: lever,
        direction,
        feeType,
        symbolPriceInfo,
        activeBetsImpact,
      });
    },
    [symbolPriceInfo, activeBetsImpact, exchange, lever]
  );
}
