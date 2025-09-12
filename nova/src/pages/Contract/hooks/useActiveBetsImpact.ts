import { useMemo } from 'react';
import { useActiveTradingPair, usePositionOrders, useTradingPairParam } from '@store/contract';
import { useExchanges } from '@store/wallet';
import { getActiveBetsImpact } from '../helps/calcPnlAndRoiData';

export default function useActiveBetsImpact() {
  const tradingPair = useActiveTradingPair();
  const symbolPriceInfo = useTradingPairParam(tradingPair?.symbol);
  const { data: activeOrders } = usePositionOrders();
  const exchanges = useExchanges();

  return useMemo(() => {
    return getActiveBetsImpact({ symbolPriceInfo, activeOrders, exchanges });
  }, [activeOrders, symbolPriceInfo, exchanges]);
}
