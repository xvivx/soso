import { useMemo } from 'react';
import { useLocalCurrency } from '@store/system';
import { CurrencyAsset } from '@store/wallet';
import { Image, Select } from '@components';
import { formatter } from '@utils';
import { getCoinUrl } from '@utils/others';

export default function CurrencySelector(props: {
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencyAsset[];
  searchable?: boolean; // 是否支持搜索
}) {
  const { currencies, value, searchable, onChange } = props;
  const currency = useLocalCurrency();
  const options = useMemo(() => {
    return currencies.map((asset) => {
      const _asset = {
        className: 'h-13 mb-2 last:mb-0',
        label: (
          <div className="flex items-center justify-between leading-none">
            <div className="flex items-center gap-2.5">
              <Image className="rounded-full size-8" src={getCoinUrl(asset.currency)} />
              <div>
                <div className="mb-0.5">{asset.currency.replace(/FIAT$/, '')}</div>
                <div className="text-12 text-secondary font-400">{asset.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 text-14 s768:text-16 font-600">
                {formatter.amount(asset.amount, asset.currency).toText()}
              </div>
              <div className="text-11 s768:text-12 text-secondary font-400">
                {formatter.amount(asset.localeAmount, currency).toText()}
              </div>
            </div>
          </div>
        ),
        value: asset.currency,
      };
      if (searchable) {
        return {
          ..._asset,
          filter(filter: string) {
            return asset.currency.toUpperCase().indexOf(filter.toUpperCase()) > -1;
          },
        };
      }
      return _asset;
    });
  }, [currencies, currency, searchable]);

  return (
    <Select
      options={options}
      searchable={searchable}
      value={value}
      onChange={onChange}
      className="text-14 s768:text-16 h-15 s768:h-15"
    />
  );
}
