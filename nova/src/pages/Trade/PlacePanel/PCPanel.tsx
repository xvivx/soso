import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalCurrency } from '@store/system';
import { useBalance, useCurrency, useExchanges } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { AmountInput, FormItem, SvgIcon, Tooltip } from '@components';
import { formatter } from '@utils';
import { PlaceInput } from '@pages/components';
import { useGameContext } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import { useBinarySpreadContext } from '../BinarySpreadProvider';
import PlaceButton from './PlaceButton';
import TimePeriods from './TimePeriods';
import usePlaceOrder from './usePlaceOrder';

function PCPanel() {
  const { t } = useTranslation();
  const { selectedSymbolPair } = useGameContext();
  const { useAmountLimit, selectedTimePeriod } = useBinarySpreadContext();
  const {
    data: { minAmount, maxAmount, currency: limitCurrency },
  } = useAmountLimit();
  const [amount, setAmount] = useState(() => String(minAmount || ''));
  const inSymbolOnline = useMemo(() => {
    if (!selectedSymbolPair) return true;
    return selectedSymbolPair.orderStatus;
  }, [selectedSymbolPair]);
  const currency = useCurrency(); // 当前货币
  const balance = useBalance(); // 可用余额
  const exchanges = useExchanges(); // 当前货币的汇率
  const localCurrency = useLocalCurrency();
  const [validateRes, setValidateRes] = useState(() => ({ amount: '' })); // 校验结果
  const onPlace = usePlaceOrder(Number(amount));

  // 计算 payout
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
    <div className="detrade-card w-80 space-y-5 s1024:w-[340px] s768:p-4 shrink-0">
      <FormItem label={null} error={validateRes.amount}>
        <PlaceInput
          value={amount}
          onChange={handleAmountInput}
          max={maxAmount}
          min={minAmount}
          limitCurrency={limitCurrency}
        />
      </FormItem>
      <TimePeriods />
      <FormItem
        label={
          <Tooltip
            side="top"
            align="start"
            content={t('Earn up to {{payout}}% profit if your prediction is correct.', {
              // 这里highodds和lowodds目前是固定的
              payout: selectedTimePeriod?.highOdds || 0,
            })}
          >
            <div className="text-secondary border-b border-dotted">{t('Payout')}</div>
          </Tooltip>
        }
      >
        <AmountInput
          onChange={() => {}}
          className="shrink-0 min-w-60 text-primary bg-layer2 text-12"
          readOnly
          size="lg"
          prefix={
            <div className="flex items-center gap-8 justify-center w-full">
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
          }
        ></AmountInput>
      </FormItem>
      {inSymbolOnline ? (
        <FormItem id="up-or-down-button" label={t('Up Or Down?')}>
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
        </FormItem>
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

export default PCPanel;
