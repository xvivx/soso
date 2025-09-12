import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setPresentOrderType, usePositionOrders } from '@store/upDown';
import Tabs from '@components/Tabs';
import ActiveBets from './ActiveBets';
import ClosedBet from './ClosedBets';
import Rank from './LeaderBoard';

function Orders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const presentOrderType = useSelector((state: StoreState) => state.upDown.presentOrderType);
  const orderTypes = useMemo(() => ['POSITIONS', 'HISTORY', 'LEADERBOARD'] as const, []);
  const orderTabIndex = useMemo(
    () => orderTypes.findIndex((it) => it === presentOrderType),
    [orderTypes, presentOrderType]
  );
  useInitRoundOrders();
  return (
    <Tabs
      className="detrade-card"
      selectedIndex={orderTabIndex}
      onChange={(index) => dispatch(setPresentOrderType(orderTypes[index]))}
      theme="chip"
    >
      <Tabs.Header className="s768:gap-12">
        <Tabs.Item>{t('Positions')}</Tabs.Item>
        <Tabs.Item>{t('History')}</Tabs.Item>
        <Tabs.Item>{t('Leaderboard')}</Tabs.Item>
      </Tabs.Header>
      <Tabs.Panel>
        <ActiveBets />
      </Tabs.Panel>
      <Tabs.Panel>
        <ClosedBet />
      </Tabs.Panel>
      <Tabs.Panel>
        <Rank />
      </Tabs.Panel>
    </Tabs>
  );
}

export default memo(Orders);

function useInitRoundOrders() {
  const dispatch = useDispatch();
  const gameLabel = useSelector((state) => state.system.updown.gameLabel);
  const { mutate, orders } = usePositionOrders();

  const hasPositionOrders = orders.length > 0;
  useEffect(() => {
    // 只要有进行中订单就这设置到进行中的tab
    if (hasPositionOrders) {
      dispatch(setPresentOrderType('POSITIONS'));
    }
  }, [dispatch, hasPositionOrders]);

  const gameReady = useSelector((state) => state.upDown.game && Boolean(state.upDown.game.id));
  useEffect(() => {
    gameReady && mutate();
  }, [gameLabel, gameReady, mutate]);
}
