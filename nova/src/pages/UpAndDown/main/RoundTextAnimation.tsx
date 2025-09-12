import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { GameStatus, useRealtimeGame } from '@store/upDown';
import { cn } from '@utils';
import { animateOptions } from '../common';

function RoundTextAnimation() {
  const { t } = useTranslation();
  const game = useRealtimeGame();
  const styles = useMemo(
    () => ({
      leftTopText: 'absolute left-4 top-0 z-10 s768:text-16 s1024:text-14 s1440:text-18 font-700 text-primary',
      centerText: 'abs-center text-primary text-36 font-600 whitespace-nowrap',
    }),
    []
  );

  return (
    <AnimatePresence>
      {game.status === GameStatus.STARTED && (
        <motion.div
          key="1"
          className={cn(styles.leftTopText, 'overflow-hidden')}
          style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
          animate={{ left: 16, top: 0, x: 0, y: 0 }}
          transition={animateOptions}
        >
          <div>{t('Round In Progress')}</div>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ ...animateOptions, delay: animateOptions.duration }}
          >
            {t('Place Your Trade')}
          </motion.div>
        </motion.div>
      )}

      {game.status === GameStatus.CUTOFF_TRADE && (
        <motion.div
          key="2"
          className={cn(styles.leftTopText)}
          style={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ opacity: 0 }}
          transition={animateOptions}
        >
          <div>{t('No More Orders')}!</div>
          <div>{t('Wait For Next Round')}</div>
        </motion.div>
      )}

      {game.status === GameStatus.START_PAY_OUT && (
        <motion.div
          key="3"
          className={styles.centerText}
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          transition={animateOptions}
        >
          {t('Distributing Payout')}!
        </motion.div>
      )}

      {game.status === GameStatus.FINISHED && (
        <motion.div
          key="4"
          className={styles.centerText}
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
          transition={animateOptions}
        >
          {t('Money Distributed')}!
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RoundTextAnimation;
