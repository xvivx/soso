import { lazy } from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router-dom';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { SvgIcon } from '@components';
import ErrorBoundary from '@pages/components/ErrorBoundary';
import Wallet from '@/layouts/dashboard/header/Wallet';
import RouteGuard from '@/routes/RouteGuard';
import LoginButtons from './dashboard/LoginButtons';

const HighLow = lazy(() => import('@pages/Trade/HighLow'));
const Spread = lazy(() => import('@pages/Trade/Spread'));
const Contract = lazy(() => import('@pages/Contract'));
const UpAndDown = lazy(() => import('@pages/UpAndDown'));
const TapTrading = lazy(() => import('@pages/TapTrading'));
const Maintenance = lazy(() => import('@pages/Maintenance'));

export default function MobileTradeLayout() {
  const { isTemporary } = useUserInfo().data;
  const navigate = useNavigate();
  const isMaintenance = useSelector((state) => state.system.isMaintenance); // 是否在维护

  return (
    <RouteGuard.TemporaryLogin>
      <div className="sticky top-0 z-40 flex items-center justify-between space-x-5 h-12 px-4 mb-0.5 bg-layer3 font-500">
        <SvgIcon name="arrow" className="rotate-180" onClick={() => navigate(-1)} />
        {isTemporary ? <LoginButtons /> : <Wallet />}
      </div>

      <ErrorBoundary className="h-auto pt-20">
        {isMaintenance ? (
          <Maintenance />
        ) : (
          <div className="safe-bottom-area border-transparent space-y-0.5">
            <Route path="/trade-center/high-low" component={HighLow} />
            <Route path="/trade-center/spread" component={Spread} />
            <Route path="/trade-center/futures" component={Contract} />
            <Route path="/trade-center/up-down" component={UpAndDown} />
            <Route path="/trade-center/tap-trading" component={TapTrading} />
          </div>
        )}
      </ErrorBoundary>
    </RouteGuard.TemporaryLogin>
  );
}
