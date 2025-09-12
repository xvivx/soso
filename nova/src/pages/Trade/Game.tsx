import { memo } from 'react';
import { useOrderSound } from '@hooks/useOrderSound';
import { useMediaQuery } from '@hooks/useResponsive';
import { ActionTools } from '@pages/components';
import { useGameContext } from '@pages/components/GameProvider';
import TradingPair from '@pages/components/TradingPair';
import UpDownRatio from '@pages/components/UpDownRatio';
import ChartView from '@pages/ThirdPlatform/ChartSDKIframe';
import OrderList from './order';
import ActionPanel from './PlacePanel';

function Game() {
  useOrderSound();
  const { mobile } = useMediaQuery();
  return mobile ? <MobileMain /> : <PcMain />;
}

export default memo(Game);

function PcMain() {
  const { selectedSymbolPair, type: gameType, symbols, onSettingsChange } = useGameContext();
  return (
    <>
      <TradingPair
        tradingPair={selectedSymbolPair}
        onChange={(tradingPair) => onSettingsChange({ symbol: tradingPair })}
        symbols={symbols}
        gameType={gameType}
      />
      <div className="relative flex flex-col s768:flex-row gap-0.5">
        <TradingPair.Panel
          onChange={(tradingPair) => onSettingsChange({ symbol: tradingPair })}
          tradingPair={selectedSymbolPair}
          symbols={symbols}
        />

        <div id="chart-view" className="detrade-card relative flex flex-col w-full s768:pr-8">
          <ActionTools />
          <ChartView className="basis-[600px]" />
          <UpDownRatio className="absolute right-0 top-3 bottom-3" orientation="vertical" gameType={gameType} />
        </div>

        <ActionPanel.PCPanel />
      </div>
      <OrderList />
    </>
  );
}

function MobileMain() {
  const { selectedSymbolPair, type: gameType, symbols, onSettingsChange } = useGameContext();

  return (
    <>
      <div className="detrade-card relative flex-1 p-0">
        <TradingPair
          gameType={gameType}
          symbols={symbols}
          tradingPair={selectedSymbolPair}
          onChange={(tradingPair) => {
            onSettingsChange({ symbol: tradingPair });
          }}
        />

        <ActionTools />
        <div className="relative">
          <ChartView className="h-80 [@media(max-width:375px)]:h-72 pr-7" />
          <UpDownRatio className="absolute right-1 top-0 bottom-0" orientation="vertical" gameType={gameType} />
        </div>
      </div>
      <ActionPanel.MobilePanel />
      <OrderList />
    </>
  );
}
