import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommissionType, useActiveTradingPair, useLever, useOrderAmountLimit } from '@store/contract';
import { useBalance, useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { FormItem, message, Modal, SvgIcon, Tooltip } from '@components';
import { cn, formatter } from '@utils';
import { BetButton, PlaceInput } from '@pages/components';
import { Direction } from '@/type';
import { AutoTakeProfitAndLLossPriceProps } from '../components/AutoTakeProfitAndLLossPrice';
import BustPrice from '../components/BustPrice';
import AutoTakeProfitAndLLoss from './AutoTakeProfitAndLLoss';
import DirectionButtons from './DirectionButtons';
import FeeAndHelp from './FeeAndHelp';
import LeverSlider from './LeverSlider';
import StopPlaceTips from './StopPlaceTips';
import usePlaceOrder from './usePlaceOrder';
import useValidateTakeProfitAndLoss from './useValidateTakeProfitAndLoss';

function MobilePanel(props: { defaultDirection?: Direction; className?: string; onSuccess?: () => void }) {
  const { t } = useTranslation();
  const { className, defaultDirection, onSuccess } = props;
  const [direction, setDirection] = useState(defaultDirection || Direction.BuyRise);
  const [amount, setAmount] = useState('');
  /**
   * 弹窗关闭会导致，绑定的autoTakeProfitAndLLossRef为null，为了关闭之后也能访问TP/SL设置的内容
   * 在触发关闭事件的时候，保存值
   */
  const autoTakeProfitAndLLossGetValueRef = useRef<AutoTakeProfitAndLLossPriceProps['value'] | null>(null);
  const currency = useCurrency();
  const balance = useBalance();
  const multiplier = useLever();
  const [feeType, setFeeType] = useState<CommissionType>(CommissionType.PNL);
  const currentCurrencyPairInfo = useActiveTradingPair();
  const isStonks = currentCurrencyPairInfo.symbol === 'STONKS/USD';
  const [validateRes, setValidateRes] = useState(() => ({ amount: '' }));
  const placeOrder = usePlaceOrder();
  const validateTakeProfitStopLoss = useValidateTakeProfitAndLoss({
    direction,
    amount: Number(amount) || 0,
    feeType,
  });
  const [modal, contextHolder] = Modal.useModal();
  const orderTypeRef = useRef<'MARKET' | 'TP/SL'>('MARKET');

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

    if (orderTypeRef.current === 'TP/SL' && autoTakeProfitAndLLossGetValueRef.current) {
      const error = validateTakeProfitStopLoss(autoTakeProfitAndLLossGetValueRef.current);
      if (error) {
        message.error(error);
        return;
      }
    }

    await placeOrder(
      orderTypeRef.current,
      Number(amount),
      direction,
      isStonks ? CommissionType.PNL : feeType,
      orderTypeRef.current === 'TP/SL'
        ? autoTakeProfitAndLLossGetValueRef.current
          ? autoTakeProfitAndLLossGetValueRef.current
          : {
              takeAtPrice: '',
              takeAtProfit: '',
              closeAtPrice: '',
              closeAtProfit: '',
            }
        : undefined
    );
    // 在手机端如果是止盈止损下单成功之后，取消止盈止损，同时初始化设置
    if (orderTypeRef.current === 'TP/SL') {
      orderTypeRef.current = 'MARKET';
      autoTakeProfitAndLLossGetValueRef.current = null;
    }
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

  const handleOpenModal = useMemoCallback(() => {
    const closeModal = modal.open({
      title: t('TP/SL'),
      children: (
        <AutoTakeProfitAndLLoss
          amount={amount}
          feeType={feeType}
          direction={direction}
          outerValue={autoTakeProfitAndLLossGetValueRef.current}
          onMobileConfirm={(value) => {
            // 切换止盈止损下单，在移动端只能去订单列表中取消
            orderTypeRef.current = 'TP/SL';
            autoTakeProfitAndLLossGetValueRef.current = value;

            closeModal();
          }}
        />
      ),
      size: 'md',
    });
  });

  return (
    <div className={cn('space-y-4 [@media(max-width:375px)]:space-y-2 p-3', className)}>
      <DirectionButtons direction={direction} onDirectionChange={setDirection} />
      <FormItem label={null} error={validateRes.amount}>
        <PlaceInput
          value={amount}
          onChange={handleAmountInput}
          max={maxAmount / multiplier}
          min={minAmount / multiplier}
          limitCurrency={limitCurrency}
        />
      </FormItem>
      <FormItem label={null}>
        <div className="flex gap-8">
          <div className="flex-grow">
            <LeverSlider />
          </div>
          <div className="my-auto whitespace-nowrap text-right text-12">
            <Tooltip
              side="top"
              align="start"
              content={t(
                'The bust price is the market price at which your position will be liquidated due to insufficient margin.'
              )}
            >
              <span className="text-secondary border-b border-second border-dotted">{t('Liq.Price')}</span>
            </Tooltip>
            <BustPrice className="truncate w-14" direction={direction} amount={Number(amount)} feeType={feeType} />
          </div>
        </div>
      </FormItem>

      {!currentCurrencyPairInfo.orderStatus ? (
        <StopPlaceTips />
      ) : (
        <div className="gap-4 flex items-center">
          <div className="gap-1 flex items-center text-12 cursor-pointer" onClick={handleOpenModal}>
            <SvgIcon name="setting" className="size-4 text-primary" />
            <span className="text-secondary">{t('TP/SL')}</span>
          </div>
          <BetButton
            onClick={handlePlaceOrder}
            className="gap-3 w-full h-12"
            iconClassName="size-6"
            skewClassName="rounded-2"
            direction={direction}
          >
            <div className="relative flex items-center gap-3 text-18">
              {direction === Direction.BuyRise ? t('UP') : t('DOWN')}
            </div>
          </BetButton>
        </div>
      )}
      <FeeAndHelp amount={amount} value={feeType} onChange={setFeeType} />
      {contextHolder}
    </div>
  );
}

export default MobilePanel;
