import { lazy, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RouterTab from '@pages/components/RouterTab';

const Profile = lazy(() => import('./Profile'));
const Vip = lazy(() => import('./Vip'));
const Security = lazy(() => import('./Security'));
const Settings = lazy(() => import('./Settings'));

function PersonalMain() {
  const { t } = useTranslation();
  const menu = useMemo(
    () => [
      {
        label: t('Profile'),
        route: '/dashboard/personal',
        element: Profile,
      },
      {
        label: t('VIP'),
        route: '/dashboard/personal/vip',
        element: Vip,
      },
      {
        label: t('Security'),
        route: '/dashboard/personal/security',
        element: Security,
      },
      {
        label: t('Preferences'),
        route: '/dashboard/personal/preferences',
        element: Settings,
      },
    ],
    [t]
  );
  return <RouterTab tabs={menu} />;
}

export default memo(PersonalMain);
