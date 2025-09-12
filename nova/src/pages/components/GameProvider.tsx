/**
 * high low/spread/contract玩法一些通用方法
 */
import { createContext, memo, PropsWithChildren, useContext, useMemo } from 'react';
import { keyBy } from 'lodash-es';
import { BinaryOrderInfo } from '@store/binary/types';
import { ContractOrderInfo, OrderPosition } from '@store/contract';
import { SpreadOrderInfo } from '@store/spread/types';
import { useSubscribeActiveTradingPair } from '@store/symbol';
import { Settings } from '@store/system';
import { GameTypeNumber } from '@/type';

type OrderType = ContractOrderInfo | SpreadOrderInfo | BinaryOrderInfo;
interface GameProps<SettingsT extends Settings, OrderT extends OrderType> {
  type: GameTypeNumber;
  settings: SettingsT;
  onSettingsChange: (params: Partial<SettingsT>) => void;
  selectedSymbolPair: SymbolInfo;
  symbols: SymbolInfo[];
  usePositionOrders: () => OrderT[];
  usePositionOrder: () => OrderPosition | null;
  // 非context范围
  useSubscribeGame: () => void;
}

type ContextType<SettingsT extends Settings, OrderT extends OrderType> = Omit<
  GameProps<SettingsT, OrderT>,
  'useSubscribeGame'
>;
const Context = createContext<ContextType<any, any>>();

export function useGameContext<SettingsT extends Settings, OrderT extends OrderType>() {
  return useContext<ContextType<SettingsT, OrderT>>(Context);
}

export function useGameTradingPairsMap() {
  const { symbols: tradingPairs } = useGameContext();
  return useMemo(() => keyBy(tradingPairs, 'symbol'), [tradingPairs]);
}

function GameProvider<SettingsT extends Settings, OrderT extends OrderType>({
  children,
  useSubscribeGame,
  ...props
}: PropsWithChildren & GameProps<SettingsT, OrderT>) {
  const { settings, symbols } = props;
  useSubscribeActiveTradingPair(settings.symbol, settings.tick, symbols);
  useSubscribeGame();
  return <Context.Provider value={props}>{children}</Context.Provider>;
}

export default memo(GameProvider) as typeof GameProvider;
