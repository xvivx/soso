import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setPresentOrderType } from '@store/contract';
import { useHistoryOrders, usePositionOrders } from '@store/contract/services';
import Tabs from '@components/Tabs';
import History from './History';
import LeaderBoard from './LeaderBoard';
import Positions from './Positions';
import Public from './Public';

function OrderList() {
  const dispatch = useDispatch();
  const { data: positions } = usePositionOrders();
  const { data: histories } = useHistoryOrders();
  const { t } = useTranslation();
  const presentOrderType = useSelector((state: StoreState) => state.contract.presentOrderType);
  const orderTypes = useMemo(() => ['MARKET', 'HISTORY', 'PUBLIC', 'LEADERBOARD'] as const, []);
  const orderTabIndex = useMemo(
    () => orderTypes.findIndex((it) => it === presentOrderType),
    [orderTypes, presentOrderType]
  );
  const hasPositionOrders = positions.length > 0;
  // 组件初始化时, 没有持仓则从MARKET => Public(从Public跳转MARKET可能会造成多次Suspense)
  useEffect(() => {
    if (hasPositionOrders) {
      dispatch(setPresentOrderType('MARKET'));
    }
  }, [dispatch, hasPositionOrders]);

  return (
    <Tabs
      className="detrade-card"
      selectedIndex={orderTabIndex}
      onChange={(index) => dispatch(setPresentOrderType(orderTypes[index]))}
      theme="chip"
    >
      <Tabs.Header className="s768:gap-12">
        <Tabs.Item className="px-1 py-3">{`${t('Positions')}${formatOrdersCount(positions.length)}`}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{`${t('History')}${formatOrdersCount(histories.length)}`}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{t('Live trade')}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{t('Leaderboard')}</Tabs.Item>
      </Tabs.Header>

      <Tabs.Panel className={positions.length === 0 ? 'relative min-h-50' : ''}>
        <Positions />
      </Tabs.Panel>
      <Tabs.Panel className={histories.length === 0 ? 'relative min-h-50' : ''}>
        <History />
      </Tabs.Panel>
      <Tabs.Panel>
        <Public />
      </Tabs.Panel>
      <Tabs.Panel>
        <LeaderBoard />
      </Tabs.Panel>
    </Tabs>
  );
}

export default memo(OrderList);

function formatOrdersCount(count: number) {
  return count > 0 ? `(${count})` : '';
}
