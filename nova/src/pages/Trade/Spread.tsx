import { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { mutate } from 'swr';
import { BinaryPresentOrderType } from '@store/binary';
import {
  setPresentOrderType,
  setSelectTimePeriod,
  useSpreadPresentOrderType,
  useSpreadSelectedTimePeriod,
  useSpreadSettings,
  useSubscribeGame,
} from '@store/spread';
import {
  useActiveTradingPair,
  useAmountLimit,
  useHistoryOrders,
  useLeaderBoard,
  usePositionOrders,
  usePublicOrders,
  useTimePeriods,
  useTradingPairs,
} from '@store/spread/services';
import { SpreadOrderInfo, TimePeriods } from '@store/spread/types';
import { setSpreadConfig, Settings } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { OrderFilter } from '@pages/components/GameOrderFilter';
import { GameTypeNumber } from '@/type';
import GameProvider from '../components/GameProvider';
import BinarySpreadProvider from './BinarySpreadProvider';
import Game from './Game';

function Spread() {
  const selectedSymbolPair = useActiveTradingPair()!;
  const settings = useSpreadSettings();
  const { data: symbols } = useTradingPairs();
  const dispatch = useDispatch();
  const onSettingsChange = useMemoCallback((settings: Partial<Settings>) => dispatch(setSpreadConfig(settings)));
  const onTimePeriodChange = useMemoCallback((value: TimePeriods) => dispatch(setSelectTimePeriod(value)));
  const onPresentOrderTypeChange = useMemoCallback((value: BinaryPresentOrderType) =>
    dispatch(setPresentOrderType(value))
  );
  const usePositionOrder = useMemoCallback(() => null);
  const selectedTimePeriod = useSpreadSelectedTimePeriod();
  const presentOrderType = useSpreadPresentOrderType();

  const context = {
    type: GameTypeNumber.BinarySpread as const,
    selectedSymbolPair,
    onSettingsChange,
    settings,
    symbols,
    useSubscribeGame,
    usePositionOrders: usePositionOrdersForProvider,
    usePositionOrder,
  };

  // 玩法1和玩法4单独的context
  const spreadContext = {
    selectedTimePeriod,
    presentOrderType,
    onPresentOrderTypeChange,
    onTimePeriodChange,
    useTimePeriods,
    useAmountLimit,
    usePublicOrders,
    useHistoryOrders,
    useLeaderBoard: (props: OrderFilter) => useLeaderBoard(props),
  };

  // 卸载的时候清除spread所有缓存
  useEffect(() => {
    return () => {
      mutate((key?: string[]) => {
        if (!key) return false;
        return key[0].startsWith('spread');
      }, undefined);
    };
  }, []);

  return (
    <GameProvider<Settings, SpreadOrderInfo> {...context}>
      <BinarySpreadProvider<SpreadOrderInfo> {...spreadContext}>
        <Game />
      </BinarySpreadProvider>
    </GameProvider>
  );
}

export default memo(Spread);

function usePositionOrdersForProvider() {
  return usePositionOrders().data;
}
