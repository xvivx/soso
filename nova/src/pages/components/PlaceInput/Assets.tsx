import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocalCurrency } from '@store/system';
import { AccountType, setCurrency, useAccountType, useAllAssetsWithLocaleAmount, useCurrency } from '@store/wallet';
import { Image, Popover, ScrollArea, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { getCoinUrl } from '@utils/others';

export default function AssetsSelector() {
  const assets = useAllAssetsWithLocaleAmount();
  const accountType = useAccountType();
  const currency = useCurrency();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      overlayClassName="w-full s768:w-96"
      align="end"
      alignOffset={-4}
      content={() => {
        return (
          <ScrollArea className="w-full">
            {assets
              .filter((asset) => asset.type === accountType)
              .map((asset) => (
                <AssetItem
                  key={asset.currency}
                  asset={asset}
                  selected={currency.name === asset.currency}
                  onSelected={() => {
                    setOpen(false);
                    dispatch(setCurrency(asset.currency));
                  }}
                />
              ))}
          </ScrollArea>
        );
      }}
    >
      <div className="flex items-center gap-1 h-full px-1 select-none">
        <Image className="size-5 rounded-full" src={getCoinUrl(currency.name)} />
        <SvgIcon name="arrow" className={cn('size-4 transition-all', open ? '-rotate-90' : 'rotate-90')} />
      </div>
    </Popover>
  );
}

function AssetItem(props: {
  asset: ReturnType<typeof useAllAssetsWithLocaleAmount>[number];
  onSelected: () => void;
  selected: boolean;
}) {
  const { t } = useTranslation();
  const { asset, onSelected, selected } = props;
  const localeCurrency = useLocalCurrency();
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-3 py-2 mb-2.5 rounded-2 cursor-pointer hover:darkness',
        selected && 'bg-layer5'
      )}
      onClick={onSelected}
    >
      <div className="flex items-center gap-3">
        <Image className="rounded-full size-7" src={getCoinUrl(asset.currency)} />
        <div className="truncate text-12 s768:text-14 font-600">{asset.currency}</div>
        {asset.type === AccountType.DEMO && (
          <div className="text-12 text-success h-6 px-1.5 py-1 bg-success/10 rounded">{t('Demo')}</div>
        )}
      </div>
      <div className="text-right flex-1 w-0">
        <div className="truncate text-12 s768:text-14 font-600">
          {formatter.amount(asset.amount, asset.currency).floor().toText()}
        </div>
        <div className="truncate text-12 text-secondary">
          {formatter.amount(asset.localeAmount, localeCurrency).floor().toText()}
        </div>
      </div>
    </div>
  );
}
