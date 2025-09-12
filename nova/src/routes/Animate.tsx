import { memo, ReactNode, Suspense, useMemo } from 'react';
import { Switch, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import useIsSecondaryRoute from '@hooks/useIsSecondaryRoute';
import useMemoCallback from '@hooks/useMemoCallback';
import { useNavigateContext } from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Loading } from '@components';
import { cn } from '@utils';
import { useModalRoutes } from './main';

type AnimateRouteProps = {
  className?: string;
  children: ReactNode;
  strict: boolean;
  modal?: boolean;
};

function AnimateRoute(props: AnimateRouteProps) {
  const { strict, children, className, modal } = props;
  const { isPopAction, disableAnimation } = useNavigateContext();
  const { hash, pathname } = useLocation();
  const variants: Variants = useMemo(() => {
    const top = modal ? 0 : -1 * window.scrollY;
    return {
      right: { x: '100vw' },
      left: { x: '-50vw' },
      strict: { x: 0, zIndex: modal ? 9 : 7, position: modal ? 'fixed' : 'relative' },
      down: { position: 'fixed', zIndex: modal && hash ? 8 : 0, top },
      up: { position: 'fixed', zIndex: 10, top },
    };
    // 路径变化时需要定位窗口滚动高度
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, pathname, modal]);

  return (
    <motion.div
      className={cn('min-h-screen inset-x-0 bg-layer2', className)}
      variants={variants}
      initial={isPopAction ? 'left' : 'right'}
      animate={strict ? 'strict' : 'left'}
      exit={isPopAction ? ['right', 'up'] : ['left', 'down']}
      transition={{ duration: disableAnimation ? 0 : 0.25, damping: false, top: { duration: 0 } }}
    >
      {children}
    </motion.div>
  );
}

function AnimateSwitch({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { mobile } = useMediaQuery();

  if (mobile) {
    return <MobileAnimateSwitch>{children}</MobileAnimateSwitch>;
  } else {
    return (
      <Suspense fallback={<Loading.Screen />}>
        <Switch location={location}>{children}</Switch>
      </Suspense>
    );
  }
}

function MobileAnimateSwitch({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { hash } = location;
  const animateKey = useAnimateKey();
  const isSecondaryRoute = useIsSecondaryRoute();
  const modalRoutes = useModalRoutes();
  const getStrict = useMemoCallback(() => {
    if (!hash || !isSecondaryRoute) return true;
    return !modalRoutes.find((hashRoute) => {
      if (typeof hashRoute.path === 'string') return hash === hashRoute.path;
      return hashRoute.path.find((hashPath) => hashPath === hash);
    });
  });
  return (
    <AnimatePresence initial={false}>
      <AnimateRoute key={animateKey} strict={getStrict()}>
        <Suspense fallback={<Loading.Screen />}>
          <Switch location={location}>{children}</Switch>
        </Suspense>
      </AnimateRoute>
    </AnimatePresence>
  );
}

export default {
  Switch: memo(AnimateSwitch),
  Route: memo(AnimateRoute),
};

function useAnimateKey() {
  const { pathname } = useLocation();
  const secondaryRoutes = useMemo(
    () => [
      '/trade-center/*',
      '/dashboard/partnership-program',
      '/dashboard/referral',
      '/dashboard/notification-detail',
      '/dashboard/notification',
      '/dashboard/integration/*',
      '/dashboard/wallet',
      '/account/*',
    ],
    []
  );

  return useMemo(() => {
    if (pathname.replace(/\/$/, '') === '/trade-center') return 'primary';
    if (pathname === '/') return 'index';
    const matched = secondaryRoutes.find((it) => pathname.startsWith(it.replace('/*', '')));
    // 如果matched说明这个路径开始的每个路由都要动画, 否则都用同一个key
    if (matched && matched.endsWith('*')) return pathname;
    // 这类路由只在加载时动画一次, 后续切换不再动画, 常见于tabs路由
    return matched ? matched : 'primary';
  }, [secondaryRoutes, pathname]);
}
