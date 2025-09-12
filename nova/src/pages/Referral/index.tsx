import { lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RouterTab from '@pages/components/RouterTab';

/**
 * @description 推荐页面布局组件
 */
export default function ReferralLayout() {
  const { t } = useTranslation();
  const routers = useMemo(() => {
    return [
      {
        label: t('Invite friends'),
        route: '/dashboard/referral',
        element: lazy(() => import('@pages/Referral/InviteFriends')),
      },
      {
        label: t('My reward'),
        route: '/dashboard/referral/my-reward',
        element: lazy(() => import('@pages/Referral/MyReward')),
      },
    ];
  }, [t]);

  return <RouterTab tabs={routers} />;
}
