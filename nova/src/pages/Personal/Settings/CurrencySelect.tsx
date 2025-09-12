/**
 * 货币本地化
 */
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocalCurrency } from '@store/system';
import { Image, Select } from '@components';

function CurrencySelect() {
  const currency = useSelector((state: StoreState) => state.system.currency);
  const dispatch = useDispatch();

  const localOptions = useMemo(() => {
    return options.map((option) => {
      return {
        label: (
          <div className="flex items-center gap-2">
            <Image src={option.url} className="size-6" />
            <div>{option.label}</div>
          </div>
        ),
        value: option.value,
      };
    });
  }, []);
  return (
    <Select
      options={localOptions}
      searchable
      onSearch={(key, option) => option.value.toLowerCase().indexOf(key.toLowerCase()) > -1}
      value={currency}
      onChange={(value) => dispatch(setLocalCurrency(value))}
    />
  );
}

export default CurrencySelect;
const options = [
  { label: 'AED', value: 'AEDFIAT', url: '/currency/AED.png' },
  { label: 'ARS', value: 'ARSFIAT', url: '/currency/ARS.png' },
  { label: 'AUD', value: 'AUDFIAT', url: '/currency/AUD.png' },
  { label: 'AZN', value: 'AZNFIAT', url: '/currency/AZN.png' },
  { label: 'BDT', value: 'BDTFIAT', url: '/currency/BDT.png' },
  { label: 'BRL', value: 'BRLFIAT', url: '/currency/BRL.png' },
  { label: 'CAD', value: 'CADFIAT', url: '/currency/CAD.png' },
  { label: 'CLP', value: 'CLPFIAT', url: '/currency/CLP.png' },
  { label: 'COP', value: 'COPFIAT', url: '/currency/COP.png' },
  { label: 'CZK', value: 'CZKFIAT', url: '/currency/CZK.png' },
  { label: 'EGP', value: 'EGPFIAT', url: '/currency/EGP.png' },
  { label: 'EUR', value: 'EURFIAT', url: '/currency/EUR.png' },
  { label: 'GBP', value: 'GBPFIAT', url: '/currency/GBP.png' },
  { label: 'GHS', value: 'GHSFIAT', url: '/currency/GHS.png' },
  { label: 'IDR', value: 'IDRFIAT', url: '/currency/IDR.png' },
  { label: 'INR', value: 'INRFIAT', url: '/currency/INR.png' },
  { label: 'JPY', value: 'JPYFIAT', url: '/currency/JPY.png' },
  { label: 'KES', value: 'KESFIAT', url: '/currency/KES.png' },
  { label: 'KGS', value: 'KGSFIAT', url: '/currency/KGS.png' },
  { label: 'MDL', value: 'MDLFIAT', url: '/currency/MDL.png' },
  { label: 'MXN', value: 'MXNFIAT', url: '/currency/MXN.png' },
  { label: 'MYR', value: 'MYRFIAT', url: '/currency/MYR.png' },
  { label: 'NOK', value: 'NOKFIAT', url: '/currency/NOK.png' },
  { label: 'NZD', value: 'NZDFIAT', url: '/currency/NZD.png' },
  { label: 'PEN', value: 'PENFIAT', url: '/currency/PEN.png' },
  { label: 'PHP', value: 'PHPFIAT', url: '/currency/PHP.png' },
  { label: 'PLN', value: 'PLNFIAT', url: '/currency/PLN.png' },
  { label: 'RUB', value: 'RUBFIAT', url: '/currency/RUB.png' },
  { label: 'THB', value: 'THBFIAT', url: '/currency/THB.png' },
  { label: 'TRY', value: 'TRYFIAT', url: '/currency/TRY.png' },
  { label: 'TWD', value: 'TWDFIAT', url: '/currency/TWD.png' },
  { label: 'UAH', value: 'UAHFIAT', url: '/currency/UAH.png' },
  { label: 'USD', value: 'USDFIAT', url: '/currency/USD.png' },
  { label: 'UZS', value: 'UZSFIAT', url: '/currency/UZS.png' },
  { label: 'VND', value: 'VNDFIAT', url: '/currency/VND.png' },
  { label: 'XAF', value: 'XAFFIAT', url: '/currency/XAF.png' },
  { label: 'XOF', value: 'XOFFIAT', url: '/currency/XOF.png' },
  { label: 'ZAR', value: 'ZARFIAT', url: '/currency/ZAR.png' },
];
