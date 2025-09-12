import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAmountPool, usePlayers } from '@store/upDown';
import { useExchanges } from '@store/wallet';
import { Avatar } from '@components';
import { cn, formatter } from '@utils';
import { Direction } from '@/type';
import { animateOptions } from '../common';

const AnimateAvatar = motion.create(Avatar);

type PlayerListProps = {
  direction: Direction;
  className?: string;
};

function PlayerList(props: PlayerListProps) {
  const { direction, className } = props;
  const isBuyFall = direction === Direction.BuyFall;
  const pool = useAmountPool();
  const players = usePlayers(direction);
  const variants = useMemo(() => {
    const length = 5;
    // 每两个头像之间的间隙
    const gap = `calc(${100 / (length - 1)}% - ${(24 * length) / (length - 1)}px)`;
    // 第一个头像偏移值
    const offset = `calc(${(24 * length) / (length - 1) - 24}px - ${100 / (length - 1)}%)`;
    return {
      initial: {
        marginRight: isBuyFall ? gap : offset,
        marginLeft: isBuyFall ? offset : gap,
      },
      animate: { [isBuyFall ? 'marginLeft' : 'marginRight']: 0 },
    };
  }, [isBuyFall]);

  const { t } = useTranslation();
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <div className={cn('flex-1', className)}>
      <div className={cn('flex justify-between gap-1', !isBuyFall && 'flex-row-reverse')}>
        <div className="flex items-center text-12">
          <div className="mr-1 font-600">{players.length}</div>
          <div className="font-400">{t('Players')}</div>
        </div>

        <div className="text-14 font-600">
          {formatter
            .amount((isBuyFall ? pool.downPoolAmount : pool.upPoolAmount) / exchange[localCurrency], localCurrency)
            .toText()}
        </div>
      </div>
      <motion.div
        className={cn('flex items-end flex-nowrap overflow-hidden', !isBuyFall && 'flex-row-reverse')}
        style={{ height: 0 }}
        animate={{ height: players.length > 0 ? 32 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {players.slice(0, 6).map((player) => {
          return (
            <AnimateAvatar
              key={player.id}
              className="rounded-2 border-none shrink-0"
              size="sm"
              src={player.avatar}
              variants={variants}
              initial="initial"
              animate="animate"
              transition={animateOptions}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

export default memo(PlayerList);
