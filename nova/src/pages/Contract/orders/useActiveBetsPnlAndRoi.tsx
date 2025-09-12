import { useCallback } from 'react';
import { ContractOrderInfo, usePositionOrders, useTradingPairsParams } from '@store/contract';
import { useSymbolPricesMap } from '@store/symbol';
import { useExchanges } from '@store/wallet';
import { getPnlAndRoi } from '../helps/calcPnlAndRoiData';

// 计算进行中的订单的利润
export default function useActiveBetsPnlAndRoi() {
  const tickerPrices = useSymbolPricesMap();
  const { data: tradingPairsParams } = useTradingPairsParams();
  // 计算利润要传用户所有进行中的订单
  const { data: activeOrders } = usePositionOrders();
  const exchanges = useExchanges();
  return useCallback(
    (order: ContractOrderInfo) => {
      const tickerPrice = tickerPrices[order.symbol];
      if (!tickerPrice) return { pnl: 0, roi: 0 };
      return getPnlAndRoi({
        endPrice: tickerPrice.p,
        order: order,
        symbolPriceInfo: tradingPairsParams[order.symbol],
        activeOrders,
        exchanges,
      });
    },
    [activeOrders, exchanges, tickerPrices, tradingPairsParams]
  );
}
