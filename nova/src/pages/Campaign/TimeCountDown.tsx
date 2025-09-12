import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';

interface Timer {
  showDay?: boolean;
  time: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  compact?: boolean;
}
function TimeCountDown(props: Timer) {
  const { t } = useTranslation();
  const { time, showDay = false, compact = false } = props;
  const css = 'mx-1 s768:mx-2 text-20 s768:text-24 text-secondary';
  return (
    <div className="flex items-center">
      {showDay && (
        <>
          <TimeLayout title={t('Day')} time={time.days} compact={compact} />
          <b className={css}>:</b>
        </>
      )}
      <TimeLayout title={t('Hour')} time={time.hours} compact={compact} />
      <b className={css}>:</b>
      <TimeLayout title={t('Minute')} time={time.minutes} compact={compact} />
      <b className={css}>:</b>
      <TimeLayout title={t('Second')} time={time.seconds} compact={compact} />
    </div>
  );
}

export default memo(TimeCountDown);

function TimeLayout(props: { title: string; time: string; compact?: boolean }) {
  const { title, time, compact } = props;
  return (
    <div className={cn('flex flex-col items-center py-2 bg-layer2 rounded-2 text-center w-14', compact && 'w-10')}>
      <div className="s768:text-20 font-800">{time}</div>
      <div className={cn('font-400', compact ? 'text-9 s768:text-10' : 'text-10')}>{title}</div>
    </div>
  );
}
