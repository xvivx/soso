import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommissionType, useTradingPairParam } from '@store/contract';
import { useExchanges } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { AmountInput, FormItem, Tooltip } from '@components';
import { cn, formatter, Systems } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import useActiveBetsImpact from '../hooks/useActiveBetsImpact';
import { changeClosePrice, changeCloseProfit, changeTakePrice, changeTakeProfit } from '../ROI';

export interface AutoTakeProfitAndLLossPriceProps {
  value: {
    takeAtPrice: string;
    takeAtProfit: string;
    closeAtPrice: string;
    closeAtProfit: string;
  };
  onChange(value: this['value']): void;
  onError(message: string): void;
  wager: number;
  multiplier: number;
  entryPrice?: number;
  direction: Direction;
  feeType: CommissionType;
  symbol: string;
  className?: string;
  currency: string;
}
function AutoTakeProfitAndLLossPrice(props: AutoTakeProfitAndLLossPriceProps) {
  const {
    value,
    onChange,
    onError,
    wager,
    multiplier,
    entryPrice = 0,
    direction,
    feeType,
    symbol,
    currency,
    className,
  } = props;
  const [takeErrorMessage, setTakeErrorMessage] = useState('');
  const [closeErrorMessage, setCloseErrorMessage] = useState('');
  const [takeAtPrice, setTakeAtPrice] = useState(value.takeAtPrice);
  const [takeAtProfit, setTakeAtProfit] = useState(value.takeAtProfit);
  const [closeAtPrice, setCloseAtPrice] = useState(value.closeAtPrice);
  const [closeAtProfit, setCloseAtProfit] = useState(value.closeAtProfit);
  const { mobile } = useMediaQuery();
  const [takeType, setTakeType] = useState<'price' | 'profit'>(mobile ? 'price' : 'profit');
  const [closeType, setCloseType] = useState<'price' | 'profit'>(mobile ? 'price' : 'profit');
  const symbolPrice = useTradingPairParam(symbol);
  const exchange = useExchanges()[currency];
  const { t } = useTranslation();
  const tradingPairsMap = useGameTradingPairsMap();
  const tradingPairPrecision = (symbol && tradingPairsMap[symbol]?.decimalPlaces) || 2;
  const activeBetsImpact = useActiveBetsImpact();

  useEffect(() => {
    onError(takeErrorMessage || closeErrorMessage);
  }, [takeErrorMessage, closeErrorMessage, onError]);

  const autoFocusScrollIntoView = useMemoCallback((event) => {
    // 尝试解决ios输入框被弹起的键盘遮挡的问题
    if (Systems.device.isIOS) {
      setTimeout(() => {
        (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 500);
    }
  });

  useEffect(() => {
    if (!symbolPrice) return;

    const params = {
      symbolPrice,
      wager: wager * exchange, // 止盈止损输入的是美元, 所以这里需要将下单币种转换为美元
      multiplier,
      direction,
      entryPrice,
      feeType,
      activeBetsImpact,
    };

    if (takeType === 'price') {
      if (!takeAtPrice || !wager || !multiplier) {
        setTakeErrorMessage('');
        setTakeAtProfit('');
      } else {
        try {
          const profit =
            changeTakePrice({
              ...params,
              takeProfitPrice: formatter.price(takeAtPrice, tradingPairPrecision).toNumber(),
            }) / exchange;
          setTakeAtProfit(formatter.amount(profit, currency).floor().toNumber().toString());
          setTakeErrorMessage('');
        } catch (error) {
          setTakeAtProfit('');
          setTakeErrorMessage(error.message);
        }
      }
    } else {
      if (!takeAtProfit || !wager || !multiplier) {
        setTakeAtPrice('');
        setTakeErrorMessage('');
      } else {
        try {
          const profit = formatter.amount(Number(takeAtProfit), currency).floor().toNumber() * exchange;
          if (!profit) {
            setTakeAtPrice('');
            return;
          }
          const exitPrice = changeTakeProfit({ ...params, takeProfitPnl: profit });
          setTakeAtPrice(
            formatter.price(Math.max(0, exitPrice), tradingPairPrecision).toNumber().toFixed(tradingPairPrecision)
          );
          setTakeErrorMessage('');
        } catch (error) {
          setTakeErrorMessage(error.message);
        }
      }
    }

    if (closeType === 'price') {
      if (!closeAtPrice || !wager || !multiplier) {
        setCloseAtProfit('');
        setCloseErrorMessage('');
      } else {
        try {
          const profit =
            changeClosePrice({
              ...params,
              stopLossPrice: formatter.price(closeAtPrice, tradingPairPrecision).toNumber(),
            }) / exchange;
          setCloseAtProfit(formatter.amount(profit, currency).floor().toNumber().toString());
          setCloseErrorMessage('');
        } catch (error) {
          setCloseAtProfit('');
          setCloseErrorMessage(error.message);
        }
      }
    } else {
      if (!closeAtProfit || !wager || !multiplier) {
        setCloseAtPrice('');
        setCloseErrorMessage('');
      } else {
        try {
          const profit = formatter.amount(Number(closeAtProfit), currency).floor().toNumber() * exchange;
          if (!profit) {
            setCloseAtPrice('');
            return;
          }
          const exitPrice = changeCloseProfit({ ...params, stopLossPnl: profit });
          setCloseAtPrice(
            formatter.price(Math.max(0, exitPrice), tradingPairPrecision).toNumber().toFixed(tradingPairPrecision)
          );
          setCloseErrorMessage('');
        } catch (error) {
          setCloseAtPrice('');
          setCloseErrorMessage(error.message);
        }
      }
    }
  }, [
    entryPrice,
    symbolPrice,
    takeAtPrice,
    takeAtProfit,
    closeAtPrice,
    closeAtProfit,
    takeType,
    closeType,
    wager,
    multiplier,
    feeType,
    direction,
    exchange,
    tradingPairPrecision,
    activeBetsImpact,
    currency,
  ]);

  const memoChange = useMemoCallback(onChange);
  useEffect(() => {
    memoChange({
      takeAtPrice: takeAtPrice,
      takeAtProfit: takeAtProfit,
      closeAtPrice: closeAtPrice,
      closeAtProfit: closeAtProfit,
    });
  }, [takeAtPrice, takeAtProfit, closeAtPrice, closeAtProfit, memoChange]);

  return (
    <div className={cn('space-y-3', className)}>
      <FormItem label={null} error={takeErrorMessage}>
        <div className="grid grid-cols-5">
          <FormItem
            className="col-span-3 mr-3"
            label={
              <Tooltip
                side="top"
                align="start"
                content={t('Set a target price where your position will be automatically closed to lock in profit.')}
              >
                <div className="text-secondary border-b border-dotted">{`${t('Take profit at price')}(USD)`}</div>
              </Tooltip>
            }
          >
            <AmountInput
              className="bg-layer2"
              value={takeAtPrice}
              onChange={setTakeAtPrice}
              placeholder={t('Price')}
              onFocus={(e) => {
                setTakeType('price');
                autoFocusScrollIntoView(e);
              }}
              precision={(symbol && tradingPairsMap[symbol]?.decimalPlaces) || 2}
              size="lg"
            />
          </FormItem>
          <FormItem className="col-span-2" label={`${t('PnL')}(${currency})`}>
            <AmountInput
              className="bg-layer2 text-up"
              prefix={<span className="text-up text-14 font-700 mr-1">+</span>}
              value={takeAtProfit}
              onChange={setTakeAtProfit}
              onFocus={(e) => {
                setTakeType('profit');
                autoFocusScrollIntoView(e);
              }}
              placeholder={t('Profit')}
              size="lg"
            />
          </FormItem>
        </div>
      </FormItem>

      <FormItem label={null} error={closeErrorMessage}>
        <div className="grid grid-cols-5">
          <FormItem
            className="col-span-3 mr-3"
            label={
              <Tooltip
                side="top"
                align="start"
                content={t(
                  'Set a price to limit losses. Your position will be closed automatically if the market hits this price.'
                )}
              >
                <div className="text-secondary border-b border-dotted">{`${t('Stop loss at price')}(USD)`}</div>
              </Tooltip>
            }
          >
            <AmountInput
              className="bg-layer2"
              value={closeAtPrice}
              onChange={setCloseAtPrice}
              onFocus={(e) => {
                setCloseType('price');
                autoFocusScrollIntoView(e);
              }}
              placeholder={t('Price')}
              precision={(symbol && tradingPairsMap[symbol]?.decimalPlaces) || 2}
              size="lg"
            />
          </FormItem>
          <FormItem className="col-span-2" label={`${t('PnL')}(${currency})`}>
            <AmountInput
              className="bg-layer2 text-down"
              prefix={<span className="text-down text-14 font-700 mr-1">-</span>}
              value={closeAtProfit}
              onChange={setCloseAtProfit}
              onFocus={(e) => {
                setCloseType('profit');
                autoFocusScrollIntoView(e);
              }}
              placeholder={t('Profit')}
              size="lg"
            />
          </FormItem>
        </div>
      </FormItem>
    </div>
  );
}

export default AutoTakeProfitAndLLossPrice;
