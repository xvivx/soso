import { memo, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Game, GameStatus, useAmountPool, useRealtimeGame, useWager } from '@store/upDown';
import { useCurrencyExchange, useExchanges } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import { cn, formatter } from '@utils';
import { Direction } from '@/type';
import { calcRealProfit } from './common';
import { Cutdown, CutdownInstance } from './components';

interface HeaderItemProps {
  direction: Direction;
}

function PreviewHeader() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const game = useRealtimeGame();
  const cutdownRef = useRef<CutdownInstance>(null);
  const gameRef = useRef<Game>();
  gameRef.current = game;

  useEffect(() => {
    if (!cutdownRef.current || !game.status) return;

    if (game.status === GameStatus.STARTED) {
      cutdownRef.current.start();
    }
  }, [game.status]);

  // 距离停止下注的时间
  const toEndPlaceTime = useMemo(() => {
    if (game.status === GameStatus.STARTED) {
      const { priceStartTime, currentTime } = gameRef.current!;
      return Math.round((priceStartTime - currentTime) / 1000);
    }

    return 0;
  }, [game.status]);

  // 倒计时结束时要显示状态
  const cutdownStatus = useMemo(() => {
    if (!game.status) return;

    if (game.status === GameStatus.CUTOFF_TRADE) {
      return 'waiting';
    }

    if (game.status === GameStatus.PAY_OUT || game.status === GameStatus.FINISHED) {
      return 'finished';
    }
  }, [game.status]);

  const HeaderItem = mobile ? MobileHeaderItem : PcHeaderItem;
  const updateStyle = useMemo(() => (leftTime: number) => updateCutdownStyle(leftTime, cutdownStatus), [cutdownStatus]);

  return (
    <div className="flex s768:gap-4">
      <HeaderItem direction={Direction.BuyRise} />
      <Cutdown.Circle
        className="size-18 s768:size-25 shrink-0"
        key={game.id}
        countTime={toEndPlaceTime}
        ref={cutdownRef}
        updateStyle={updateStyle}
      >
        {(leftTime) => (
          <div className="flex-col size-full abs-center flex-center">
            {/* 合并等待结果状态和动画等待状态 */}
            {cutdownStatus === 'waiting' || leftTime <= 0 ? (
              <div className="size-full gap-1 flex-center">
                {new Array(5).fill(0).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-full cutdown-waiting bg-brand"
                    style={{
                      animationDelay: `${index * 140}ms`,
                      width: '4.412%',
                      height: '17.647%',
                    }}
                  />
                ))}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'leading-none text-24 s1440:text-30 s1920:text-36 font-600',
                    leftTime < 10 && 'cutdown-bounce-in'
                  )}
                >
                  {leftTime}
                </div>
                <div className="text-12 s1920:text-14 font-400">{t('Sec')}</div>
              </>
            )}
          </div>
        )}
      </Cutdown.Circle>
      <HeaderItem direction={Direction.BuyFall} />
    </div>
  );
}

function PcHeaderItem(props: HeaderItemProps) {
  const { direction } = props;
  const isBuyFall = direction === Direction.BuyFall;
  const [investment, profit, roi] = useProfitAndRoi(direction);
  const { t } = useTranslation();
  const currency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <section className="flex justify-between flex-1">
      <article className={cn(isBuyFall ? 'order-3' : 'order-1')}>
        <h4 className="mb-1 text-12 text-secondary font-500">{t('Your investment')}</h4>
        <p className={cn('text-16 font-700 mb-3', isBuyFall ? 'text-down' : 'text-up text-right')}>
          {formatter.amount(investment / exchange[currency], currency).toText()}
        </p>

        <h4 className={cn('mb-1 text-12 text-secondary', !isBuyFall && 'text-right w-full')}>
          {t('Potential Return')}
        </h4>
        <p className={cn('text-16 font-700 mb-3', isBuyFall ? 'text-down' : 'text-up text-right')}>
          {formatter
            .amount(profit / exchange[currency], currency)
            .floor()
            .toText()}
        </p>
      </article>

      <article className={cn('flex flex-col order-2', isBuyFall ? 'items-end' : 'items-start')}>
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-12 font-600',
            isBuyFall ? 'bg-down/10 text-down' : 'bg-up/10 text-up'
          )}
        >
          {isBuyFall ? t('Down Wins') : t('Up Wins')}
        </span>
        <strong className={cn('font-700 text-50', isBuyFall ? 'text-down' : 'text-up')}>
          {formatter.percent(roi.toFixed(0))}
        </strong>
      </article>
    </section>
  );
}

export default memo(PreviewHeader);

function MobileHeaderItem(props: HeaderItemProps) {
  const { direction } = props;
  const [investment, profit, roi] = useProfitAndRoi(direction);
  const isBuyFall = direction === Direction.BuyFall;
  const { t } = useTranslation();
  const currency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <section className={cn('flex flex-col flex-1 font-600', isBuyFall ? 'items-end' : 'items-start')}>
      <h4 className={cn('text-10', isBuyFall ? 'text-down' : 'text-up')}>
        {isBuyFall ? t('Down Wins') : t('Up Wins')}
      </h4>

      <strong className={cn('text-20 s768:text-26 ', isBuyFall ? 'text-down' : 'text-up')}>
        {formatter.amount(investment / exchange[currency], currency).toText()}
      </strong>
      <span className={cn('text-10 ', isBuyFall ? 'text-down' : 'text-up')}>
        (
        {formatter
          .amount(profit / exchange[currency], currency)
          .floor()
          .toText()}
        )
      </span>
      <p className={cn('text-16 ', isBuyFall ? 'text-down' : 'text-up')}>{formatter.percent(roi)}</p>
    </section>
  );
}

function useProfitAndRoi(direction: Direction) {
  const game = useRealtimeGame();
  const amountPool = useAmountPool();
  const [wager] = useWager();
  const exchange = useCurrencyExchange();
  const investment = Number(wager) * exchange || 0;
  // 收益
  const profit = useMemo(() => {
    if (!game) return investment;

    return calcRealProfit(investment, direction, game, amountPool, true);
  }, [game, direction, investment, amountPool]);

  const roi = investment ? profit / investment : 0;
  return [investment, profit, roi];
}

const updateCutdownStyle = (leftTime: number, status?: 'waiting' | 'finished') => {
  if (status || leftTime === 0) {
    return {
      container: 'text-brand',
      shadow: 'stroke-brand',
      progress: 'stroke-brand',
    };
  }

  if (leftTime >= 10 && leftTime <= 15) {
    return {
      container: 'text-warn',
      shadow: 'stroke-warn/20',
      progress: 'stroke-warn',
    };
  } else if (leftTime < 10) {
    return {
      container: 'text-error',
      shadow: 'stroke-error/20',
      progress: 'stroke-error',
    };
  } else {
    return {
      container: 'text-up',
      shadow: 'stroke-up/20',
      progress: 'stroke-up',
    };
  }
};
