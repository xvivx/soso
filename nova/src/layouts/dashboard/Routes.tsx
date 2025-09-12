import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useMediaQuery } from '@hooks/useResponsive';
import CampaignCenter from '@pages/Campaign/CampaignCenter';
import RouteGuard from '@/routes/RouteGuard';
import RouteLayout from '../RouteLayout';
import useGuideTour from './useGuideTour';

const MobileIndex = lazy(() => import('@pages/MobileIndex'));
const HighLow = lazy(() => import('@pages/Trade/HighLow'));
const Spread = lazy(() => import('@pages/Trade/Spread'));
const Contract = lazy(() => import('@pages/Contract'));
const UpAndDown = lazy(() => import('@pages/UpAndDown'));
const TapTrading = lazy(() => import('@pages/TapTrading'));
const Integration = lazy(() => import('@pages/Integration'));
const PartnershipProgram = lazy(() => import('@pages/PartnershipProgram'));
const IntegrationApply = lazy(() => import('@pages/Integration/Apply'));
const Personal = lazy(() => import('@pages/Personal/Main'));
const ReferralLayout = lazy(() => import('@pages/Referral'));
const Campaign = lazy(() => import('@pages/Campaign/Main'));
const Notification = lazy(() => import('@pages/Notification'));
const NotifyDetail = lazy(() => import('@pages/Notification/Detail'));
const CampaignDetail = lazy(() => import('@pages/Campaign/CampaignDetail'));
const Wallet = lazy(() => import('@pages/Wallet/Layout'));
const Page404 = lazy(() => import('@pages/Page404'));
const Leaderboard = lazy(() => import('@pages/Leaderboard'));
const Markets = lazy(() => import('@pages/Markets'));

export default function Routes() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  useGuideTour();

  return (
    <Switch>
      {/* dashboard-noAuth */}
      <Route path="/dashboard/partnership-program" component={PartnershipProgram} />
      <Route path="/dashboard/integration" component={Integration} exact />
      <Route path="/dashboard/campaign-center" component={CampaignCenter} />
      <Route path="/dashboard/campaign-detail/:id" component={CampaignDetail} />
      <Route path="/dashboard/integration/apply">
        <RouteLayout title={t('Apply')} back>
          <IntegrationApply />
        </RouteLayout>
      </Route>
      <Route path="/dashboard/campaign" component={Campaign} />
      <Route path="/dashboard/markets">
        {mobile ? (
          <Redirect to="/trade-center" />
        ) : (
          <RouteGuard.TemporaryLogin>
            <Markets />
          </RouteGuard.TemporaryLogin>
        )}
      </Route>
      {/* 交易中心 */}
      <RouteGuard.TemporaryLogin path="/trade-center">
        <Switch>
          <Route path="/trade-center" component={mobile ? MobileIndex : HighLow} exact />
          <Route path="/trade-center/high-low" component={HighLow} />
          <Route path="/trade-center/spread" component={Spread} />
          <Route path="/trade-center/futures" component={Contract} />
          <Route path="/trade-center/up-down" component={UpAndDown} />
          <Route path="/trade-center/tap-trading" component={TapTrading} />
          <Route component={Page404} />
        </Switch>
      </RouteGuard.TemporaryLogin>
      <RouteGuard.TemporaryLogin path="/dashboard/leaderboard">
        <Leaderboard />
      </RouteGuard.TemporaryLogin>
      {/* dashboard-needAuth */}
      <RouteGuard.RealLogin path="/dashboard">
        <Switch>
          <Route path="/dashboard/wallet" component={Wallet} />
          <Route path="/dashboard/personal" component={Personal} />
          <Route path="/dashboard/referral" component={ReferralLayout} />
          <Route path="/dashboard/notification" component={Notification} />
          <Route path="/dashboard/messages/:id" component={NotifyDetail} />
          <Route component={Page404} />
        </Switch>
      </RouteGuard.RealLogin>
    </Switch>
  );
}
