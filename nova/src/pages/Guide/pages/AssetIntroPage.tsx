import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@hooks/useResponsive';
import coinGroupM from '../assets/coin-group-m.png';
import coinGroup from '../assets/coin-group.png';
import AdaptiveImage from '../components/AdaptiveImage';
import AdaptiveText from '../components/AdaptiveText';
import AnimatedButton from '../components/AnimatedButton';

const Page3: React.FC<{ nextPage: () => void }> = ({ nextPage }) => {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  return (
    <>
      <div className=" flex items-start  justify-start s1024:justify-center min-h-0 relative z-10 pt-8 s768:pt-16 -mx-4">
        <AdaptiveImage
          src={!mobile ? coinGroup : coinGroupM}
          alt="Coin Group"
          style={{ maxHeight: '55vh', aspectRatio: '1200 / 540' }}
        />
      </div>
      <motion.div
        className="pb-6 mt-auto s768:mt-24 s1024:mt-16 s1440:mt-24 s1920:mt-15 s1024:mb-0 flex-shrink-0 text-center z-10 max-w-4xl mx-auto space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <AdaptiveText level="h1" className="mb-2">
          {t('The Profit Margin Is As High As 90%')}
        </AdaptiveText>
        <AdaptiveText level="p" className="mb-6">
          {t('Over 70 popular crypto assets. Trade and increase your balance')}
        </AdaptiveText>
        <AnimatedButton onClick={nextPage} className="mx-auto shadow-2xl">
          {t('Next')} <span className="ml-2">↓</span>
        </AnimatedButton>
      </motion.div>
    </>
  );
};

export default React.memo(Page3);
