import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { changeUpdown } from '@store/system';
import { useActiveTradingPair, useSubscribeGame, useTradingPairs } from '@store/upDown';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import TradingPair from '@pages/components/TradingPair';
import { GameTypeNumber } from '@/type';
import Footer from './footer';
import Header from './Header';
import Main from './main';
import Orders from './orders';
import Periods from './Periods';
import { MobilePlayers, PcPlayers } from './players';

function UpAndDown() {
  const { gt1024 } = useMediaQuery();
  const selectedSymbolPair = useActiveTradingPair();
  const dispatch = useDispatch();
  const onSettingsChange = useMemoCallback((tradingPair: string) => dispatch(changeUpdown({ symbol: tradingPair })));
  const { data: symbols } = useTradingPairs();
  useSubscribeGame();

  return (
    <>
      <div className="s1024:flex s1024:items-stretch gap-0.5">
        <div className="flex flex-col justify-between s1024:overflow-hidden gap-0.5 flex-1">
          <TradingPair
            tradingPair={selectedSymbolPair}
            onChange={onSettingsChange}
            symbols={symbols}
            gameType={GameTypeNumber.Updown}
            className="pb-3"
          >
            <Periods />
          </TradingPair>
          <div id="up-down-content" className="flex flex-col flex-1 gap-3 detrade-card">
            <Header />
            <Main />
          </div>
          {!gt1024 && <MobilePlayers />}
          <Footer />
        </div>

        {gt1024 && <PcPlayers />}
      </div>

      <Orders />
    </>
  );
}

export default memo(UpAndDown);
