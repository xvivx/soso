import { lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RouterTab from '@pages/components/RouterTab';

const Assets = lazy(() => import('./Assets'));
const Deposit = lazy(() => import('./Deposit'));
const Withdraw = lazy(() => import('./Withdraw'));
const Transactions = lazy(() => import('./Transactions'));
const TradeHistory = lazy(() => import('./TradeHistory'));
const Other = lazy(() => import('./Other'));

export default function TransactionLayout() {
  const { t } = useTranslation();
  const routes = useMemo(() => {
    return [
      {
        label: t('Assets'),
        route: '/dashboard/wallet',
        element: Assets,
      },
      {
        label: t('Deposit'),
        route: '/dashboard/wallet/deposit',
        element: Deposit,
      },
      {
        label: t('Withdraw'),
        route: '/dashboard/wallet/withdraw',
        element: Withdraw,
      },
      {
        label: t('Transactions'),
        route: '/dashboard/wallet/transactions',
        element: Transactions,
      },
      {
        label: t('Trade history'),
        route: '/dashboard/wallet/trade-history',
        element: TradeHistory,
      },
      {
        label: t('Other'),
        route: '/dashboard/wallet/other',
        element: Other,
      },
    ];
  }, [t]);

  return <RouterTab tabs={routes} />;
}
