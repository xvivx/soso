import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMobileSecondaryRoutes } from '@/routes/main';

export default function useIsSecondaryRoute(path?: string) {
  const { pathname } = useLocation();
  const secondaryRoutes = useMobileSecondaryRoutes();
  const calcIsSecondaryRoute = useMemoCallback((pathname: string) => {
    return secondaryRoutes.find((route) =>
      matchPath(pathname, typeof route.path === 'string' ? route.path : [...route.path!])
    );
  });
  const targetPath = path || pathname;
  return useMemo(() => Boolean(calcIsSecondaryRoute(targetPath)), [calcIsSecondaryRoute, targetPath]);
}
