import { memo } from 'react';
import { useDispatch } from 'react-redux';
import {
  ContractOrderInfo,
  useActiveTradingPair,
  usePositionOrder,
  usePositionOrders,
  useSettings,
  useSubscribeGame,
  useTradingPairs,
  useTradingPairsParams,
} from '@store/contract';
import { ContractSetting, setLeverageConfig, useRiskyWarning } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { ActionTools } from '@pages/components';
import GameProvider, { useGameContext } from '@pages/components/GameProvider';
import TradingPair from '@pages/components/TradingPair';
import UpDownRatio from '@pages/components/UpDownRatio';
import ChartView from '@pages/ThirdPlatform/ChartSDKIframe';
import { GameTypeNumber } from '@/type';
import OrderList from './orders';
import ActionPanel from './PlacePanel';

function ContractContainer() {
  const { mobile } = useMediaQuery();
  const { data: activeOrders } = usePositionOrders();
  const settings = useSettings();

  // 风险提醒
  useRiskyWarning();
  // 合约参数配置
  useTradingPairsParams();
  // 当前货币对
  const symbol = useActiveTradingPair();

  const dispatch = useDispatch();
  const onSettingsChange = useMemoCallback((settings: Partial<ContractSetting>) =>
    dispatch(setLeverageConfig(settings))
  );
  const { data: symbols } = useTradingPairs();

  const context = {
    type: GameTypeNumber.Contract as const,
    selectedSymbolPair: symbol,
    onSettingsChange,
    settings,
    symbols,
    activeOrders,
    useSubscribeGame,
    usePositionOrder,
    usePositionOrders: usePositionOrdersForProvider,
  };

  return (
    <GameProvider<ContractSetting, ContractOrderInfo> {...context}>{mobile ? <MobileMain /> : <PcMain />}</GameProvider>
  );
}

export default memo(ContractContainer);

function usePositionOrdersForProvider() {
  return usePositionOrders().data;
}

function MobileMain() {
  const { selectedSymbolPair, onSettingsChange, symbols } = useGameContext();
  return (
    <>
      <div className="detrade-card relative p-0">
        <TradingPair
          onChange={(tradingPair) => onSettingsChange({ symbol: tradingPair })}
          symbols={symbols}
          tradingPair={selectedSymbolPair}
          gameType={GameTypeNumber.Contract}
        />
        <ActionTools />
        <div className="relative">
          <ChartView className="h-80 [@media(max-width:375px)]:h-[272px] pr-7" />
          <UpDownRatio
            className="absolute right-1 top-0 bottom-0"
            orientation="vertical"
            gameType={GameTypeNumber.Contract}
          />
        </div>
      </div>
      <ActionPanel.MobilePanel className="detrade-card w-full sticky -bottom-8 z-30 bg-layer3" />
      <OrderList />
    </>
  );
}

function PcMain() {
  const { selectedSymbolPair, onSettingsChange, symbols } = useGameContext();
  return (
    <>
      <TradingPair
        onChange={(tradingPair) => onSettingsChange({ symbol: tradingPair })}
        symbols={symbols}
        tradingPair={selectedSymbolPair}
        gameType={GameTypeNumber.Contract}
      />

      <div className="relative flex flex-col s768:flex-row gap-0.5">
        <div className="relative flex-1 flex gap-0.5">
          <TradingPair.Panel
            tradingPair={selectedSymbolPair}
            onChange={(tradingPair) => onSettingsChange({ symbol: tradingPair })}
            symbols={symbols}
          />

          <div className="detrade-card relative flex flex-col w-full s768:pr-8">
            <ActionTools />
            <ChartView className="basis-[600px]" />
            <UpDownRatio
              className="absolute right-0 top-3 bottom-3"
              orientation="vertical"
              gameType={GameTypeNumber.Contract}
            />
          </div>
        </div>

        <ActionPanel.PCPanel className="detrade-card w-80 s1024:w-[340px] s768:p-4" />
      </div>
      <OrderList />
    </>
  );
}
