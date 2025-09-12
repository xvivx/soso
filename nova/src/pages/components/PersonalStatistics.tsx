import { Fragment, memo, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, Modal, SvgIcon } from '@components';
import { cn, formatter, request } from '@utils';
import { PathTradeCenter } from '@/routes/paths';

interface PersonalStatisticsProps {
  userId: string;
  platformName: string;
  isSameTipsId?: boolean;
  close?: () => void;
}

interface StatisticsInfo {
  avatar: string;
  bonus: string;
  joinedOn: string;
  likeBest: BET_TYPE;
  maxProfit: string;
  maxWager: string;
  nickname: string;
  rakeBack: string;
  tip: string;
  tipFrom: string;
  tipTo: string;
  totalBets: 0;
  wagered: string;
}

interface StatisticsInfo {
  avatar: string;
  bonus: string;
  joinedOn: string;
  likeBest: BET_TYPE;
  maxProfit: string;
  maxWager: string;
  nickname: string;
  rakeBack: string;
  tip: string;
  tipFrom: string;
  tipTo: string;
  totalBets: 0;
  wagered: string;
}

enum BET_TYPE {
  /** highLow */
  PLACE_BINARY_ORDER = 'PLACE_BINARY_ORDER',
  /** spread */
  PLACE_BINARY_SPREAD_ORDER = 'PLACE_BINARY_SPREAD_ORDER',
  /** 1000 */
  PLACE_CONTRACT_ORDER = 'PLACE_CONTRACT_ORDER',
  /** updown */
  PLACE_CONTEST_ORDER = 'PLACE_CONTEST_ORDER',
}

interface StatisticsInfo {
  avatar: string;
  bonus: string;
  joinedOn: string;
  likeBest: BET_TYPE;
  maxProfit: string;
  maxWager: string;
  nickname: string;
  rakeBack: string;
  tip: string;
  tipFrom: string;
  tipTo: string;
  totalBets: 0;
  wagered: string;
}

function PersonalStatistics(props: PersonalStatisticsProps) {
  const { userId, platformName } = props;
  const { data: statisticsInfo } = useUserStatistics(userId);
  const navigate = useNavigate();

  const { t } = useTranslation();
  const handleFavoriteClick = useCallback(() => {
    let path = PathTradeCenter.trade;

    switch (statisticsInfo.likeBest) {
      case 'PLACE_BINARY_ORDER':
        path = PathTradeCenter.trade;
        break;
      case 'PLACE_BINARY_SPREAD_ORDER':
        path = PathTradeCenter.spread;
        break;
      case 'PLACE_CONTRACT_ORDER':
        path = PathTradeCenter.futures;
        break;
      case 'PLACE_CONTEST_ORDER':
        path = PathTradeCenter.upDown;
        break;
    }

    Modal.close();
    navigate(path);
  }, [statisticsInfo.likeBest, navigate]);

  const renderButtonContent = (type?: BET_TYPE) => {
    switch (type) {
      case 'PLACE_BINARY_ORDER':
        return (
          <Fragment>
            <SvgIcon name="trade" className="size-5 text-brand shrink-0" />
            <span>{t('High Low')}</span>
          </Fragment>
        );
      case 'PLACE_BINARY_SPREAD_ORDER':
        return (
          <Fragment>
            <SvgIcon name="spread" className="size-5 text-brand shrink-0" />
            <span>{t('High Low Spread')}</span>
          </Fragment>
        );
      case 'PLACE_CONTRACT_ORDER':
        return (
          <Fragment>
            <SvgIcon name="contract" className="size-5 text-brand shrink-0" />
            <span>{t('1000x leverage')}</span>
          </Fragment>
        );
      case 'PLACE_CONTEST_ORDER':
        return (
          <Fragment>
            <SvgIcon name="arrowRotate" className="size-5 text-brand shrink-0" />
            <span>{t('Up Down')}</span>
          </Fragment>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center">
        <Image className="self-start object-cover size-10 rounded-2 shrink-0" src={statisticsInfo?.avatar} />
        <div className="flex flex-col flex-1 ml-4">
          <span className="text-primary text-14 font-500">{statisticsInfo?.nickname}</span>
        </div>
      </div>
      <StatisticsCard
        className="relative grid grid-cols-3 gap-2 detrade-card"
        data={statisticsInfo}
        platformName={platformName}
      />
      <div className="box-border flex items-center justify-between p-3 rounded-3 bg-layer3">
        <div className="text-primary text-12 max-s768:w-28 s768:text-14 font-500 s768:leading-[18px]">
          {t('Favorite Trading Derivatives')}
        </div>
        {statisticsInfo?.likeBest && (
          <Button
            onClick={handleFavoriteClick}
            theme="transparent"
            className="bg-gradient-to-r from-brand/20 from-50% to-white/5 shrink-0 text-brand font-500 space-x-3"
          >
            {renderButtonContent(statisticsInfo?.likeBest)}
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(PersonalStatistics);

function Descriptions(props: { label: ReactNode; children: ReactNode; className?: string }) {
  const { label, children, className } = props;
  return (
    <div className={cn('flex flex-col space-y-1 box-border p-2 rounded-2 bg-layer7', className)}>
      <div className="text-secondary text-12 s768:text-14 font-500">{label}</div>
      <div className="text-primary text-14 s768:text-16 font-600">{children}</div>
    </div>
  );
}

export function useUserStatistics(userId: string) {
  return useSWR(
    ['user-statistics', userId],
    () => {
      return request.get<StatisticsInfo>('/api/account/account/statistics', { userId });
    },
    { suspense: true }
  );
}

const emptyValueString = '--';
export function StatisticsCard(props: { data: StatisticsInfo; className?: string; platformName?: string }) {
  const { t } = useTranslation();
  const { className, data } = props;

  const currency = 'USDFIAT';

  const localFormat = useCallback((value: string | number) => {
    return value !== '' ? '$' + formatter.amount(value, currency).toText(true) : emptyValueString;
  }, []);

  const localFormatUnit = useCallback((value = '') => {
    return value !== '' ? '$' + formatter.kbm(Number(value)) : emptyValueString;
  }, []);

  return (
    <div className={className}>
      <Descriptions label={t('Total Trades')}>{formatter.stringify(data.totalBets)}</Descriptions>
      <Descriptions label={t('Trading Volume')}>{localFormatUnit(data.wagered)}</Descriptions>
      <Descriptions label={t('Max TV')}>{localFormat(data.maxWager)}</Descriptions>
      <Descriptions label={t('Max Profit')}>{localFormat(data.maxProfit)}</Descriptions>
      <Descriptions label={t('Bonus')}>{localFormat(data.bonus)}</Descriptions>
      <Descriptions label={t('Rakeback')}>{localFormat(data.rakeBack)}</Descriptions>
    </div>
  );
}
