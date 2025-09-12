import { type BinaryOrderInfo } from '@store/binary/types';
import { type SpreadOrderInfo } from '@store/spread/types';
import { Direction } from '@/type';

// 计算high low进行中的利润
export function calcBinaryProfit(orderInfo: BinaryOrderInfo, currentPrice: number) {
  const isBuyFall = orderInfo.direction === Direction.BuyFall;
  let loss = false;
  if (isBuyFall) {
    loss = orderInfo.startPrice <= currentPrice;
  } else {
    loss = orderInfo.startPrice >= currentPrice;
  }
  if (loss) return 0;
  return (orderInfo.amount * orderInfo.profitRate) / 100;
}

// 计算spread进行中的利润 - 相等属于赢
export function calcSpreadProfit(orderInfo: SpreadOrderInfo, currentPrice: number) {
  const { startPrice, spread } = orderInfo;
  const isBuyFall = orderInfo.direction === Direction.BuyFall;
  let loss = false;
  if (isBuyFall) {
    loss = currentPrice > Number((startPrice - spread).toFixed(14));
  } else {
    loss = currentPrice < Number((startPrice + spread).toFixed(14));
  }
  if (loss) return 0;
  return (orderInfo.amount * orderInfo.profitRate) / 100;
}
