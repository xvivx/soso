import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useAmountPool, usePlayers, useRealtimeGame } from '@store/upDown';
import { useUserInfo } from '@store/user';
import { useExchanges } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import { AnimateNumber, Avatar, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { Direction } from '@/type';
import { animateOptions, useWinAmount } from '../common';

const AnimateAvatar = motion.create(Avatar);

type PlayerListProps = {
  direction: Direction;
  className?: string;
  showResultAnimation: boolean;
};

const variants: Variants = {
  visible: { opacity: 1, flexBasis: '100%' },
  hidden: { opacity: 0, transitionEnd: { display: 'none' } },
  initial: { opacity: 1, display: 'block' },
};

function PlayerList(props: PlayerListProps) {
  const { id: userId } = useUserInfo().data;
  const [showMorePlayers, setShowMorePlayers] = useState(false);
  const { direction, showResultAnimation, className } = props;
  const isBuyFall = direction === Direction.BuyFall;
  const game = useRealtimeGame();
  const amountPool = useAmountPool();
  const players = usePlayers(direction);

  const winAmount = useWinAmount(direction);
  const { gt1024 } = useMediaQuery();
  // 前面11个订单
  const front11 = useMemo(() => {
    return players.slice(0, 11);
  }, [players]);

  // 前11个订单中最大的金额
  const maxAmount = useMemo(() => {
    if (!front11.length) return 0;
    return Math.max(...front11.slice(0, 10).map((it) => it.amount));
  }, [front11]);

  useEffect(() => {
    function onEscKeyUp(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowMorePlayers(false);
      }
    }

    document.body.addEventListener('keyup', onEscKeyUp, false);
    return () => {
      document.body.removeEventListener('keyup', onEscKeyUp);
    };
  }, []);

  useEffect(() => {
    setShowMorePlayers(false);
  }, [game.winSide]);

  const isWinner = game.winSide === direction;
  const animating = game.winSide && showResultAnimation;
  const animate = animating ? (isWinner ? 'visible' : 'hidden') : 'initial';
  const { t } = useTranslation();
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <Fragment key={direction}>
      <motion.div
        className={cn('flex-1 w-0 truncate', isBuyFall ? 'text-down' : 'text-up', isWinner && 'shrink-0', className)}
        variants={variants}
        animate={animate}
        transition={animating ? animateOptions : { duration: 0 }}
      >
        {/* header */}
        <div className="mb-4 text-center">
          <SvgIcon.Direction
            direction={direction}
            className={cn(
              'mx-auto size-10 s1366:size-11 s1920:size-13 rounded-full mb-2 p-1.5 text-white pointer-events-none',
              isBuyFall ? 'bg-down' : 'bg-up'
            )}
          />
          <span className="text-18 font-600">{isBuyFall ? t('Down') : t('Up')}</span>
        </div>

        <div className="relative">
          {/* 结果展示 */}
          {!!game.winSide && (
            <motion.div
              className="absolute inset-0 flex-center"
              style={{
                backgroundImage:
                  direction === Direction.BuyFall
                    ? 'linear-gradient(180deg, rgba(255, 78, 84, 0.00) 0%, rgba(255, 78, 84, 0.18) 49.61%, rgba(255, 78, 84, 0.00) 100%)'
                    : 'linear-gradient(180deg, rgba(49, 167, 141, 0.00) 0%, rgba(49, 167, 141, 0.18) 49.61%, rgba(49, 167, 141, 0.00) 100%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={cn('text-center font-700 text-24 s1440:text-36', isWinner ? 'text-up' : 'text-down')}>
                <div>{players.length}</div>
                <motion.div
                  style={{ lineHeight: '200px' }}
                  animate={{ lineHeight: '32px' }}
                  transition={animateOptions}
                >
                  {isWinner ? t('Winner') : t('Loser')}
                </motion.div>
                <AnimateNumber
                  value={winAmount / exchange[localCurrency]}
                  currency={localCurrency}
                  duration={1}
                  immediate={false}
                />
              </div>
            </motion.div>
          )}

          {/* 玩家列表 */}
          <motion.div
            animate={game.winSide ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
            transition={game.winSide ? animateOptions : { duration: 0 }}
          >
            <div
              className={cn(
                'relative mb-4 p-3 border-t-4 rounded-t-2 bg-gradient-to-b to-transparent',
                isBuyFall ? 'border-down from-down/20' : 'border-up from-up/20'
              )}
            >
              <div className={cn('flex mb-6 text-12 font-400', isBuyFall ? 'text-down' : 'text-up')}>
                <div className="mr-1 text-secondary">{t('Players')}</div>
                <div className="font-600">{players.length}</div>
                <div className="flex-1 text-right">
                  {formatter
                    .amount(
                      (isBuyFall ? amountPool.downPoolAmount : amountPool.upPoolAmount) / exchange[localCurrency],
                      localCurrency
                    )
                    .toText()}
                </div>
              </div>
              <div className="flex justify-between text-14 text-primary font-500">
                <div>{t('Players')}</div>
                <div>{t('Bet')}</div>
              </div>
              <div
                className={cn(
                  'absolute bottom-0 inset-x-0 h-px bg-layer5 light:bg-layer2',
                  isBuyFall ? '-mr-1.5 s1920:-mr-2' : '-ml-1.5 s1920:-ml-2'
                )}
              />
            </div>
            {/* 列表 */}
            <div className="text-primary mb-3 overflow-hidden" style={{ height: 424 }}>
              {front11.map((item, index) => {
                return (
                  <motion.div
                    key={item.id}
                    className={cn(
                      'relative flex items-center h-7 w-full mb-4 pr-1',
                      'text-12 s1920:text-14 rounded overflow-hidden',
                      isBuyFall ? 'float-right' : 'float-left'
                    )}
                    layout
                    style={{ zIndex: 11 - index }}
                    initial={index === 0 ? { marginTop: -44, width: 0, opacity: 0 } : false}
                    animate={index === 0 ? { marginTop: 0, width: '100%', opacity: 1 } : false}
                    transition={{ animateOptions }}
                  >
                    <Avatar className="mr-2" size="md" src={item.privateHide ? '' : item.avatar} />
                    <div className="relative z-10 mr-2 truncate font-600 s1440:font-700">
                      {item.privateHide ? '***' : item.name}
                    </div>
                    <div className="relative z-10 flex justify-end flex-1 mr-1">
                      <AnimateNumber
                        value={item.amount / exchange[localCurrency]}
                        currency={localCurrency}
                        immediate={false}
                        duration={1}
                        delay={animateOptions.duration}
                      />
                    </div>
                    {/* <SvgIcon name="solidUSDT" className="z-10 w-5 h-5 shrink-0 text-brand" /> */}
                    <motion.div
                      className={cn(
                        'absolute inset-y-1 left-10 right-0 origin-right',
                        'bg-gradient-to-l to-transparent',
                        isBuyFall
                          ? item.id === userId
                            ? 'from-down/80'
                            : 'from-down/20'
                          : item.id === userId
                            ? 'from-up/80'
                            : 'from-up/20'
                      )}
                      style={{ scaleX: 0 }}
                      animate={{ scaleX: item.amount / maxAmount }}
                      transition={animateOptions}
                    />
                  </motion.div>
                );
              })}
            </div>
            {/* 列表底部more部分: 点击显示全部订单 */}
            <div
              className={cn(
                'h-9 rounded-full cursor-pointer overflow-hidden border-2 border-transparent bg-layer4',
                players.length >= 11
                  ? 'visible w-full opacity-100 transition-all'
                  : 'invisible w-1/2 opacity-50 transition-none'
              )}
              style={{
                backgroundClip: 'padding-box, border-box',
                backgroundOrigin: 'padding-box, border-box',
                backgroundImage:
                  'linear-gradient(to right, var(--bg-layer4), var(--bg-layer4)),linear-gradient(to right, #61FFD9, #CF87FC)',
              }}
            >
              {players.length >= 11 && (
                <div
                  className="flex flex-nowrap items-center justify-between h-full p-2"
                  onClick={() => setShowMorePlayers(true)}
                >
                  <div
                    className="flex items-center h-5 overflow-hidden rounded-full shrink-0 flex-nowrap"
                    style={{ width: 68 }}
                  >
                    {players.slice(10, 15).map((it, index) => {
                      return (
                        <AnimateAvatar
                          key={it.id}
                          size="xs"
                          src={it.avatar}
                          className={cn('shrink-0 border border-white', index === 3 && 'relative z-10')}
                          initial={index === 0 ? { marginLeft: -20 } : { marginLeft: -4 }}
                          animate={{ marginLeft: index === 0 ? 0 : -4 }}
                        />
                      );
                    })}
                  </div>

                  {players.length > (gt1024 ? 14 : 13) && (
                    <div className="flex items-center overflow-hidden shrink-0 flex-nowrap text-12 text-primary font-600">
                      <span className="whitespace-nowrap">{`${players.length - (gt1024 ? 14 : 13)} +`}</span>
                      <SvgIcon name="arrow" className="size-4" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* 所有玩家的列表 */}
      <AnimatePresence>
        {showMorePlayers && (
          <motion.div
            className={cn(
              'absolute inset-x-0 bottom-0 z-20 rounded-4 text-center overflow-hidden bg-layer4',
              isBuyFall ? 'text-down' : 'text-up'
            )}
            initial={{ y: '100%' }}
            style={{
              boxShadow: `0px 8px 40px 0px rgba(0, 0, 0, 0.17), 0px 12px 32px -16px rgba(0, 0, 0, 0.27)`,
            }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ damping: false, duration: 0.2 }}
          >
            <div
              className="p-4 uppercase pb-9 text-16 font-600"
              style={{
                backgroundImage: isBuyFall
                  ? `linear-gradient(180deg, rgb(var(--down) / 0.2) 0%, rgba(0, 0, 0, 0) 68.67%)`
                  : `linear-gradient(180deg, rgb(var(--up) / 0.2) 0%, rgba(0, 0, 0, 0) 68.67%)`,
              }}
            >
              {isBuyFall ? 'Down Players' : 'Up Players'}
              <SvgIcon
                name="close"
                className="absolute z-10 top-4 right-4 bottom-4"
                onClick={() => setShowMorePlayers(false)}
              />
            </div>

            <div className="grid grid-cols-4 auto-rows-max h-[364px] gap-y-8 py-4 text-primary overflow-auto no-scrollbar">
              {players.map((item) => {
                return (
                  <div key={item.id} className="flex flex-col items-center">
                    <Avatar className="mb-2" src={item.avatar} size="lg" />
                    <div className="text-14 font-600">
                      {formatter.amount(item.amount / exchange[localCurrency], localCurrency).toText()}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}

export default memo(PlayerList);
