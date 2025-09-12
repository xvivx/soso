import { lazy, memo, ReactNode } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useSubscribeAllTradingPairs } from '@store/symbol';
import { useUpdateWalletBalance } from '@store/wallet';
import { useTradingWebsocket } from '@store/ws';
import { useMediaQuery } from '@hooks/useResponsive';
import useAutoScrollToTop from '@/routes/useAutoScrollTop';
import useMaintenance from '@/routes/useMaintenance';
import Animate from './Animate';
import CloseMobileOverlayWhenHistoryBack from './CloseMobileOverlayWhenHistoryBack';
import { useMobileSecondaryRoutes, useModalRoutes, usePrimaryRoutes } from './main';
import { MobileSecondaryRoute, ModalRoute } from './Route';

let DemoPlayground: ReactNode = null;
let SwitchThemeButton: ReactNode = null;
if (import.meta.env.DEV) {
  DemoPlayground = <Route path="/playground" component={(await import('@pages/Demos')).default} />;
  SwitchThemeButton = <Route component={(await import('./SwitchThemeButton')).default} />;
}

function Router() {
  const { mobile } = useMediaQuery();
  const modalRoutes = useModalRoutes();
  const mobileSecondaryRoutes = useMobileSecondaryRoutes();
  const primaryRoutes = usePrimaryRoutes();
  return (
    <Switch>
      {DemoPlayground}

      {/* 绑定邮箱, 从邮箱链接跳转回来的页面 */}
      <Route path="/verify/bind-email/:code" component={VerifyBindEmail} />
      {/* 推特登录回调页面 */}
      <Route path="/twitter/callback" component={TwitterCallback} />

      <Route>
        <NullRenderHooks />

        {modalRoutes.map((route) => (
          <ModalRoute key={typeof route.path === 'string' ? route.path : route.path[0]} {...route} />
        ))}

        {import.meta.env.DEV && SwitchThemeButton}

        <Animate.Switch>
          {mobileSecondaryRoutes.map((route) => {
            if (import.meta.env.MODE === 'development' && !route.path) {
              throw new Error('Missing path in secondary route');
            }

            const RouteComponent = Array.isArray(route.path) ? Route : MobileSecondaryRoute;
            return <RouteComponent key={Array.isArray(route.path) ? route.path[0] : route.path} {...route} />;
          })}

          {primaryRoutes.map((route) => (
            <Route key={route.path === 'string' ? route.path : route.path![0]} {...route} />
          ))}
        </Animate.Switch>

        {mobile && <CloseMobileOverlayWhenHistoryBack />}
      </Route>
    </Switch>
  );
}

export default memo(Router);

const VerifyBindEmail = lazy(() => import('@pages/Personal/MyProfile/VerifyBindEmail'));
const TwitterCallback = lazy(() => import('@pages/Account/TwitterCallback'));

function NullRenderHooks() {
  useMaintenance();
  // 自动连接websocket
  useTradingWebsocket();
  // 自动订阅交易对价格和涨跌幅
  useSubscribeAllTradingPairs();
  // 自动更新钱包余额
  useUpdateWalletBalance();
  // 跳新页面自动滚动到顶部
  useAutoScrollToTop();
  return null;
}
