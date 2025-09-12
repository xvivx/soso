import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommissionType, useActiveTradingPair, useLever, useOrderAmountLimit } from '@store/contract';
import { useBalance, useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { Accordion, FormItem, message, Tabs, Tooltip } from '@components';
import { cn, formatter } from '@utils';
import { BetButton, PlaceInput } from '@pages/components';
import { Direction } from '@/type';
import BustPrice from '../components/BustPrice';
import AutoTakeProfitAndLLoss, { AutoTakeProfitAndLLossRef } from './AutoTakeProfitAndLLoss';
import DirectionButtons from './DirectionButtons';
import FeeAndHelp from './FeeAndHelp';
import LeverInput from './LeverInput';
import LeverSlider from './LeverSlider';
import StopPlaceTips from './StopPlaceTips';
import usePlaceOrder from './usePlaceOrder';

function PCPanel(props: { defaultDirection?: Direction; className?: string; onSuccess?: () => void }) {
  const { t } = useTranslation();
  const { className, defaultDirection, onSuccess } = props;
  const [direction, setDirection] = useState(defaultDirection || Direction.BuyRise);
  const [amount, setAmount] = useState('');
  const currency = useCurrency();
  const balance = useBalance();
  const multiplier = useLever();
  const [feeType, setFeeType] = useState<CommissionType>(CommissionType.PNL);
  const currentCurrencyPairInfo = useActiveTradingPair();
  const isStonks = currentCurrencyPairInfo.symbol === 'STONKS/USD';
  const [validateRes, setValidateRes] = useState(() => ({ amount: '' }));
  const [tab, setTab] = useState<number>(0);
  const orderType = useMemo(() => {
    if (tab === 0) {
      return 'MARKET';
    } else {
      return 'TP/SL';
    }
  }, [tab]);
  const placeOrder = usePlaceOrder();
  const autoTakeProfitAndLLossRef = useRef<AutoTakeProfitAndLLossRef>(null);

  const handlePlaceOrder = useMemoCallback(async () => {
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

    // 使用止盈止损下单, 但是止盈止损设置有错误
    if (orderType === 'TP/SL' && autoTakeProfitAndLLossRef.current!.getValue()[1]) return;

    await placeOrder(
      orderType,
      Number(amount),
      direction,
      isStonks ? CommissionType.PNL : feeType,
      orderType === 'TP/SL' ? autoTakeProfitAndLLossRef.current!.getValue()[0] : undefined
    );

    message.success(t('Order placed successfully!'));
    onSuccess && onSuccess();
  });

  const {
    data: { minAmount, maxAmount, currency: limitCurrency },
  } = useOrderAmountLimit();

  // 设置amount默认值
  useEffect(() => {
    if (!minAmount) return;

    setAmount((prev) => {
      const prevValue = Number(prev || 0);
      const scaledValue = prevValue * multiplier;
      let result;

      if (scaledValue < minAmount) {
        result = formatter.amount(minAmount / multiplier, currency.name).ceil();
      } else if (scaledValue > maxAmount) {
        result = formatter.amount(maxAmount / multiplier, currency.name).floor();
      } else {
        result = formatter.amount(prevValue, currency.name).floor();
      }

      return result.toNumber().toString();
    });
  }, [minAmount, maxAmount, multiplier, currency.name]);

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
    <div className={cn('space-y-5', className)}>
      <Tabs theme="chip" selectedIndex={tab} onChange={setTab}>
        <Tabs.Header>
          <Tabs.Item className="flex-1">{t('Manual')}</Tabs.Item>
          <Tabs.Item className="flex-1">{t('Auto')}</Tabs.Item>
        </Tabs.Header>
      </Tabs>

      <FormItem
        id="direction-buttons"
        label={<div className="text-12 text-secondary">{t('Will the price go up or down ?')}</div>}
      >
        <DirectionButtons direction={direction} onDirectionChange={setDirection} />
      </FormItem>

      <FormItem label={null} error={validateRes.amount}>
        <PlaceInput
          value={amount}
          onChange={handleAmountInput}
          max={maxAmount / multiplier}
          min={minAmount / multiplier}
          limitCurrency={limitCurrency}
        />
      </FormItem>

      <FormItem
        id="leverage-input"
        label={
          <Tooltip
            side="top"
            align="start"
            content={t(
              'Leverage allows you to amplify your position size with a smaller amount of capital. Higher leverage increases both potential profit and risk.'
            )}
          >
            <div className="text-secondary border-b border-second border-dotted">{t('Leverage')}</div>
          </Tooltip>
        }
      >
        <div className="flex gap-8">
          <LeverInput />
          <div className="my-auto whitespace-nowrap text-right text-12">
            <Tooltip
              side="top"
              align="start"
              content={t(
                'The bust price is the market price at which your position will be liquidated due to insufficient margin.'
              )}
            >
              <div className="text-secondary border-b border-second border-dotted">{t('Liq.Price')}</div>
            </Tooltip>
            <BustPrice className="truncate max-w-20" direction={direction} amount={Number(amount)} feeType={feeType} />
          </div>
        </div>
      </FormItem>

      <LeverSlider />

      {/* 这样包裹一层避免折叠抖动 */}
      <Accordion.Collapse className="!mt-0" defaultOpen={orderType === 'TP/SL'}>
        <AutoTakeProfitAndLLoss
          ref={autoTakeProfitAndLLossRef}
          amount={amount}
          feeType={feeType}
          direction={direction}
        />
      </Accordion.Collapse>

      {!currentCurrencyPairInfo.orderStatus ? (
        <StopPlaceTips />
      ) : (
        <BetButton
          onClick={handlePlaceOrder}
          className="gap-3 w-full h-16"
          iconClassName="size-6"
          skewClassName="rounded-2"
          direction={direction}
        >
          <div className="relative flex items-center gap-3 text-18">
            {direction === Direction.BuyRise ? t('UP') : t('DOWN')}
          </div>
        </BetButton>
      )}

      <FeeAndHelp amount={amount} value={feeType} onChange={setFeeType} />
    </div>
  );
}

export default PCPanel;
