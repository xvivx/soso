import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useRealtimeGame } from '@store/upDown';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, SvgIcon } from '@components';
import AnimateNumber from '@components/AnimateNumber';
import Tooltip from '@components/Tooltip';
import { cn } from '@utils';
import { request } from '@utils/axios';
import { Direction } from '@/type';

function GameStats(props: { className?: string }) {
  const { t } = useTranslation();
  const { className } = props;
  const game = useRealtimeGame();
  const { data: stats } = useSWR(
    ['up-down-statistics'],
    () => {
      return request.get<Stats>('/api/transaction/updown/order/statistics');
    },
    {
      refreshInterval: 15 * 1000,
      fallbackData: {
        livePlayers24H: 0,
        totalWinPaidAmount: 0,
        userWinRatio24H: '--',
        winPaidAmount24H: 0,
      },
    }
  );

  const { mobile, gt1366 } = useMediaQuery();
  const localCurrency = 'USDFIAT';
  const contestResults = game && game.previousRoundResult ? game.previousRoundResult.slice(mobile ? 2 : 0) : [];
  return (
    <section className={cn('flex items-center justify-between shrink-0', className)}>
      <div className="flex justify-between gap-4 text-10 text-secondary select-text">
        {gt1366 && <StatisticsItem precision={0} title={t('24h win ratio')} value={stats.userWinRatio24H} />}
        <StatisticsItem
          precision={0}
          title={mobile ? t('24h players') : t('24h Live Players')}
          value={stats.livePlayers24H}
        />
        {!mobile && (
          <StatisticsItem currency={localCurrency} title={t('24h Wins Paid')} value={stats.winPaidAmount24H} />
        )}
        <StatisticsItem currency={localCurrency} title={t('All time wins paid')} value={stats.totalWinPaidAmount} />
      </div>

      <div className="flex justify-end gap-2">
        {contestResults.map((it, index) => {
          return (
            <Tooltip
              key={it.id}
              side="top"
              align={index === contestResults.length - 1 ? 'end' : 'center'}
              content={
                <article className="w-full text-center text-primary text-14 font-400">
                  <h4>{t('Start Rate')}</h4>
                  <p className="text-16 font-600">{it.startPrice}</p>
                  <div
                    className="h-px my-2 -mx-3"
                    style={{
                      backgroundImage: `linear-gradient(90deg, rgba(172, 206, 255, 0.00) 0.49%, #ACCEFF 50.06%, rgba(172, 206, 255, 0.00) 100%)`,
                    }}
                  />
                  <h4>{t('End rate')}</h4>
                  <p className={cn('text-16 font-600', it.winSide === Direction.BuyRise ? 'text-up' : 'text-down')}>
                    {it.endPrice}
                  </p>
                </article>
              }
            >
              <Button
                className={it.winSide === Direction.BuyRise ? 'bg-up/20 text-up' : 'bg-down/20 text-down'}
                icon={<SvgIcon.Direction direction={it.winSide} className="size-3.5 s768:size-4 s1920:size-5" />}
              />
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}

export default GameStats;

type Stats = {
  livePlayers24H: number;
  totalWinPaidAmount: number;
  userWinRatio24H: string;
  winPaidAmount24H: number;
};

type Props = { precision: number; currency?: never } | { precision?: never; currency: string };
function StatisticsItem(
  props: {
    value: string | number;
    title: ReactNode;
  } & Props
) {
  const { value, title, ...resetProps } = props;

  return (
    <div className="flex flex-col text-12 font-800">
      <strong className="mb-0.5 text-12 leading-5 text-primary font-800">
        {typeof value === 'string' ? value : <AnimateNumber value={value} {...resetProps} />}
      </strong>
      <span className="text-10 font-600">{title}</span>
    </div>
  );
}
