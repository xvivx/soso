import React, { useMemo } from 'react';
import { useDrag } from '@use-gesture/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from '@hooks/useResponsive';
import CloseButton from './components/CloseButton';
import PageContainer from './components/PageContainer';
import PageIndicator from './components/PageIndicator';
import ResponsiveContainer from './components/ResponsiveContainer';
import { CONSTANTS } from './constants';
import { useGuideNavigation } from './hooks';
import AccountTypeGuidePage from './pages/AccountTypeGuidePage';
import AssetIntroPage from './pages/AssetIntroPage';
import HighLowGuidePage from './pages/HighLowGuidePage';
import HomePage from './pages/HomePage';
import TradingOptionsPage from './pages/TradingOptionsPage';

const Index: React.FC = () => {
  const { currentPage, nextPage, navigateToPage } = useGuideNavigation(CONSTANTS.TOTAL_PAGES);
  const { mobile } = useMediaQuery();

  const bind = useDrag(
    ({ last, movement: [, my], direction: [, dy], velocity: [, vy] }) => {
      const trigger = Math.abs(my) > 50 || Math.abs(vy) > 0.5;
      if (last && trigger) {
        if (dy > 0 && currentPage > 0) {
          navigateToPage(currentPage - 1);
        } else if (dy < 0) {
          nextPage();
        }
      }
    },
    {
      axis: 'y',
      enabled: mobile,
      threshold: 10,
    }
  );
  const pages = useMemo(
    () => [
      () => <HomePage nextPage={nextPage} />,
      () => <TradingOptionsPage nextPage={nextPage} />,
      () => <AssetIntroPage nextPage={nextPage} />,
      () => <HighLowGuidePage nextPage={nextPage} />,
      () => <AccountTypeGuidePage />,
    ],
    [nextPage]
  );

  const pageConfigs = [
    { spacing: 'compact' as const, className: 'px-4 py-0' }, // Home
    { spacing: 'compact' as const, className: 'px-4' }, // TradingOptions
    { spacing: 'normal' as const, className: 'px-4' }, // Page3
    { spacing: 'compact' as const, className: 'px-4.5' }, // Page4
    { spacing: undefined, className: '' }, // Page5
  ];

  return (
    <div
      className="z-[2] relative h-screen overflow-hidden"
      {...bind()}
      style={{ touchAction: mobile ? 'pan-x' : 'auto' }}
    >
      <CloseButton />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="h-full"
        >
          <PageContainer>
            <ResponsiveContainer
              spacing={pageConfigs[currentPage].spacing}
              className={pageConfigs[currentPage].className}
            >
              {pages[currentPage]()}
            </ResponsiveContainer>
            {!mobile && <PageIndicator currentPage={currentPage} totalPages={CONSTANTS.TOTAL_PAGES} />}
          </PageContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
