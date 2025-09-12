import { memo, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { setAccountTypeTransition, useLocalCurrency } from '@store/system';
import {
  AccountType,
  changeAccountType,
  setCurrency,
  useAccountType,
  useActiveAsset,
  useAllAssetsWithLocaleAmount,
  useCurrency,
} from '@store/wallet';
import { Button, Image, Input, Loading, Popover, ScrollArea, SvgIcon, Switch } from '@components';
import { cn, formatter } from '@utils';
import { getCoinUrl } from '@utils/others';

function WalletButton() {
  return (
    <Button className="h-full w-7 s768:w-7" size="sm" asChild>
      <NavLink to="#/wallet/deposit">
        <SvgIcon name="wallet" className="text-black size-5" />
      </NavLink>
    </Button>
  );
}

function Wallet({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const accountType = useAccountType();
  return (
    <div
      className={cn(
        'w-56 shrink-0 h-10 flex items-center gap-1 p-1 pl-3 border-2 bg-layer3 border-input rounded-2 leading-normal',
        className
      )}
    >
      <Popover
        open={visible}
        onOpenChange={setVisible}
        overlayClassName="p-0 z-50"
        content={(closePopover) => (
          <Suspense
            fallback={
              <div className="relative flex-center h-100 w-full s768:w-96">
                <Loading />
              </div>
            }
          >
            <AssetsPanel
              className="flex flex-col min-h-[50vh] s768:min-h-36 w-full s768:w-96 p-4 s768:p-3"
              onSelected={closePopover}
            />
          </Suspense>
        )}
      >
        <div className="flex-1 flex items-center gap-2 h-full">
          <Balance isLive={accountType === AccountType.REAL} />
          <SvgIcon name="arrow" className={cn('size-4 transition-all', visible ? '-rotate-90' : 'rotate-90')} />
        </div>
      </Popover>
      <WalletButton />
    </div>
  );
}
export default memo(Wallet);

function Balance({ isLive }: { isLive: boolean }) {
  const { t } = useTranslation();
  const active = useActiveAsset();
  return (
    <>
      <Image className="rounded-full size-5 s768:size-5 mt-0.5" src={getCoinUrl(active.currency)} />
      <div className="flex-1 text-12 s768:text-14 font-600 flex flex-col items-start">
        <div className="text-tertiary font-500" style={{ fontSize: '9px', transform: 'scale(1)' }}>
          {isLive ? t('Live account') : t('Demo account')}
        </div>
        <div className={cn('w-full truncate text-12 leading-3', isLive ? 'text-primary' : 'text-warn')}>
          {formatter.amount(active.amount, active.currency).floor().toText(true)}
        </div>
      </div>
    </>
  );
}

export function AssetsPanel(props: { className?: string; onSelected?: () => void }) {
  const { className, onSelected } = props;
  const [searchValue, setSearchValue] = useState('');
  const walletActiveCurrency = useCurrency().name;
  const { t } = useTranslation();
  const accountType = useAccountType();
  const [hideSmall, setHideSmall] = useState(false);
  const dispatch = useDispatch();
  const assets = useAllAssetsWithLocaleAmount();
  const localCurrency = useLocalCurrency();

  const filterAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        if (hideSmall) return asset.amount > 0;
        return asset;
      })
      .filter((asset) => asset.currency.toUpperCase().includes(searchValue.toUpperCase()))
      .sort((curr, next) => {
        if (curr.type === AccountType.DEMO) return -1;
        if (next.type === AccountType.DEMO) return 1;
        return next.localeAmount - curr.localeAmount;
      });
  }, [assets, searchValue, hideSmall]);

  return (
    <div className={className}>
      <div className="mb-3">
        <Input.Search className="bg-layer3" value={searchValue} onChange={setSearchValue} />
      </div>

      {filterAssets.length === 0 ? (
        <div className="flex-center flex-1 text-secondary">{t('No data available')}</div>
      ) : (
        <>
          <ScrollArea className="flex-1 -mx-4 px-4 s768:-mx-3 s768:px-3 overscroll-auto s768:overscroll-none">
            {filterAssets.map((asset) => {
              return (
                <div
                  key={asset.type + asset.currency}
                  className={cn(
                    'flex items-center justify-between gap-4 px-3 py-2 mb-2.5 rounded-2',
                    onSelected && 'cursor-pointer hover:darkness',
                    walletActiveCurrency === asset.currency && accountType === asset.type && 'bg-layer5'
                  )}
                  onClick={() => {
                    if (!onSelected) return;
                    if (accountType !== asset.type) {
                      dispatch(changeAccountType(asset.type));
                      dispatch(setAccountTypeTransition({ visible: true }));
                    }
                    dispatch(setCurrency(asset.currency));
                    onSelected();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Image className="rounded-full size-7" src={getCoinUrl(asset.currency)} />
                    <div className="truncate text-12 s768:text-14 font-600">{asset.currency}</div>
                    {asset.type === AccountType.DEMO && (
                      <div className="text-12 text-success h-6 px-1.5 py-1 bg-success/10 rounded">{t('Demo')}</div>
                    )}
                  </div>
                  <div className="text-right flex-1 w-0">
                    <div
                      className={cn(
                        'truncate text-12 s768:text-14 font-600',
                        asset.type === AccountType.DEMO && 'text-warn'
                      )}
                    >
                      {formatter.amount(asset.amount, asset.currency).floor().toText()}
                    </div>
                    <div className="truncate text-12 text-secondary">
                      {formatter.amount(asset.localeAmount, localCurrency).floor().toText()}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-layer5 text-14 text-secondary">
            <div>{t('Hide Small')}</div>
            <Switch checked={hideSmall} onCheckedChange={setHideSmall} />
          </div>
        </>
      )}
    </div>
  );
}
