import { createElement, memo, PropsWithChildren, ReactNode, Suspense, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useNavigate, { useNavigateContext } from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Loading, Modal, SvgIcon } from '@components';
import { cn } from '@utils';
import Animate from './Animate';
import { MobileSecondaryRouteProps, ModalRouteProps } from './type';

function useMatched(path: ModalRouteProps['path'], strict?: true) {
  const { hash } = useLocation();
  return useMemo(() => {
    const paths = typeof path === 'string' ? [path] : path;
    const matched = paths.filter((it) => hash.startsWith(it));

    if (strict) {
      return [matched.length > 0, !!matched.find((it) => hash === it)];
    } else {
      return [matched.length > 0];
    }
  }, [hash, path, strict]);
}

export const ModalRoute = memo(function ModalRoute(props: ModalRouteProps) {
  const navigate = useNavigate();
  const { mobile } = useMediaQuery();
  const { title, children, path, component, ...rests } = props;
  const [matched] = useMatched(path);

  if (!mobile) {
    return (
      <Modal
        visible={matched}
        title={title && <BackTitle className="justify-start p-0 pl-12 -ml-6 bg-layer2">{title}</BackTitle>}
        onClose={() => navigate(-1)}
        unstyled={!title}
        size="md"
        {...rests}
      >
        <Suspense
          fallback={
            <div className="h-100">
              <Loading />
            </div>
          }
        >
          {children || createElement(component!)}
        </Suspense>
      </Modal>
    );
  }

  return <MobileAnimateRoute {...props} />;
});

function BackTitle(props: PropsWithChildren & { className?: string }) {
  const navigate = useNavigate();
  const { className, children } = props;
  return (
    <div
      className={cn(
        'sticky top-0 z-modal-down flex-center s768:justify-start px-10 py-2 leading-8 bg-layer3 font-500',
        className
      )}
    >
      <SvgIcon name="arrow" className="rotate-180 absolute left-4" onClick={() => navigate(-1)} />
      {children}
    </div>
  );
}

function MobileAnimateRoute(props: ModalRouteProps) {
  const { path, className, component, title, children } = props;
  const [matched, strictMatched] = useMatched(path, true);
  const { disableAnimation } = useNavigateContext();
  if (disableAnimation && !matched) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {matched && (
        <Animate.Route
          modal
          className={cn('fixed inset-0 z-modal bg-layer2 overflow-auto overscroll-none no-scrollbar', className)}
          strict={strictMatched}
        >
          <Suspense fallback={<Loading />}>
            {title && <BackTitle>{title}</BackTitle>}
            <div style={{ minHeight: title ? 'calc(100% - 47px)' : 'calc(100% + 1px)' }} className={cn(title && 'p-4')}>
              {children || createElement(component!)}
            </div>
          </Suspense>
        </Animate.Route>
      )}
    </AnimatePresence>,
    document.body
  );
}

export const MobileSecondaryRoute = memo(function SecondaryRoute(props: MobileSecondaryRouteProps) {
  const { title, children, component, ...rests } = props;
  return (
    <Route {...rests}>
      {title && <BackTitle className="h-12 leading-normal">{title}</BackTitle>}
      <div className="safe-bottom-area p-4 border-transparent">
        {(children as ReactNode) || createElement(component!)}
      </div>
    </Route>
  );
});
