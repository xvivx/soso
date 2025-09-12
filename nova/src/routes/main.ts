import { lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteProps } from 'react-router-dom';
import { useUserInfo } from '@store/user';
import { useMediaQuery } from '@hooks/useResponsive';
import DashboardLayout from '@/layouts/dashboard';
import LandingLayout from '@/layouts/LandingLayout';
import MobileTradeLayout from '@/layouts/MobileTradeLayout';
import PartnerLayout from '@/layouts/PartnerLayout';
import { MobileSecondaryRouteProps, ModalRouteProps } from './type';

const Guide = lazy(() => import('@pages/Guide'));
const AuthPortalLayout = lazy(() => import('@pages/Account/Layout'));

export function usePrimaryRoutes() {
  return useMemo<RouteProps[]>(
    () => [
      {
        path: ['/account/login', '/account/register'],
        component: AuthPortalLayout,
      },
      {
        path: '/partner',
        component: PartnerLayout,
      },
      {
        path: '/guide',
        component: Guide,
      },
      {
        path: ['/trade-center', '/dashboard'],
        component: DashboardLayout,
      },
      {
        path: '/',
        component: LandingLayout,
      },
    ],
    []
  );
}

const Apply = lazy(() => import('@pages/Integration/Apply'));
const Integration = lazy(() => import('@pages/Integration'));
const PartnershipProgram = lazy(() => import('@pages/PartnershipProgram'));
const NotificationDetail = lazy(() => import('@pages/Notification/Detail'));
const Notification = lazy(() => import('@pages/Notification'));
const Referral = lazy(() => import('@pages/Referral'));
export function useMobileSecondaryRoutes() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const { isTemporary } = useUserInfo().data;
  return useMemo<MobileSecondaryRouteProps[]>(
    () =>
      mobile
        ? [
            {
              path: ['high-low', 'spread', 'futures', 'up-down', 'tap-trading'].map(
                (route) => `/trade-center/${route}`
              ),
              component: MobileTradeLayout,
            },
            {
              path: '/dashboard/integration/apply',
              component: Apply,
              title: t('Apply'),
            },
            {
              path: '/dashboard/integration',
              component: Integration,
              title: t('Integration program'),
            },
            {
              path: '/dashboard/partnership-program',
              component: PartnershipProgram,
              title: t('Partnership program'),
            },
            {
              path: '/dashboard/messages/:id',
              component: NotificationDetail,
              title: t('Detail'),
              auth: true,
            },
            {
              path: '/dashboard/notification',
              component: Notification,
              title: t('Notification'),
              auth: true,
            },
            {
              path: '/dashboard/referral',
              title: t('Referral'),
              component: Referral,
              auth: true,
            },
            {
              path: '/dashboard/wallet',
              title: t('Wallet'),
              component: Wallet,
              auth: true,
            },
          ].filter((route) => (route.auth ? !isTemporary : true))
        : [],
    [t, isTemporary, mobile]
  );
}

const ResetPassword = lazy(() => import('@pages/Account/ResetPassword'));
const MobileMenus = lazy(() => import('@/layouts/dashboard/MobileMenus'));
const MobileChat = lazy(() => import('@/layouts/dashboard/chat'));
const CustomerService = lazy(() => import('@pages/CustomerService'));
const Wallet = lazy(() => import('@pages/Wallet/Layout'));
const Deposit = lazy(() => import('@pages/Wallet/Deposit'));
const EditProfile = lazy(() => import('@pages/Personal/MyProfile/EditProfile'));
const EditAvatar = lazy(() => import('@pages/Personal/MyProfile/EditAvatar'));
export function useModalRoutes() {
  const { t } = useTranslation();
  const { isTemporary } = useUserInfo().data;
  const { mobile } = useMediaQuery();
  return useMemo<ModalRouteProps[]>(() => {
    return [
      {
        path: '#/login/reset-password',
        title: t('forgot password?'),
        component: ResetPassword,
        size: 'sm' as const,
      },
      {
        path: '#/menu',
        title: t('Menu'),
        component: MobileMenus,
        mobile: true,
      },
      {
        path: '#/chat',
        title: t('Chat'),
        component: MobileChat,
        mobile: true,
      },
      {
        path: '#/customerService',
        component: CustomerService,
        className: 'hidden',
        mobile: true,
      },
      {
        path: '#/wallet/deposit',
        component: Deposit,
        title: t('Deposit'),
        auth: true,
        className: 'h-[70vh]',
      },
      {
        path: '#/profile/edit-profile',
        title: t('edit profile'),
        component: EditProfile,
        size: 'sm' as const,
        auth: true,
      },
      {
        path: '#/profile/edit-avatar',
        title: t('edit your avatar'),
        component: EditAvatar,
        size: 'sm' as const,
        auth: true,
      },
    ].filter((route) => {
      if (route.mobile && !mobile) return false;
      if (route.auth && isTemporary) return false;
      return true;
    });
  }, [t, isTemporary, mobile]);
}
