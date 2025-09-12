import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AdaptiveText from '../components/AdaptiveText';
import AnimatedButton from '../components/AnimatedButton';
import CustomTradingPanel from '../components/CustomTradingPanel';
import { useGuideChart } from '../hooks/useGuideChart';

const HighLowGuidePage: React.FC<{ nextPage: () => void }> = ({ nextPage }) => {
  const { t } = useTranslation();
  const [hasStartedDemo, setHasStartedDemo] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startGuidanceRef = useRef<(() => void) | null>(null);

  const { data } = useGuideChart(iframeRef);

  const handleStartDemo = useCallback(() => {
    if (startGuidanceRef.current) {
      startGuidanceRef.current();
      setHasStartedDemo(true);
    }
  }, []);
  const handleDemoComplete = useCallback(() => {
    nextPage();
  }, [nextPage]);

  return (
    <>
      <div className="mt-12 relative z-10 justify-center s1024:flex w-full min-h-0">
        <motion.div
          className="flex-1 overflow-hidden rounded-2 mb-0.5 s1024:mb-0 bg-layer3 pb-3"
          style={{ maxWidth: 976 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full relative h-50 s768:h-[40vh] s1024:h-[50vh]" style={{ maxHeight: 578 }}>
            <iframe
              ref={iframeRef}
              src={`${import.meta.env.BASE_URL}chart-iframe/index.html?raw`}
              className="w-full h-full rounded-2 border-none"
              title="Mock Chart"
            />
          </div>
        </motion.div>
        <motion.div
          className="flex rounded-2 flex-col ml-0.5 bg-layer3 pb-3 p-3 s768:p-4 h-auto  s1024:max-h-[590px]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <CustomTradingPanel
            onStartGuidance={hasStartedDemo ? handleDemoComplete : startGuidanceRef}
            iframeRef={iframeRef}
            historyData={data}
          />
        </motion.div>
      </div>
      {!hasStartedDemo && (
        <motion.div
          className="flex-shrink-0 text-center mt-10 pb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="space-y-2">
            <AdaptiveText level="h3">{t('High Low')}</AdaptiveText>
            <p className="text-12 s1024:text-24 mx-auto text-secondary font-500" style={{ maxWidth: 800 }}>
              {t(
                "Predict the price direction for trading. If the price moves in the direction you've chosen, you'll make a profit!"
              )}
            </p>
          </div>
          <AnimatedButton onClick={handleStartDemo} className="mx-auto shadow-2xl">
            {t('Next')} <span className="ml-2">↓</span>
          </AnimatedButton>
        </motion.div>
      )}
    </>
  );
};

export default React.memo(HighLowGuidePage);
