import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedGameRule, useWager } from '@store/upDown';
import { IGameRule } from '@store/upDown/types';
import { useBalance, useCurrency, useExchanges } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { FormItem, message } from '@components';
import { cn, formatter } from '@utils';
import { BetButton, PlaceInput } from '@pages/components';
import { Direction } from '@/type';

function BaseFooter(props: {
  className?: string;
  disabled: boolean;
  onOrder: (direction: Direction) => Promise<void>;
}) {
  const { className, disabled, onOrder } = props;
  const { t } = useTranslation();
  const exchange = useExchanges();
  const currency = useCurrency();
  const exchangeRatio = exchange[currency.name];
  const [wager, setWager] = useWager();
  const selectedGameRule = useSelectedGameRule();
  const [validateRes, setValidateRes] = useState(() => ({ amount: '' }));
  const balance = useBalance();

  const handleOrder: typeof onOrder = async (direction) => {
    try {
      const errors = { amount: '' };
      if (Number(wager) > balance) {
        errors.amount = t('Balance is not enough');
      }

      if (errors.amount) {
        setValidateRes(errors);
        return;
      } else {
        setValidateRes({ amount: '' });
      }
      await onOrder(direction);
      message.success(t('Order placed successfully!'));
    } catch {}
  };

  /**
   * @description 更新预设值和下注金额
   * @param {IGameRule} selectedGameRule - 当前选中的游戏规则
   */
  const updatePresetsAndWager = useCallback(
    (selectedGameRule: IGameRule) => {
      const { minAmount } = selectedGameRule;

      // 更新下注金额为最小值
      if (exchange) {
        // 将美元金额转换为当前货币金额并清除尾部的零
        setWager(
          formatter
            .amount(minAmount / exchangeRatio, currency.name)
            .ceil()
            .toNumber()
            .toString()
        );
      }
    },
    [exchange, exchangeRatio, currency.name, setWager]
  );

  // 添加新的 useEffect 来处理页面刷新时的预设值和下注金额更新
  useEffect(() => {
    // 确保有游戏规则和汇率
    if (selectedGameRule && exchange) {
      updatePresetsAndWager(selectedGameRule);
    }
  }, [selectedGameRule, exchange, updatePresetsAndWager]);

  useEffect(() => {
    setValidateRes((prev) => ({ ...prev, amount: '' }));
  }, [currency]);

  const handleAmountInput = useMemoCallback((amount: string) => {
    setWager(amount);
    if (Number(amount) <= balance) {
      setValidateRes((prev) => ({ ...prev, amount: '' }));
    }
  });

  const css = {
    icon: 'size-7',
    skew: 'skew-x-[10deg] s768:skew-x-[16deg] s1366:skew-x-[22deg]',
    space: 's768:-space-x-2 s1366:-space-x-3',
    rounded: 'rounded-2',
  };

  return (
    <div className={cn('detrade-card sticky bottom-0 z-10 p-3 s768:p-4', className)}>
      <div className="space-y-3">
        <FormItem label={null} error={validateRes.amount}>
          <PlaceInput
            min={(selectedGameRule?.minAmount ?? 0) / exchangeRatio}
            max={(selectedGameRule?.maxAmount ?? 100) / exchangeRatio}
            disabled={!exchange}
            value={wager}
            onChange={handleAmountInput}
            limitCurrency={currency.name}
            shortcuts
          />
        </FormItem>
        <div
          id="up-down-direction-buttons"
          className={cn('relative flex h-11 s768:h-16 overflow-hidden', css.rounded, css.space)}
        >
          <BetButton
            direction={Direction.BuyRise}
            onClick={() => handleOrder(Direction.BuyRise)}
            disabled={disabled}
            className="gap-2 s768:gap-3"
            iconClassName={css.icon}
            skewClassName={css.skew}
          >
            <div className="text-16 relative">{t('Up')}</div>
          </BetButton>
          <BetButton
            direction={Direction.BuyFall}
            onClick={() => handleOrder(Direction.BuyFall)}
            disabled={disabled}
            className="flex-row-reverse gap-2 s768:gap-3"
            iconClassName={css.icon}
            skewClassName={css.skew}
          >
            <div className="text-16 relative">{t('Down')}</div>
          </BetButton>
        </div>
      </div>
    </div>
  );
}

export default memo(BaseFooter);
