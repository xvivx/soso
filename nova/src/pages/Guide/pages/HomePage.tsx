import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@hooks/useResponsive';
import peopleGroupM from '../assets/people-group-m.png';
import peopleGroup from '../assets/people-group.png';
import AdaptiveImage from '../components/AdaptiveImage';
import AdaptiveText from '../components/AdaptiveText';
import AnimatedButton from '../components/AnimatedButton';

const HomePage: React.FC<{ nextPage: () => void }> = ({ nextPage }) => {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  return (
    <>
      <div className="flex-1 s768:flex-none flex items-start justify-center relative z-10 pt-8 s768:pt-16 -mx-4">
        <AdaptiveImage
          src={!mobile ? peopleGroup : peopleGroupM}
          alt="People Group"
          style={{ aspectRatio: '1264 / 448' }}
          heightClass="max-h-[45vh] s768:max-h-[50vh] s1024:max-h-[55vh]"
        />
      </div>
      <motion.div
        className="s1024:mt-24 s1920:mt-40 flex-shrink-0 text-center z-10 max-w-4xl mx-auto  pb-8 s768:pb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <AdaptiveText level="h1" className="mb-2">
          {t('Win Crypto Tokens')}
        </AdaptiveText>
        <AdaptiveText level="p" className="mb-8">
          {t('Discover trending tokens. Trade. Earn. Repeat.')}
        </AdaptiveText>
        <AnimatedButton onClick={nextPage} className="mx-auto shadow-2xl">
          {t('Next')} <span className="ml-2">↓</span>
        </AnimatedButton>
      </motion.div>
    </>
  );
};

export default React.memo(HomePage);
