import { ContractOrderInfo, ContractOrderStatus } from '@store/contract';
import { calcProfitInfo, SymbolPrice } from '../ROI';

export function getActiveBetsImpact({
  symbolPriceInfo,
  activeOrders,
  exchanges,
}: {
  symbolPriceInfo: SymbolPrice | null;
  activeOrders: ContractOrderInfo[];
  exchanges: { [key: string]: number };
}) {
  if (!symbolPriceInfo) return [0];

  return activeOrders
    .filter((order) => order.symbol.split('/')[0] === symbolPriceInfo.name)
    .map((order) => {
      const exchange = exchanges[order.currency];
      const a = order.amount * exchange * order.lever,
        c = Math.floor((Date.now() - Number(new Date(order.startTime))) / 1e3),
        f = symbolPriceInfo.impact_speed * 1e3,
        h = c * f;
      return Math.max(0, a - h);
    });
}

interface PnlAndRoiProps {
  endPrice?: number;
  order?: ContractOrderInfo;
  activeOrders: ContractOrderInfo[];
  symbolPriceInfo: SymbolPrice | null;
  exchanges: { [key: string]: number };
}
export function getPnlAndRoi(props: PnlAndRoiProps) {
  const { endPrice, order, activeOrders, symbolPriceInfo, exchanges } = props;
  // 设置默认值
  if (!symbolPriceInfo || !endPrice || !order) {
    return {
      pnl: 0,
      roi: 0,
    };
  }

  // 已结束的订单直接取后端数据
  if (order.status === ContractOrderStatus.Closed) {
    return {
      pnl: order.profit,
      roi: order.roi,
    };
  }

  const activeBetsImpact = getActiveBetsImpact({
    symbolPriceInfo,
    activeOrders: activeOrders.filter((it) => it.id !== order.id),
    exchanges,
  });
  const { amount, lever, direction, startPrice, commissionType } = order;
  const exchange = exchanges[order.currency];

  let profit = calcProfitInfo({
    symbolPriceInfo,
    wager: amount * exchange,
    multiplier: lever,
    direction,
    entryPrice: startPrice,
    feeType: commissionType,
    exitPrice: endPrice,
    activeBetsImpact,
  });
  profit = profit / exchange;
  const roi = profit / amount;
  return {
    pnl: profit,
    roi: roi,
  };
}
