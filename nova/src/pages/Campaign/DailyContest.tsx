import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import useCountDownTimeByUTC from '@hooks/useCountDownTimeByUTC';
import { useMediaQuery } from '@hooks/useResponsive';
import { AnimateNumber, Column, Image, Table } from '@components';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import subtractLefts from './assets/subtractLefts.png';
import Top1 from './assets/top1.png';
import Top2 from './assets/top2.png';
import Top3 from './assets/top3.png';
import useActivity from './hooks/useActivity';
import TimeCountDown from './TimeCountDown';

interface Daily {
  position: number;
  prizePool: number;
  quota: number;
  toReach: number;
  wager: number;
}

function DailyContest() {
  const activity = useActivity('daily');
  const [daily, setDaily] = useState<Daily>({
    position: 0,
    prizePool: 0,
    quota: 0,
    toReach: 0,
    wager: 0,
  });
  const { isTemporary } = useUserInfo().data;

  const time = useCountDownTimeByUTC(activity?.endTime);

  useEffect(() => {
    if (!activity || !activity.id) return;
    (async () => {
      try {
        const res = await request.get<Daily>('/api/promotion/activity/daily/contest/detail', {
          activityId: activity.id,
        });
        setDaily(res);
      } catch (error) {
        console.error('Failed to fetch daily contest detail:', error);
      }
    })();
  }, [activity]);

  return (
    <div className="space-y-3">
      <Contest time={time} prizePool={activity.prizePool} quota={activity.quota} />
      {!isTemporary && <MyReWards position={daily.position} toReach={daily.toReach} wager={daily.wager} />}
      <Rankings activityId={activity.id} />
      <TermsAndConditions />
    </div>
  );
}

export default DailyContest;

function Contest(props: {
  time: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  prizePool: number;
  quota: number;
}) {
  const { t } = useTranslation();
  const { time, prizePool, quota } = props;
  const { mobile } = useMediaQuery();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <TopCard className="basis-full s1024:basis-0">
        <div className="flex items-center gap-3.5 mb-1">
          <Image className="w-5" src={subtractLefts} />
          <div>
            <div className="mb-1 text-14 s768:text-16 font-700 text-success">{t('Daily contest')}</div>
            <div className="text-12 text-secondary font-500">{t('Contest prize pool')}</div>
          </div>
          <Image className="w-5 -scale-x-100" src={subtractLefts} />
        </div>
        <div className="px-3 py-1 text-center w-44 bg-layer2 rounded-2 text-success text-18 s768:text-20 font-800">
          <span>$</span>
          <AnimateNumber value={prizePool} as="span" precision={0} />
        </div>
      </TopCard>
      <TopCard className="flex-1">
        <div className="mb-3 text-14 s768:text-16 font-700 text-success">{t('Time remaining')}</div>
        <TimeCountDown time={time} compact={mobile} />
      </TopCard>
      <TopCard className="flex-1">
        <div className="text-14 s768:text-16 font-700 text-success">{t('Award quota')}</div>
        <div className="text-12 font-500 mt-1.5 mb-1 text-secondary">{t('Wager')}</div>
        <div className="flex items-center gap-2 px-3 py-1 bg-layer2 rounded-2">
          <QuotaIcon />
          <div className="font-800">
            {t('top')} {quota}
          </div>
        </div>
      </TopCard>
    </div>
  );
}

/**
 * @param position 排名数
 * @returns position >= 50返回50th+; 10 < position < 50返回十位整0数字; position <= 10返回具体位数;
 * 例如: 1 => 1st; 9 => 9th; 45 => 40th+; 1234 => 50th+;
 */
function getMyPosition(position: number) {
  if (position <= 10) {
    return position + (position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th');
  } else if (position >= 50) {
    return '50th+';
  } else {
    let divisor = 1;
    let tempNum = position;
    while (tempNum >= 10) {
      tempNum = Math.floor(tempNum / 10);
      divisor *= 10;
    }
    return tempNum * divisor + 'th+';
  }
}

/**
 * 如果position > 10显示Top10; position <= 10显示position - 1; 第一名显示1;
 * @param position
 */
function getPreviousPosition(position: number) {
  if (position > 10) {
    return 10;
  } else if (position === 1) {
    return 1;
  } else if (position <= 10) {
    return position - 1;
  }
}

function MyReWards(props: { position: number; toReach: number; wager: number }) {
  const { position, toReach, wager } = props;
  const { t } = useTranslation();
  const { nickName, avatar } = useUserInfo().data;
  const currency = 'USDFIAT';

  return (
    <div className="detrade-card s768:px-8 s768:py-7 flex flex-wrap items-center">
      <div className="flex items-center self-stretch flex-1 gap-3 pb-3 border-b basis-full s1024:basis-0 s1024:pb-0 s1024:border-b-0 s1024:border-r border-thirdly">
        <Image src={avatar} className="size-10 rounded-2" />
        <div>
          <div className="text-14 s768:text-16 text-primary">{nickName}</div>
          <div className="text-14 text-secondary s1024:w-44 s1366:w-auto">
            <Trans
              i18nKey="Wager <0>{{amount}}</0> To Reach"
              values={{
                amount: formatter.amount(toReach, currency).toText(),
              }}
            >
              <span className="text-primary font-700" />
            </Trans>
            {/* 特殊颜色,黑白模式下同色 */}
            {/* 如果当前排名在10名以外, 显示Top10; 排名是10名以内, 显示position - 1; */}
            <span className="bg-[#CDE919] inline-block rounded-full px-1.5 text-15 font-800 text-black ml-1">
              {t('Top')} {position ? getPreviousPosition(position) : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 mt-3 text-center border-r s1024:mt-0 border-thirdly">
        <div className="mb-2 text-secondary text-14 s768:text-16 font-700">{t('My Position')}</div>
        <div className="text-success text-18 s768:text-20 font-800">{position ? getMyPosition(position) : '--'}</div>
      </div>
      <div className="flex-1 mt-3 text-center s1024:mt-0">
        <div className="mb-2 text-secondary text-14 s768:text-16 font-700">{t('Wager')}</div>
        <div className="flex-center text-success text-18 s768:text-20 font-800">
          {formatter.amount(wager, currency).toText()}
        </div>
      </div>
    </div>
  );
}

interface RankList {
  percentage: string;
  prize: number;
  username: string;
  wager: number;
}
function Rankings(props: { activityId: number }) {
  const { activityId } = props;
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<RankList[]>([]);
  const currency = 'USDFIAT';

  useEffect(() => {
    if (!activityId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await request.get<RankList[]>('/api/promotion/activity/daily/contest/rank', {
          activityId,
        });
        setDataSource(res);
      } catch (error) {
        console.error('Failed to fetch daily contest rank list:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [activityId]);

  const columns = useMemo<Column<RankList>[]>(() => {
    const css = 'w-5 h-7';
    return [
      {
        title: t('no') + '.',
        dataIndex: 'no',
        render: (_, index) => {
          if (index === 0) {
            return <Image className={css} src={Top1} />;
          } else if (index === 1) {
            return <Image className={css} src={Top2} />;
          } else if (index === 2) {
            return <Image className={css} src={Top3} />;
          } else {
            // 为了高度跟上面的行对齐这里用div包裹下
            return <div className={cn(css, 'text-center leading-7')}>{index + 1}</div>;
          }
        },
        width: mobile ? 50 : 100,
      },
      {
        title: t('trader'),
        dataIndex: 'username',
        width: mobile ? 120 : 100,
      },
      {
        title: t('wager'),
        dataIndex: 'wager',
        width: 120,
        align: 'right',
        render: ({ wager }) => {
          return <div className="text-right text-brand">{formatter.amount(wager, currency).toText()}</div>;
        },
      },
      {
        title: t('price'),
        dataIndex: 'prize',
        width: 120,
        render: ({ prize, percentage }) => {
          return (
            <div className="flex items-center justify-end">
              <div className="text-brand">{'$' + prize}</div>
              <div className="text-secondary">({percentage}%)</div>
            </div>
          );
        },
      },
    ];
  }, [t, mobile, currency]);

  return (
    <Card className="s768:p-8 s768:pt-4">
      <Table rowKey="username" columns={columns} dataSource={dataSource} loading={loading} />
    </Card>
  );
}

function TopCard(props: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-center flex-col self-stretch flex-1 py-6 bg-layer3 rounded-3', props.className)}>
      {props.children}
    </div>
  );
}

function QuotaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none">
      <path
        d="M15.203 4.48543L13.2508 5.84991C13.1665 5.90881 13.0711 5.94998 12.9704 5.97091C12.8697 5.99185 12.7658 5.99212 12.6651 5.97171C12.5643 5.9513 12.4687 5.91063 12.3841 5.85218C12.2995 5.79372 12.2276 5.71869 12.1729 5.63163L9.84295 1.92713C9.48476 1.35762 8.65452 1.35762 8.29634 1.92713L5.96688 5.63253C5.91211 5.71956 5.84025 5.79457 5.75564 5.85301C5.67103 5.91145 5.57544 5.9521 5.47465 5.97251C5.37387 5.99292 5.26999 5.99266 5.16932 5.97174C5.06864 5.95082 4.97325 5.90968 4.88894 5.85081L2.93698 4.48543C2.31358 4.04976 1.46201 4.52203 1.50131 5.28153L1.90554 13.0835C1.93224 13.6056 2.15834 14.0975 2.53718 14.4578C2.91602 14.818 3.4187 15.0191 3.94148 15.0195H14.1978C14.7206 15.0195 15.2235 14.8188 15.6026 14.4587C15.9818 14.0987 16.2082 13.6068 16.2351 13.0846L16.6393 5.28265C16.6779 4.52203 15.8273 4.04976 15.203 4.48543Z"
        stroke="currentColor"
        strokeWidth="1.8529"
      />
      <path
        d="M12.6436 12.5H5.35637C5.12925 12.5 4.91143 12.3946 4.75083 12.2071C4.59022 12.0196 4.5 11.7652 4.5 11.5C4.5 11.2348 4.59022 10.9804 4.75083 10.7929C4.91143 10.6054 5.12925 10.5 5.35637 10.5H12.6436C12.8708 10.5 13.0886 10.6054 13.2492 10.7929C13.4098 10.9804 13.5 11.2348 13.5 11.5C13.5 11.7652 13.4098 12.0196 13.2492 12.2071C13.0886 12.3946 12.8708 12.5 12.6436 12.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TermsAndConditions() {
  const { t } = useTranslation();
  const prizeDistribution = [
    { ranking: '1st', percent: '50%' },
    { ranking: '2nd', percent: '25%' },
    { ranking: '3rd', percent: '12%' },
    { ranking: '4th', percent: '6%' },
    { ranking: '5th', percent: '3%' },
    { ranking: '6th', percent: '1.5%' },
    { ranking: '7th', percent: '0.9%' },
    { ranking: '8th', percent: '0.7%' },
    { ranking: '9th', percent: '0.5%' },
    { ranking: '10th', percent: '0.4%' },
  ];
  const terms = [
    t(
      `The prize pool of the competition is closely dependent on the previous day's bets. The more players bet, the larger the prize pool. The current prize pool will be displayed on the competition page.`
    ),
    t('10 most wagering players carve up the prize pool.'),
    t('All prizes will be sent in USDT.'),
    t('Prizes will be sent on Notice page as the Contest ends.'),
    t('Detrade reserves the right to exclude players who have violated our rules at any stage of the Contest.'),
    t('Detrade reserves the right to change any rules and conditions at its sole discretion and without prior notice.'),
    t('Prize Calculation Formula'),
    ...prizeDistribution.map(({ ranking, percent }) =>
      t('{{ranking}} place - {{percent}} of the Daily Contest prize pool', { ranking, percent })
    ),
  ];

  return (
    <Card className="s768:p-8 s768:pt-4" title={t('terms and conditions')}>
      <ul className="pl-5 list-disc list-outside s768:list-inside s768:pl-3 text-12 s768:text-14 font-500 text-secondary">
        {terms.map((term, index) => (
          <li key={index}>{term}</li>
        ))}
      </ul>
    </Card>
  );
}
