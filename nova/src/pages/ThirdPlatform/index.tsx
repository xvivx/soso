import { lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscribeAllTradingPairs } from '@store/symbol';
import { setMaintenance } from '@store/system';
import { useAccessCodeAuth } from '@store/user';
import { useTradingWebsocket } from '@store/ws';
import { Modal } from '@components';
import Marquee from '@pages/components/Marquee';
import Maintenance from '@pages/Maintenance';

const Contract = lazy(() => import('@pages/Contract'));
const Trading = lazy(() => import('@pages/Trade/HighLow'));
const Spread = lazy(() => import('@pages/Trade/Spread'));
const UpAndDown = lazy(() => import('@pages/UpAndDown'));
const TapTrading = lazy(() => import('@pages/TapTrading'));

export default function ThirdPlatform(props: {
  accessCode: string;
  type: 'trading' | 'contract' | 'up-down' | 'spread' | 'tap-trading';
}) {
  const { accessCode = '', type } = props;
  // 三方登陆
  useAccessCodeAuth(accessCode);
  useTradingWebsocket();
  useSubscribeAllTradingPairs();

  const dispatch = useDispatch();
  // 是否在维护
  const isMaintenance = useSelector((state: StoreState) => state.system.isMaintenance);
  // 监听玩法切换，重置 isMaintenance 状态
  useEffect(() => {
    dispatch(setMaintenance(false));
    return () => Modal.closeAll();
  }, [type, dispatch]);

  if (isMaintenance) return <Maintenance />;
  return (
    <div className="space-y-0.5">
      <Marquee className="detrade-notification rounded-2" />
      {type === 'trading' && <Trading />}
      {type === 'spread' && <Spread />}
      {type === 'contract' && <Contract />}
      {type === 'up-down' && <UpAndDown />}
      {type === 'tap-trading' && <TapTrading />}
    </div>
  );
}
