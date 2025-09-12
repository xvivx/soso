import { memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  createUpDownOrder,
  GameStatus,
  setPresentOrderType,
  useCurrentSymbol,
  useRealtimeGame,
  useTradingPairs,
} from '@store/upDown';
import { useCurrencyExchange } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { Direction } from '@/type';
import BaseFooter from './Base';

function UpDownFooter(props: { className?: string }) {
  const { className } = props;
  const dispatch = useDispatch();
  const game = useRealtimeGame();
  const exchange = useCurrencyExchange();
  const { data: symbols } = useTradingPairs();
  const currentSymbol = useCurrentSymbol();

  // 判断当前交易对是否允许下单
  const isOrderEnabled = useMemo(() => {
    if (!currentSymbol) return false;
    const symbolInfo = symbols.find((s) => s.symbol === currentSymbol);
    return symbolInfo?.orderStatus ?? false;
  }, [currentSymbol, symbols]);

  const handleOrder = useMemoCallback(async (direction: Direction) => {
    await dispatch(createUpDownOrder({ direction })).unwrap();
    dispatch(setPresentOrderType('POSITIONS'));
  });

  return (
    <BaseFooter
      className={className}
      disabled={game.status !== GameStatus.STARTED || !exchange || !isOrderEnabled}
      onOrder={handleOrder}
    />
  );
}

export default memo(UpDownFooter);
