import { Fragment, memo } from 'react';
import { useSelector } from 'react-redux';
import { updateLiveOrders, useSubscribeGame } from '@store/tap';
import { useUserInfo } from '@store/user';
import { useOnMessage } from '@store/ws';
import { useMediaQuery } from '@hooks/useResponsive';
import ActionTools from './ActionTools';
import ChartView from './ChartView';
import ChartContextProvider, { useChartContext } from './ContextChart';
import Orders from './Orders';
import ProgressingPublicOrders from './Orders/ProgressingPublicOrders';
import PlacePanel from './PlacePanel';
import { TradingPairHeader, TradingPairPanel } from './TradingPairPanel';

function TapTrading() {
  useSubscribeGame();

  const { mobile } = useMediaQuery();
  const activePair = useSelector((state) => state.system.tap.symbol);
  const { data: user } = useUserInfo();

  useOnMessage((message) => {
    if (!message) return;
    const { resp, cmd } = message;
    if (cmd === '/tapOrder/create') {
      // 更新当前货币度、他人的实时订单
      if (activePair === resp.symbol && resp.userId !== user.id) {
        updateLiveOrders(resp);
      }
    }
  });

  return <ChartContextProvider>{mobile ? <MobileMain /> : <PcMain />}</ChartContextProvider>;
}

export default memo(TapTrading);

function MobileMain() {
  const { gotoCenter } = useChartContext();

  return (
    <Fragment>
      <div className="detrade-card p-0">
        <TradingPairHeader />
        <ActionTools gotoCenter={gotoCenter} />
      </div>
      <ChartView />
      <PlacePanel />
      <Orders />
    </Fragment>
  );
}

function PcMain() {
  const { gotoCenter } = useChartContext();

  return (
    <Fragment>
      <TradingPairHeader />
      <div className="flex gap-0.5 relative">
        <TradingPairPanel />
        <div className="flex-1 detrade-card">
          <ActionTools gotoCenter={gotoCenter} />
          <ChartView />
        </div>
        <div className="flex flex-col gap-0.5">
          <ProgressingPublicOrders className="detrade-card flex-1" />
          <PlacePanel />
        </div>
      </div>
      <Orders />
    </Fragment>
  );
}
