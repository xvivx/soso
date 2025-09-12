import { lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RouterTab from '@pages/components/RouterTab';

function Notification() {
  const { t } = useTranslation();

  const routers = useMemo(() => {
    return [
      {
        label: t('Announcements'),
        route: '/dashboard/notification',
        element: lazy(() => import('@pages/Notification/Announcement')),
      },
      {
        label: t('My activity'),
        route: '/dashboard/notification/inbox',
        element: lazy(() => import('@pages/Notification/InboxMessage')),
      },
      {
        label: t('Latest events'),
        route: '/dashboard/notification/system',
        element: lazy(() => import('@pages/Notification/SystemNotification')),
      },
    ];
  }, [t]);

  return <RouterTab tabs={routers} />;
}

export default Notification;
