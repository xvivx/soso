import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrders } from '@store/upDown';
import { useExchanges } from '@store/wallet';
import { AnimateNumber } from '@components';
import { cn } from '@utils';
import { Direction } from '@/type';
import { animateOptions, useGameResult, useWinAmount } from '../common';

function MobileResultAnimation() {
  const [winDirection, showResultAnimation] = useGameResult();

  return (
    <div className={cn('absolute inset-0 z-10 flex overflow-hidden', showResultAnimation && 'bg-layer5')}>
      <AnimatePresence>
        {(!showResultAnimation || winDirection === Direction.BuyRise) && (
          <ResultItem
            key={Direction.BuyRise}
            direction={Direction.BuyRise}
            showAnimation={showResultAnimation}
            winDirection={winDirection}
          />
        )}
        {(!showResultAnimation || winDirection === Direction.BuyFall) && (
          <ResultItem
            key={Direction.BuyFall}
            direction={Direction.BuyFall}
            showAnimation={showResultAnimation}
            winDirection={winDirection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ResultItemProps {
  className?: string;
  direction: Direction;
  showAnimation: boolean;
  winDirection: Direction | null;
}

function ResultItem(props: ResultItemProps) {
  const { direction, className, winDirection, showAnimation } = props;
  const isBuyFall = direction === Direction.BuyFall;
  const orders = useOrders(direction);
  const isWinner = winDirection === direction;
  const winAmount = useWinAmount(direction);
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <motion.div
      className={cn(
        'relative flex-1 overflow-hidden',
        isBuyFall ? 'pl-4' : 'pr-4',
        isWinner ? 'text-up shrink-0 !z-10' : 'text-down',
        className
      )}
      animate={isWinner && showAnimation && { flexBasis: '100%' }}
      exit={{ flexBasis: '50%' }}
      transition={animateOptions}
    >
      <motion.div
        className="absolute inset-0 -z-10 bg-layer3"
        style={{
          backgroundImage: isBuyFall
            ? 'linear-gradient(90deg, rgba(255, 84, 73, 0.00) 0%, rgba(255, 84, 73, 0.18) 49.61%, rgba(255, 84, 73, 0.00) 100%)'
            : 'linear-gradient(90deg, rgba(46, 204, 113, 0.00) 0%, rgba(46, 204, 113, 0.18) 49.61%, rgba(46, 204, 113, 0.00) 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={animateOptions}
      />

      <motion.div
        className={cn(
          'flex flex-col justify-center gap-2 h-full py-1',
          isBuyFall && 'items-start',
          isWinner && showAnimation && 'items-center'
        )}
        initial={{ y: -28 }}
        animate={{ y: 0 }}
        transition={animateOptions}
      >
        <div className={cn('flex items-center flex-nowrap gap-1', !isBuyFall && 'justify-end')}>
          <div className="text-16 font-600">{orders.length}</div>
          <motion.div
            className="text-14 font-400 uppercase"
            initial={{ marginLeft: 100 }}
            animate={{ marginLeft: 2 }}
            transition={animateOptions}
          >
            {isWinner ? 'Winner' : 'Loser'}
          </motion.div>
        </div>
        <AnimateNumber
          className={cn('text-14 font-600', !isBuyFall && 'text-right')}
          value={winAmount / exchange[localCurrency]}
          currency={localCurrency}
          immediate={false}
          duration={1}
        />
      </motion.div>
    </motion.div>
  );
}

export default memo(MobileResultAnimation);
