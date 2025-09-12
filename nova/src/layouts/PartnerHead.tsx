import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from '@hooks/useResponsive';
import { SvgIcon } from '@components';
import { cn } from '@utils';
import Logo from '@pages/components/Logo';
import LocalePopover from './I18nSelector';

function MobileHeader(props: BaseProps) {
  const [show, setShow] = useState(false);
  const { children } = props;
  const { pathname } = useLocation();

  useEffect(() => {
    setShow(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex items-center justify-between w-full gap-3 p-4 h-18 bg-primary">
        <Logo className="cursor-pointer" />
        <div className="flex items-center gap-3">
          <LocalePopover />
          <div onClick={() => setShow((_) => !_)}>
            {show ? (
              <SvgIcon name="close" className="text-primary" />
            ) : (
              <SvgIcon name="menuOff" className="text-primary" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed bottom-0 flex flex-col w-full gap-5 px-4 py-6 top-18 bg-primary"
            initial={{ y: '-100%', zIndex: 49 }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PcHeader(props: BaseProps) {
  const { children } = props;

  return (
    <header className="h-18 bg-[#0D1116] flex items-center justify-between px-4 fixed z-50 top-0 inset-x-0">
      <Logo className="cursor-pointer" />
      {children}
    </header>
  );
}

// to b header
function PartnerHead() {
  const { pathname } = useLocation();
  const { mobile, gt1024 } = useMediaQuery();
  const { t } = useTranslation();

  const anchors = useMemo(() => {
    return [
      {
        to: '/partner/calculator',
        label: t('Calculator'),
      },
      {
        to: '/partner/advantage',
        label: t('Advantage'),
      },
      {
        to: '/partner/program',
        label: t('Partner Program'),
      },
      {
        to: '/partner/security',
        label: t('Security'),
      },
      {
        to: '/partner/contact/us',
        label: t('Contact Us'),
      },
      // {
      //   to: '/partner/dashboard',
      //   label: 'Dashboard',
      // },
    ];
  }, [t]);

  useEffect(() => {
    const target = document.getElementById(pathname);
    if (!target) return;
    const timer = setTimeout(() => {
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (mobile) {
    return (
      <MobileHeader>
        {anchors.map((it) => {
          return (
            <NavLink
              className="px-4 transition-all text-16 font-500 text-primary"
              key={it.to}
              to={it.to}
              activeClassName="text-brand"
              onClick={() => {
                const target = document.getElementById(it.to);

                if (target) {
                  window.scrollTo({ top: target.offsetTop - 88, behavior: 'smooth' });
                }
              }}
            >
              {it.label}
            </NavLink>
          );
        })}
      </MobileHeader>
    );
  }

  return (
    <PcHeader>
      <div className="flex-1 gap-2 flex-center s1024:gap-11">
        {anchors.map((it, index) => {
          return (
            <NavLink
              className={cn('transition-all', (index === 0 || index === 1) && !gt1024 && 'hidden')}
              key={it.to}
              to={it.to}
              activeClassName="text-brand"
              onClick={() => {
                const target = document.getElementById(it.to);

                if (target) {
                  window.scrollTo({ top: target.offsetTop - 88, behavior: 'smooth' });
                }
              }}
            >
              {it.label}
            </NavLink>
          );
        })}
      </div>
      <LocalePopover />
    </PcHeader>
  );
}

export default PartnerHead;
