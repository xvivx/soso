import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useCountDownTimeByUTC from '@hooks/useCountDownTimeByUTC';
import { useMediaQuery } from '@hooks/useResponsive';
import { Accordion, Button, Modal, SvgIcon, Tooltip } from '@components';
import { cn } from '@utils';
import { getServerTime } from '@utils/axios';
import FairnessValidator from './FairnessValidator';
import StonksProvablyFair from './StonksProvablyFair';

function StonksTimeDown({ className }: BaseProps) {
  const { t } = useTranslation();
  const serverTime = getServerTime();

  // 下一个UTC 0点
  const targetUTCTime = useMemo(() => {
    return Date.UTC(
      new Date(serverTime).getUTCFullYear(),
      new Date(serverTime).getUTCMonth(),
      new Date(serverTime).getUTCDate() + 1
    );
  }, [serverTime]);

  const time = useCountDownTimeByUTC(targetUTCTime);

  return (
    <div className={cn('flex items-center flex-nowrap gap-2 whitespace-nowrap text-12 px-4 s768:px-0', className)}>
      <Tooltip
        content={t(
          'The price will be reset to $1,000 at 00:00 UTC every day, and any pending orders will be automatically settled during the reset.'
        )}
        side="right"
        trigger="hover"
      >
        <SvgIcon className="size-4" name="info" />
      </Tooltip>
      <div className="text-secondary font-500">{t('Round ends in')}</div>
      <div className="flex items-center gap-1">
        <Button className="bg-layer7 text-primary" theme="transparent" size="sm" icon={time.hours} />
        <div>:</div>
        <Button className="bg-layer7 text-primary" theme="transparent" size="sm" icon={time.minutes} />
        <div>:</div>
        <Button className="bg-layer7 text-primary" theme="transparent" size="sm" icon={time.seconds} />
      </div>
      <VerifyFairness />
    </div>
  );
}

function VerifyFairness() {
  const { t } = useTranslation();
  const { gt768 } = useMediaQuery();

  const collapseList = useMemo(() => {
    return [
      {
        title: t('Provably fair'),
        content: <StonksProvablyFair />,
      },
      {
        title: t('Verify fairness'),
        content: <FairnessValidator />,
      },
    ];
  }, [t]);

  return (
    <Button
      className="bg-layer7 text-primary"
      onClick={() => {
        Modal.open({
          title: t('Verify fairness'),
          children: <Accordion items={collapseList} type="single" />,
          size: 'lg',
        });
      }}
      theme="transparent"
      size="sm"
    >
      <>
        <SvgIcon name="fair" className="size-5 mr-1" />
        {gt768 && <div className="text-10 s768:text-12 font-500">{t('Verify fairness')}</div>}
      </>
    </Button>
  );
}

export default StonksTimeDown;
