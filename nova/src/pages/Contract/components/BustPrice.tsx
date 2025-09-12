import { CommissionType } from '@store/contract';
import { useActivePrice } from '@store/symbol';
import { formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import useCalcBustPrice from '../hooks/useBustPrice';

export default function BustPrice(props: {
  amount: number;
  direction: Direction;
  feeType: CommissionType;
  className?: string;
}) {
  const { direction, amount, feeType, className } = props;
  const { price: tickPrice, symbol } = useActivePrice();
  const calcBustPrice = useCalcBustPrice(symbol);
  const tradingPairsMap = useGameTradingPairsMap();
  const bustPrice = calcBustPrice(tickPrice, amount, direction, feeType);
  return <div className={className}>{formatter.price(bustPrice, tradingPairsMap[symbol]?.decimalPlaces).toText()}</div>;
}
