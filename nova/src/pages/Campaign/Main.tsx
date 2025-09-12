import { lazy, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RouterTab from '@pages/components/RouterTab';

const AirdropRewards = lazy(() => import('./AirdropRewards'));
const DailyContest = lazy(() => import('./DailyContest'));
const WeeklyRaffle = lazy(() => import('./WeeklyRaffle'));
const RewardCenter = lazy(() => import('./RewardCenter'));

function CampaignMain() {
  const { t } = useTranslation();
  const menu = useMemo(
    () => [
      {
        label: t('Daily contest'),
        route: '/dashboard/campaign',
        element: DailyContest,
      },
      {
        label: t('Weekly raffle'),
        route: '/dashboard/campaign/weekly-raffle',
        element: WeeklyRaffle,
      },
      {
        label: t('Airdrop'),
        route: '/dashboard/campaign/airdrop-rewards',
        element: AirdropRewards,
      },
      {
        label: t('Reward center'),
        route: '/dashboard/campaign/reward-center',
        element: RewardCenter,
        auth: true,
      },
    ],
    [t]
  );
  return <RouterTab tabs={menu} />;
}

export default memo(CampaignMain);
