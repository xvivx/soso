import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setPresentOrderType, useHistoryOrders, useProgressingOrders } from '@store/tap';
import { Tabs } from '@components';
import HistoryOrders from './HistoryOrders';
import LiveOrders from './LiveOrders';
import ProgressingOrders from './ProgressingOrders';
import RankingOrders from './RankingOrders';

function Orders() {
  const dispatch = useDispatch();
  const { orders: progresses } = useProgressingOrders();
  const { data: histories } = useHistoryOrders();
  const { t } = useTranslation();
  const presentOrderType = useSelector((state: StoreState) => state.tap.presentOrderType);
  const orderTypes = useMemo(() => ['PROGRESSING', 'HISTORY', 'PUBLIC', 'LEADERBOARD'] as const, []);
  const orderTabIndex = useMemo(
    () => orderTypes.findIndex((it) => it === presentOrderType),
    [orderTypes, presentOrderType]
  );

  const hasPositionOrders = progresses.length > 0;
  useEffect(() => {
    if (hasPositionOrders) {
      dispatch(setPresentOrderType('PROGRESSING'));
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
        <Tabs.Item className="px-1 py-3">{`${t('Positions')}${formatOrdersCount(progresses.length)}`}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{`${t('History')}${formatOrdersCount(histories.length)}`}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{t('Live trade')}</Tabs.Item>
        <Tabs.Item className="px-1 py-3">{t('Leaderboard')}</Tabs.Item>
      </Tabs.Header>

      <Tabs.Panel className={progresses.length === 0 ? 'relative min-h-50' : ''}>
        <ProgressingOrders />
      </Tabs.Panel>
      <Tabs.Panel className={histories.length === 0 ? 'relative min-h-50' : ''}>
        <HistoryOrders />
      </Tabs.Panel>
      <Tabs.Panel>
        <LiveOrders />
      </Tabs.Panel>
      <Tabs.Panel>
        <RankingOrders />
      </Tabs.Panel>
    </Tabs>
  );
}

export default memo(Orders);

function formatOrdersCount(count: number) {
  return count > 0 ? `(${count})` : '';
}
