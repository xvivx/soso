import { Fragment, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import useCountDownTimeByUTC from '@hooks/useCountDownTimeByUTC';
import useNavigate from '@hooks/useNavigate';
import { Accordion, Button, Image, Loading, Pagination, SvgIcon, Tabs } from '@components';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import PreviewPoster from '@pages/Referral/InviteFriends/PreviewModal';
import campaignCenter from './assets/campaignCenter.png';
import RewardsDetails from './components/ClaimedRewardsDetails';
import FirstDepositModal from './components/FirstDepositModal';
import {
  ActivityStatus,
  ParticipantItemDetail,
  ParticipantType,
  useNewUserGiftsActive,
  useNewUserParticipant,
} from './hooks/useNewUserGifts';
import { useRewardAmount } from './hooks/useReward';

interface ActivityItem {
  banner: string;
  description: string;
  endTime: number;
  id: number;
  name: string;
  rule: string;
  startTime: number;
}
enum ActivityType {
  RUNNING,
  COMING,
  END,
}
// 1. 顶部banner
function Banner() {
  const { t } = useTranslation();
  const bannerTexts = useMemo(() => {
    return [
      {
        title: '$4,552,681',
        text: t('Bonus pool'),
      },
      {
        title: '186,902',
        text: t('Awarded users'),
      },
      {
        title: '$12,938',
        text: t('Max solo bonus'),
      },
    ];
  }, [t]);

  return (
    <div
      className="relative flex flex-col s768:flex-row s768:justify-between items-center gap-6 px-2 py-5 s768:py-12 s768:pl-10 s768:pr-2.5 overflow-hidden rounded-3"
      style={{
        backgroundImage: 'linear-gradient(268deg, rgba(36, 238, 137, 0.2) 1.14%, rgba(159, 232, 113, 0.2) 94.86%)',
      }}
    >
      <div className="px-2 s768:px-0 w-full">
        <div className="text-primary font-800 text-20 s768:text-26">{t('Campaign Center')}</div>
        <div className="mb-3 s768:mb-7 text-12 s768:text-20 s768:w-80 s1024:w-[534px] text-secondary">
          {t('Turn every action into rewards. Start trading today.')}
        </div>
        <div className="flex items-center gap-1 s768:gap-8">
          {bannerTexts.map((item, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center py-3 rounded-3 flex-1 s768:flex-none bg-alpha5 s768:w-56 z-10"
              >
                <span className="text-primary font-800 text-12 s768:text-26">{item.title}</span>
                <span className="text-10 s768:text-14 text-secondary">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Image src={campaignCenter} className="absolute h-35 bottom-0 right-0 hidden s768:block w-72" />
    </div>
  );
}

// 2. 已领取奖励
function ClaimedRewards() {
  const { t } = useTranslation();
  const rewardAmount = useRewardAmount();
  return (
    <Card className="s768:px-8 s768:py-3">
      <div className="flex items-end justify-between">
        <div className="flex items-center s768:gap-3 gap-0 flex-wrap">
          <div className="text-primary text-16 s768:text-20 w-full s768:w-auto shrink-0 s768:shrink-1 font-700">
            {t('Claimed rewards')}
          </div>
          <div className="text-16 s768:text-24 text-brand">{formatter.price(rewardAmount).toText()} USDT</div>
        </div>
        <Button className="w-24 s768:w-28 ml-auto shrink-0" onClick={() => RewardsDetails.openClaimedRewardsDetails()}>
          {t('Details')}
        </Button>
      </div>
    </Card>
  );
}

// 3. 新用户活动
function NewUserGifts() {
  const { t } = useTranslation();
  const { data: participant } = useNewUserParticipant();

  // 操作按钮
  const OperationButton = memo(
    ({
      participantType,
      participantDetails,
    }: {
      participantType: ParticipantType;
      participantDetails: ParticipantItemDetail;
    }) => {
      const { inviteCode } = useUserInfo().data;
      const navigate = useNavigate();
      const { t } = useTranslation();
      const referralLink = useMemo(() => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/account/register?r=${inviteCode}`;
      }, [inviteCode]);

      const handleOperation = useCallback(() => {
        switch (participantType) {
          case ParticipantType.Deposit:
            FirstDepositModal.openFirstDepositModal();
            break;
          case ParticipantType.Invited:
            PreviewPoster.openPreviewModal(referralLink);
            break;
          case ParticipantType.Trade:
            navigate('/trade-center');
            break;
        }
      }, [participantType, navigate, referralLink]);

      const buttonText = useMemo(() => {
        switch (participantType) {
          case ParticipantType.Deposit:
            return t('Deposit now');
          case ParticipantType.Invited:
            return t('Invite friends');
          case ParticipantType.Trade:
            return t('Start trading');
        }
      }, [participantType, t]);

      return (
        <Button
          className="w-23 s768:w-28 shrink-0"
          onClick={handleOperation}
          disabled={participantDetails.status === ActivityStatus['Expired']}
        >
          {buttonText}
        </Button>
      );
    }
  );
  // 状态栏
  const StatusBar = memo(({ details }: { details: ParticipantItemDetail }) => {
    const { t } = useTranslation();
    const [iconMap, statusMap] = useMemo(() => {
      const statusMap = {
        [ActivityStatus['NotCompleted']]: t('Not completed'),
        [ActivityStatus['Completed']]: t('Completed'),
        [ActivityStatus['Processing']]: t('Completed'),
        [ActivityStatus['Expired']]: t('Expired'),
      };
      const iconMap = {
        [ActivityStatus['NotCompleted']]: 'circle',
        [ActivityStatus['Completed']]: 'completed',
        [ActivityStatus['Processing']]: 'process',
        [ActivityStatus['Expired']]: 'expired',
      } as const;
      return [iconMap, statusMap];
    }, [t]);

    return (
      <div
        className={cn(
          'px-2 py-1 rounded-2 bg-layer5 flex items-center gap-1 w-40 text-secondary',
          details.status === ActivityStatus['NotCompleted'] && 'text-warn',
          details.status === ActivityStatus['Completed'] && 'text-success'
        )}
      >
        <SvgIcon name={iconMap[details.status]} />
        <Accordion.Collapse defaultOpen={details.status === ActivityStatus['Processing']}>
          <span className="text-brand">{details.progress}</span>
        </Accordion.Collapse>
        <span>{statusMap[details.status]}</span>
      </div>
    );
  });
  return (
    <Fragment>
      <Card
        className="s768:px-8 s768:py-3"
        titleClassName="border-b-0 text-16 s768:text-20 pb-0 mb-0"
        title={
          <div className="flex items-center">
            <span className="text-brand_alt font-poppins">{t('New user')}&nbsp;</span>
            <span>{t('welcome gifts')}</span>
          </div>
        }
      >
        <div className="flex-col">
          <Suspense fallback={<Loading />}>
            {participant.items.map((item, index) => {
              return (
                <div
                  key={item.activityId}
                  className="flex items-end justify-between border-b border-thirdly py-4 flex-wrap flex-1"
                >
                  <div className="flex items-center flex-wrap flex-1 gap-1 font-600">
                    <div className="text-primary text-14 s768:text-16 w-52 s768:w-96 whitespace-nowrap">{`${index + 1}. ${item.activityName}`}</div>
                    <div className="flex items-center justify-start flex-wrap gap-1">
                      <div
                        className="text-secondary text-12 s768:text-16 s768:w-72 font-600"
                        dangerouslySetInnerHTML={{ __html: item.activityDescription }}
                      />
                      <StatusBar details={item.details} />
                    </div>
                  </div>
                  <OperationButton participantType={item.activityType} participantDetails={item.details} />
                </div>
              );
            })}
          </Suspense>
        </div>
      </Card>
    </Fragment>
  );
}

// 活动卡片
const ActivityCard = memo(({ item, type }: { item: ActivityItem; type: number }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const time = useCountDownTimeByUTC(item.endTime);

  return (
    <div className="s768:w-[calc(50%-16px)] p-4 bg-layer5 rounded-3" key={item.id}>
      <div className="h-40 rounded-3 mb-3 relative">
        {type === ActivityType.RUNNING && (
          <div className="bg-alpha5 rounded-2 text-12 py-1 px-3 absolute top-2 left-2 text-secondary">
            {t('Ends in {{time}} days', { time: time.days })}
          </div>
        )}
        <Image src={item.banner} className="size-full rounded-3" />
      </div>
      <div className="flex items-end justify-between flex-col s768:flex-row gap-2">
        <div className="s768:w-82">
          <div className="text-14 text-primary font-600">{item.name}</div>
          <div className="text-12 text-secondary font-500">
            {t('Event time: {{ startTime }} - {{ endTime }}', {
              startTime: formatter.time(item.startTime),
              endTime: formatter.time(item.endTime),
            })}
          </div>
        </div>
        <Button
          className="w-full h-10 s768:w-32 ml-auto shrink-0"
          onClick={() => navigate(`/dashboard/campaign-detail/${item.id}`)}
        >
          {t('Event Details')}
        </Button>
      </div>
    </div>
  );
});
// 4. 活动列表
function Campaigns() {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 2,
  });
  const [data, setData] = useState<{ items: ActivityItem[]; total: number }>({ items: [], total: 0 });
  useEffect(() => {
    (async () => {
      try {
        const res = await request.get<{ items: ActivityItem[]; total: number }>('/api/promotion/activity/list', {
          ...filters,
          type: ActivityType[tabIndex],
        });
        setData(res);
      } catch (error) {
        console.error('Failed to fetch activity list:', error);
      }
    })();
  }, [tabIndex, filters]);

  return (
    <Card className="s768:px-8 s768:py-3">
      <Tabs
        theme="chip"
        selectedIndex={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          setFilters((prev) => ({ ...prev, page: 1 }));
        }}
      >
        <Tabs.Header className="gap-6 mb-3">
          <Tabs.Item className={'px-0'} key={t('Ongoing')}>
            {t('Ongoing')}
          </Tabs.Item>
          <Tabs.Item className={'px-0'} key={t('Coming soon')}>
            {t('Coming soon')}
          </Tabs.Item>
          <Tabs.Item className={'px-0'} key={t('Finished')}>
            {t('Finished')}
          </Tabs.Item>
        </Tabs.Header>
      </Tabs>
      <div className="flex flex-wrap justify-between gap-8">
        {data.items.length ? (
          data.items.map((item) => {
            return <ActivityCard key={item.id} item={item} type={tabIndex} />;
          })
        ) : (
          <div className="w-full h-72 flex flex-col items-center justify-center gap-4">
            <div className="relative size-18 shadow-[0_2px_14px_rgba(0,0,0,0.1)] rounded-full bg-layer4 flex items-center justify-center">
              <SvgIcon name="rewardCampaign" className="text-[#3A4142] light:text-[#f2f2f2] size-10" />
              <div className="absolute -top-1 -right-2 size-7 shadow-[0_2px_14px_rgba(0,0,0,0.1)] rounded-full bg-layer4 flex items-center justify-center">
                <SvgIcon name="searchCampaign" className="light:text-[#f2f2f2] text-[#3A4142] size-4" />
              </div>
            </div>
            <div className="text-12 font-600 text-quarterary">{t('Stay tuned for upcoming events.')}</div>
          </div>
        )}
      </div>
      <Pagination
        className="my-4"
        current={filters.page}
        pageSize={filters.pageSize}
        total={data.total}
        onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
      />
    </Card>
  );
}

function CampaignCenter() {
  const active = useNewUserGiftsActive();
  const { isTemporary } = useUserInfo().data;
  return (
    <div className="space-y-3">
      <Banner />
      {!isTemporary && <ClaimedRewards />}
      {!isTemporary && active && <NewUserGifts />}
      <Campaigns />
    </div>
  );
}

export default memo(CampaignCenter);
