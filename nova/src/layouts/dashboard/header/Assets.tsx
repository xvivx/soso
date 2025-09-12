import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setAccountTypeTransition, useLocalCurrency } from '@store/system';
import {
  AccountType,
  changeAccountType,
  setCurrency,
  useAccountType,
  useDemoAmount,
  useTotalLocaleAmount,
} from '@store/wallet';
import { Button, Popover, SvgIcon } from '@components';
import { formatter } from '@utils';
import MenuItem from './MenuItem';

function Assets() {
  const { t } = useTranslation();
  const realAssetsAmount = useTotalLocaleAmount();
  const demoAssetsAmount = useDemoAmount();
  const accountType = useAccountType();
  const currency = useLocalCurrency();
  const assetsAmount = accountType === AccountType.DEMO ? demoAssetsAmount : realAssetsAmount;
  const [amountHide, setAmountHide] = useState(false);
  const dispatch = useDispatch();

  const menus = useMemo(() => {
    return [
      {
        title: t('Deposit'),
        icon: <SvgIcon name="deposit" />,
        url: '/dashboard/wallet/deposit',
      },
      {
        title: t('Withdraw'),
        icon: <SvgIcon name="homeWithdraw" />,
        url: '/dashboard/wallet/withdraw',
      },
      {
        title: t('Transactions'),
        icon: <SvgIcon name="trade" className="rotate-[135deg]" />,
        url: '/dashboard/wallet/transactions',
      },
      {
        title: t('Trade history'),
        icon: <SvgIcon name="transaction" />,
        url: '/dashboard/wallet/trade-history',
      },
    ];
  }, [t]);

  return (
    <Popover
      trigger="hover"
      overlayClassName="flex-col s768:w-60"
      content={
        <>
          <div className="p-4 bg-layer5 rounded-2 mb-1">
            <div className="text-12 text-secondary flex items-center gap-1">
              {t('Assets overview')}
              <Button
                theme="transparent"
                className="size-4 s768:size-4"
                icon={
                  <SvgIcon
                    onClick={() => setAmountHide(!amountHide)}
                    name={!amountHide ? 'eyes' : 'closeEyes'}
                    className="size-4"
                  />
                }
              />
            </div>
            <div className="text-20">
              {amountHide ? (
                '****'
              ) : (
                <span className="break-all">{formatter.amount(assetsAmount, currency).floor().toText()}</span>
              )}
            </div>
            <Button
              onClick={() => {
                dispatch(setAccountTypeTransition({ visible: true }));
                dispatch(changeAccountType(accountType === AccountType.DEMO ? AccountType.REAL : AccountType.DEMO));
                dispatch(setCurrency('USDT'));
              }}
              theme="transparent"
              size="sm"
              className="bg-success/10 text-brand"
            >
              {accountType === AccountType.DEMO ? t('live') : t('demo')}
              <SvgIcon name="progress" className="size-4 ml-1 text-brand" />
            </Button>
          </div>

          <div className="space-y-1">
            {menus.map((menu, index) => {
              return <MenuItem key={menu.url || index} menu={menu} />;
            })}
          </div>
        </>
      }
    >
      <Button theme="secondary">
        {t('Assets')}
        <SvgIcon name="arrow" className="rotate-90 text-primary size-4" />
      </Button>
    </Popover>
  );
}

export default Assets;
