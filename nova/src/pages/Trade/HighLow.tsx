import { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { mutate } from 'swr';
import {
  BinaryPresentOrderType,
  setPresentOrderType,
  setSelectTimePeriod,
  useBinaryPresentOrderType,
  useBinarySelectedTimePeriod,
  useBinarySettings,
  useSubscribeGame,
} from '@store/binary';
import {
  useActiveTradingPair,
  useAmountLimit,
  useHistoryOrders,
  useLeaderBoard,
  usePositionOrders,
  usePublicOrders,
  useTimePeriods,
  useTradingPairs,
} from '@store/binary/services';
import { BinaryOrderInfo, TimePeriods } from '@store/binary/types';
import { setBinaryConfig, Settings } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { GameTypeNumber } from '@/type';
import GameProvider from '../components/GameProvider';
import BinarySpreadProvider from './BinarySpreadProvider';
import Game from './Game';

function HighLow() {
  const selectedSymbolPair = useActiveTradingPair()!;
  const settings = useBinarySettings();
  const dispatch = useDispatch();
  const { data: symbols } = useTradingPairs();
  const onSettingsChange = useMemoCallback((settings: Partial<Settings>) => dispatch(setBinaryConfig(settings)));
  const onTimePeriodChange = useMemoCallback((value: TimePeriods) => dispatch(setSelectTimePeriod(value)));
  const onPresentOrderTypeChange = useMemoCallback((value: BinaryPresentOrderType) =>
    dispatch(setPresentOrderType(value))
  );
  const usePositionOrder = useMemoCallback(() => null);
  const selectedTimePeriod = useBinarySelectedTimePeriod();
  const presentOrderType = useBinaryPresentOrderType();

  const context = {
    type: GameTypeNumber.Binary as const,
    selectedSymbolPair,
    onSettingsChange,
    settings,
    symbols,
    useSubscribeGame,
    usePositionOrders: usePositionOrdersForProvider,
    usePositionOrder,
  };

  // 玩法1和玩法4单独的context
  const binaryContext = {
    selectedTimePeriod,
    presentOrderType,
    onPresentOrderTypeChange,
    onTimePeriodChange,
    useTimePeriods,
    useAmountLimit,
    usePublicOrders,
    useHistoryOrders,
    useLeaderBoard,
  };

  // 卸载的时候清除binary所有缓存
  useEffect(() => {
    return () => {
      mutate((key?: string[]) => {
        if (!key) return false;
        return key[0].startsWith('binary');
      }, undefined);
    };
  }, []);

  return (
    <GameProvider<Settings, BinaryOrderInfo> {...context}>
      <BinarySpreadProvider<BinaryOrderInfo> {...binaryContext}>
        <Game />
      </BinarySpreadProvider>
    </GameProvider>
  );
}

export default memo(HighLow);
function usePositionOrdersForProvider() {
  return usePositionOrders().data;
}
