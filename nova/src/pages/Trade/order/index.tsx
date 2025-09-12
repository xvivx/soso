import { memo, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@components';
import { useGameContext } from '@pages/components/GameProvider';
import { useBinarySpreadContext } from '../BinarySpreadProvider';
import ActiveBets from './ActiveBets';
import ClosedBets from './ClosedBets';
import LeaderBoard from './LeaderBoard';
import PublicBets from './PublicBets';

function OrderList() {
  const { usePositionOrders } = useGameContext();
  const { presentOrderType, onPresentOrderTypeChange } = useBinarySpreadContext();
  const activeOrders = usePositionOrders();
  const { t } = useTranslation();

  const orderTypes = useMemo(() => ['POSITIONS', 'HISTORY', 'PUBLIC', 'LEADERBOARD'] as const, []);
  const orderTabIndex = useMemo(
    () => orderTypes.findIndex((it) => it === presentOrderType),
    [orderTypes, presentOrderType]
  );

  const initializedRef = useRef(false);
  // 只在组件初始化时有持仓则展示持仓
  useEffect(() => {
    if (!initializedRef.current && activeOrders.length > 0) {
      onPresentOrderTypeChange('POSITIONS');
      initializedRef.current = true;
    }
  }, [activeOrders.length, onPresentOrderTypeChange]);

  return (
    <Tabs
      className="detrade-card"
      selectedIndex={orderTabIndex}
      onChange={(index) => onPresentOrderTypeChange(orderTypes[index])}
      theme="chip"
    >
      <Tabs.Header className="s768:gap-12">
        <Tabs.Item>{t('Positions')}</Tabs.Item>
        <Tabs.Item>{t('History')}</Tabs.Item>
        <Tabs.Item>{t('Live trade')}</Tabs.Item>
        <Tabs.Item>{t('Leaderboard')}</Tabs.Item>
      </Tabs.Header>

      <Tabs.Panel>
        <ActiveBets />
      </Tabs.Panel>
      <Tabs.Panel>
        <ClosedBets />
      </Tabs.Panel>
      <Tabs.Panel>
        <PublicBets />
      </Tabs.Panel>
      <Tabs.Panel>
        <LeaderBoard />
      </Tabs.Panel>
    </Tabs>
  );
}

export default memo(OrderList);
