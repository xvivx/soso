import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { setTapConfig } from '@store/system';
import { useActiveTradingPairInfo, useTradingPairs } from '@store/tap';
import TradingPair from '@pages/components/TradingPair';

const TradingPairHeader = memo(() => {
  const { data: tradingPairs } = useTradingPairs();
  const tradingPair = useActiveTradingPairInfo();
  const dispatch = useDispatch();

  return (
    <TradingPair
      onChange={(symbol) => dispatch(setTapConfig({ symbol }))}
      symbols={tradingPairs}
      tradingPair={tradingPair}
      gameType={5}
    />
  );
});

const TradingPairPanel = memo(() => {
  const tradingPair = useActiveTradingPairInfo();
  const { data: symbols } = useTradingPairs();
  const dispatch = useDispatch();

  return (
    <TradingPair.Panel
      tradingPair={tradingPair}
      onChange={(symbol) => dispatch(setTapConfig({ symbol }))}
      symbols={symbols}
    />
  );
});

export { TradingPairHeader, TradingPairPanel };
