import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useMemoCallback from '@hooks/useMemoCallback';
import { useNavigateContext } from '@hooks/useNavigate';

export default function useAutoScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const { isPopAction } = useNavigateContext();
  const toTop = useMemoCallback(() => {
    const isForcePop = (state as { action: string })?.action === 'FORCE-POP';
    if (!hash && (isForcePop || !isPopAction)) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0 });
      });
    }
  });

  useEffect(toTop, [pathname, toTop]);
}
