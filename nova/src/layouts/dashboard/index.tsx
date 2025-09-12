import { Fragment, lazy, memo, PropsWithChildren, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, scroll, useAnimation } from 'framer-motion';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { CustomerServiceButton, Loading } from '@components';
import { cn } from '@utils';
import ErrorBoundary from '@pages/components/ErrorBoundary';
import Marquee from '@pages/components/Marquee';
import { useNavigateContext } from '@/NavigateContext';
import Footer from '../Footer';
import Header from './header';
import MobileBottomBar from './MobileBottomBar';
import Routes from './Routes';

const Maintenance = lazy(() => import('@pages/Maintenance'));
const Chat = lazy(() => import('@/layouts/dashboard/chat'));

function Layout() {
  const { mobile } = useMediaQuery();
  const Content = mobile ? MobileContent : PcContent;
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);
  const isMaintenance = useSelector((state: StoreState) => state.system.isMaintenance); // 是否在维护
  useEffect(() => {
    return scroll((process: number) => setShowHeaderShadow(process > 0));
  }, []);
  return (
    <Fragment>
      <div className="app-header sticky top-0 s768:fixed inset-x-0 z-50 transform-gpu">
        <Header className={cn('relative z-10', showHeaderShadow && 'shadow-lg')} />
      </div>
      <ErrorBoundary>
        <Content>{isMaintenance ? <Maintenance /> : <Routes />}</Content>
      </ErrorBoundary>
    </Fragment>
  );
}

function PcContent(props: PropsWithChildren) {
  const { children } = props;
  const isTradeCenter = useIsTradeCenter();
  return (
    <Fragment>
      <CustomerServiceButton />

      <Suspense fallback={null}>
        <Chat />
      </Suspense>

      <Animation className="app-main flex flex-col justify-between">
        <Suspense fallback={<Loading.Screen className="app-content w-full bg-layer2" />}>
          <div
            className={cn(
              'app-content w-full flex-1',
              isTradeCenter ? 'space-y-0.5 py-0.5' : 'p-6 px-3 s1366:px-6 mx-auto'
            )}
            style={{ maxWidth: isTradeCenter ? undefined : 1200 }}
          >
            {isTradeCenter && <Marquee />}
            {children}
          </div>
        </Suspense>
        <Footer className="shrink-0 w-full bg-layer1" />
      </Animation>
    </Fragment>
  );
}

function useIsTradeCenter() {
  const { pathname } = useLocation();
  return pathname.startsWith('/trade-center');
}

function MobileContent({ children }: PropsWithChildren) {
  const isTradeCenter = useIsTradeCenter();
  return (
    <Fragment>
      <Animation className={cn('app-main origin-top', isTradeCenter ? 'space-y-0.5 py-0.5' : 'p-4')}>
        <Suspense fallback={<Loading.Screen className="absolute inset-0 h-auto bg-layer2" />}>
          {isTradeCenter && <Marquee />}
          {children}
        </Suspense>
      </Animation>
      <MobileBottomBar />
    </Fragment>
  );
}

export default memo(Layout);

function Animation(props: PropsWithChildren & { className?: string }) {
  const { className, children } = props;
  const { mobile } = useMediaQuery();
  const { hash } = useLocation();
  const variants = useMemo(
    () => (mobile ? { initial: { scale: 0.98 }, show: { scale: 1 } } : { initial: { y: 16 }, show: { y: 0 } }),
    [mobile]
  );
  const mountedRef = useRef(false);
  const animateKey = useAnimateKey();
  const controls = useAnimation();
  const { isPopAction } = useNavigateContext();
  const startRouteAnimation = useMemoCallback(() => {
    // 第一次加载、返回操作、进入弹窗路由不做动画
    if (!mountedRef.current || isPopAction || hash) {
      mountedRef.current = true;
      return;
    }

    controls.set('initial');
    controls.start('show', { duration: 0.25 });
    return () => controls.stop();
  });
  useEffect(() => {
    return startRouteAnimation();
  }, [animateKey, startRouteAnimation]);

  return (
    <motion.div className={className} variants={variants} animate={controls}>
      {children}
    </motion.div>
  );
}

function useAnimateKey() {
  const { pathname } = useLocation();
  const tabRoutes = useMemo(
    () => [
      '/dashboard/campaign',
      '/dashboard/personal',
      '/dashboard/referral',
      '/dashboard/notification',
      '/dashboard/wallet',
    ],
    []
  );
  return useMemo(() => {
    return tabRoutes.find((it) => pathname.startsWith(it)) || pathname;
  }, [tabRoutes, pathname]);
}
