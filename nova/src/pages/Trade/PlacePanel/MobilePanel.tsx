import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalCurrency } from '@store/system';
import { useBalance, useCurrency, useExchanges } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { FormItem, SvgIcon } from '@components';
import { formatter } from '@utils';
import { PlaceInput } from '@pages/components';
import { useGameContext } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import { useBinarySpreadContext } from '../BinarySpreadProvider';
import PlaceButton from './PlaceButton';
import TimePeriods from './TimePeriods';
import usePlaceOrder from './usePlaceOrder';

function MobileActionPanel() {
  const { t } = useTranslation();
  const { selectedSymbolPair } = useGameContext();
  const { useAmountLimit, selectedTimePeriod } = useBinarySpreadContext();
  const {
    data: { minAmount, maxAmount },
  } = useAmountLimit();
  const [amount, setAmount] = useState(() => String(minAmount || ''));
  const inSymbolOnline = useMemo(() => {
    if (!selectedSymbolPair) return true;
    return selectedSymbolPair.orderStatus;
  }, [selectedSymbolPair]);
  const currency = useCurrency();
  const exchanges = useExchanges();
  const balance = useBalance();
  const localCurrency = useLocalCurrency();
  const [validateRes, setValidateRes] = useState(() => ({ amount: '' })); // 校验结果
  const onPlace = usePlaceOrder(Number(amount));
  const payout = useMemo(() => {
    if (!selectedTimePeriod?.highOdds || !amount) return 0;
    return (selectedTimePeriod.highOdds / 100 + 1) * Number(amount);
  }, [selectedTimePeriod, amount]);

  // 设置下单默认值
  useEffect(() => {
    setAmount(formatter.amount(minAmount, currency.name).ceil().toNumber().toString());
  }, [minAmount, currency.name]);

  useEffect(() => {
    setValidateRes((prev) => ({ ...prev, amount: '' }));
  }, [currency]);

  const handleAmountInput = useMemoCallback((amount: string) => {
    setAmount(amount);
    if (Number(amount) <= balance) {
      setValidateRes((prev) => ({ ...prev, amount: '' }));
    }
  });

  return (
    <div className="detrade-card shrink-0 space-y-4 [@media(max-width:375px)]:space-y-2 sticky -bottom-3 z-10">
      <FormItem label={null} error={validateRes.amount}>
        <PlaceInput
          className="flex-1"
          value={amount}
          onChange={handleAmountInput}
          min={minAmount}
          max={maxAmount}
          limitCurrency={currency.name}
        />
      </FormItem>
      <FormItem label={<span className="leading-3">{t('Time and payout')}</span>} className="leading-3">
        <div className="flex items-end gap-4">
          <TimePeriods />
          <div className="flex items-center gap-3 justify-center my-auto text-14">
            <div>{formatter.percent((selectedTimePeriod?.highOdds ?? 0) / 100, true)}</div>
            <div className="text-up truncate">
              {payout
                ? formatter
                    .amount((exchanges[currency.name] * payout) / exchanges[localCurrency], localCurrency)
                    .sign()
                    .toText()
                : 0}
            </div>
          </div>
        </div>
      </FormItem>
      {inSymbolOnline ? (
        <PlaceButton
          onPlace={(direction: Direction) => {
            const errors = { amount: '' };
            if (Number(amount) > balance) {
              errors.amount = t('Balance is not enough');
            }

            if (errors.amount) {
              setValidateRes(errors);
              return;
            } else {
              setValidateRes({ amount: '' });
            }
            onPlace(direction);
          }}
        />
      ) : (
        <div className="detrade-card flex gap-3 p-3">
          <SvgIcon name="remind" className="shrink-0 text-warn" />
          <div className="text-12 text-warn">
            {t('Unavailable daily from {{startTime}} to {{endTime}} ({{timeZone}}) and all day on weekends.', {
              startTime: '20:00',
              endTime: '23:00',
              timeZone: 'UTC+0',
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileActionPanel;
