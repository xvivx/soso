import { cloneElement, memo, PropsWithChildren, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useHistoryPopActionCallbackEffect from '@hooks/useHistoryPopActionCallbackEffect';
import useNavigate, { useNavigateContext } from '@hooks/useNavigate';
import { Button, SvgIcon } from '@components';
import { cn } from '@utils';
import useNavMenus, { useMobileIndexTradingGroup } from '@/layouts/dashboard/useNavMenus';

function MobileBottomBar() {
  const { t } = useTranslation();
  const [_, campaign] = useNavMenus();
  const menus = useMemo(() => {
    return [
      { title: t('Home'), icon: <SvgIcon name="home" />, url: '/trade-center' },
      {
        title: t('Campaign'),
        icon: <SvgIcon name="campaign" />,
        url: '/dashboard/campaign-center',
        children: campaign.children,
      },
      {
        icon: <SvgIcon name="trade" />,
        title: t('Trade'),
      },
      { title: t('Leaderboard'), icon: <SvgIcon name="leaderboard" />, url: '/dashboard/leaderboard' },
      {
        title: t('Profile'),
        icon: <SvgIcon name="profile" />,
        url: '/dashboard/personal',
      },
    ];
  }, [t, campaign]);

  return (
    <nav className="sticky bottom-0 z-modal-down select-none shadow-t">
      <SvgMask />
      <div className="absolute -top-4 inset-x-0 flex items-end pt-1">
        {menus.map((menu, key) => {
          if (key === 2) return <TradeMenu key={key}>{menu.title}</TradeMenu>;
          return (
            <Button
              key={key}
              className="flex-1 flex flex-col items-center transition-all gap-0.5 py-1.5 text-secondary"
              size="free"
              theme="transparent"
              asChild
            >
              <NavLink to={menu.url!} activeClassName={menu.url!.startsWith('#') ? '' : 'text-success'}>
                {cloneElement(menu.icon, { className: 'size-5 text-current transition-none' })}
                <div className="text-10 whitespace-nowrap font-800">{menu.title}</div>
              </NavLink>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(MobileBottomBar);

function SvgMask() {
  return (
    <div className="safe-bottom-area flex justify-center overflow-hidden border-layer4">
      <div className="w-1/2 bg-layer4 -mr-1" />
      <svg
        className="shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width="376"
        height="48"
        viewBox="0 0 376 48"
        fill="none"
      >
        <path
          d="M188 19C197.131 19 204.758 12.5586 206.584 3.97183C207.044 1.81102 208.791 0 211 0H376V48H0V0H165C167.209 0 168.956 1.81102 169.416 3.97183C171.242 12.5586 178.869 19 188 19Z"
          className="fill-layer4"
        />
      </svg>
      <div className="w-1/2 bg-layer4 -ml-1" />
    </div>
  );
}

function TradeMenu(props: PropsWithChildren) {
  const { pathname } = useLocation();
  const { children } = props;
  const [visible, toggleVisible] = useReducer((visible) => !visible, false);
  const tradingGroup = useMobileIndexTradingGroup();
  const navigate = useNavigate();
  const active = useMemo(() => tradingGroup.find((it) => it.url === pathname), [tradingGroup, pathname]);
  const { disableAnimation } = useNavigateContext();

  useHistoryPopActionCallbackEffect(visible, () => {
    visible && toggleVisible();
  });

  const shouldAnimation = !disableAnimation || visible;
  return (
    <div className="flex-1">
      <Button
        className={cn(
          'relative z-20 flex flex-col items-center gap-2 mx-auto pb-1.5',
          active || visible ? 'text-success' : 'text-secondary',
          shouldAnimation ? 'duration-300' : 'duration-0'
        )}
        size="free"
        theme="transparent"
        onClick={toggleVisible}
      >
        <div
          className={cn(
            'flex-center size-8 bg-layer4 rounded-full transition-transform -translate-y-1',
            visible && 'rotate-90',
            shouldAnimation ? 'duration-300' : 'duration-0'
          )}
        >
          <SvgIcon className="text-current size-5 transition-none" name="trade" />
        </div>
        <div className="text-10 whitespace-nowrap font-800">{children}</div>
      </Button>

      {shouldAnimation && (
        <AnimatePresence key="overlay">
          {visible && (
            <div className="fixed inset-0 overflow-auto no-scrollbar overscroll-none" onClick={toggleVisible}>
              <motion.div
                className="absolute inset-x-0 top-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ height: 'calc(100% + 1px)' }}
                transition={{ duration: 0.3 }}
              />

              <div
                className="relative z-10 flex items-end pb-17"
                style={{
                  height: 'calc(100% + 1px)',
                }}
              >
                <motion.div
                  className="detrade-card w-full mx-4 p-3 space-y-2.5 bg-layer4 text-primary font-600"
                  initial={{ y: '100%' }}
                  animate={{ y: -4 }}
                  exit={{ y: '200%' }}
                  style={{ marginBottom: 'env(safe-area-inset-bottom, 20px)' }}
                >
                  {tradingGroup
                    .filter((item) => item.bottom === undefined)
                    .map((menu, key) => {
                      const matched = menu.url === pathname;
                      return (
                        <div
                          key={key}
                          className={cn(
                            'flex items-center gap-3 h-12 px-3 py-2 rounded-2',
                            matched && 'text-brand bg-layer5'
                          )}
                          onClick={() => navigate(menu.url)}
                        >
                          {cloneElement(menu.icon, { className: matched && 'text-brand' })}
                          <div className="flex-1 text-14 font-600">{menu.title}</div>
                          {matched && <div className="size-5 border-[6px] border-success rounded-full" />}
                        </div>
                      );
                    })}
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
