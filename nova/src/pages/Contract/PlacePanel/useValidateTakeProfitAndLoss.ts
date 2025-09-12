/**
 * 移动端下单的时候如果是止盈止损下单，需要校验止盈止损的值是否符合规则
 * 整体逻辑（参考）： src/pages/Contract/components/AutoTakeProfitAndLLossPrice.tsx
 */
import { useTranslation } from 'react-i18next';
import { sum } from 'lodash-es';
import { CommissionType, useActiveTradingPair, useLever, useTradingPairParam } from '@store/contract';
import { useSymbolPricesMap } from '@store/symbol';
import { useCurrency, useExchanges } from '@store/wallet';
import { formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import { AutoTakeProfitAndLLossPriceProps } from '../components/AutoTakeProfitAndLLossPrice';
import useActiveBetsImpact from '../hooks/useActiveBetsImpact';
import { calcBustPrice, getSymbolPosition } from '../ROI';

export default function useValidateTakeProfitAndLoss({
  direction,
  amount,
  feeType,
}: {
  direction: Direction;
  amount: number;
  feeType: CommissionType;
}) {
  const { t } = useTranslation();
  const { symbol: tradingPair } = useActiveTradingPair() || {};
  const tickerPrices = useSymbolPricesMap();
  const tradingPairsMap = useGameTradingPairsMap();
  const multiplier = useLever();
  const currency = useCurrency().name;
  const exchange = useExchanges()[currency];
  const activeBetsImpact = useActiveBetsImpact();
  const symbolPrice = useTradingPairParam(tradingPair);
  const factor = 1e-4;

  return function validate(autoFields: AutoTakeProfitAndLLossPriceProps['value']) {
    const tradingAmount = amount * exchange;
    const position = tradingAmount * multiplier;
    const { takeAtPrice, closeAtPrice, closeAtProfit } = autoFields;
    const entryPrice = (tradingPair && tickerPrices[tradingPair]?.p) || 0;
    const tradingPairPrecision = (tradingPair && tradingPairsMap[tradingPair]?.decimalPlaces) || 2;
    const takeProfitPrice = formatter.price(takeAtPrice, tradingPairPrecision).toNumber();
    const symbolPosition = getSymbolPosition({ wager: tradingAmount, multiplier, direction });
    const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));

    // 验证takePrice
    if (
      direction === Direction.BuyRise
        ? takeProfitPrice < entryPrice * (1 + factor)
        : takeProfitPrice > entryPrice * (1 - factor)
    ) {
      return t('Trigger price is too close to current price');
    }

    // takeProfit没看到有规则

    // 验证closePrice

    const stopLossPrice = formatter.price(closeAtPrice, tradingPairPrecision).toNumber();
    const bustPrice = calcBustPrice({
      entryPrice: entryPrice,
      pnl: -1 * tradingAmount,
      position: symbolPosition,
      effectivePosition,
      feeStructure: feeType === CommissionType.PNL ? 0 : 1,
      rlbDiscount: 0,
      symbolPriceInfo: symbolPrice,
    });

    if (
      direction === Direction.BuyRise
        ? stopLossPrice < bustPrice * (1 + factor)
        : stopLossPrice > bustPrice * (1 - factor)
    ) {
      return t('Trigger price is too close to bust price');
    }

    if (
      direction === Direction.BuyRise
        ? stopLossPrice > entryPrice * (1 - factor)
        : stopLossPrice < entryPrice * (1 + factor)
    ) {
      return t('Trigger price is too close to current price');
    }

    // 验证closeProfit
    const stopLossPnl = formatter.amount(Number(closeAtProfit), currency).floor().toNumber() * exchange;
    const feeStructure = feeType === CommissionType.PNL ? 0 : 1;
    const stopLossBustPrice = calcBustPrice({
      entryPrice: entryPrice,
      pnl: -1 * stopLossPnl,
      position: symbolPosition,
      effectivePosition,
      feeStructure,
      rlbDiscount: 0,
      symbolPriceInfo: symbolPrice,
    });

    if (
      direction === Direction.BuyRise
        ? stopLossBustPrice > entryPrice * (1 - factor)
        : stopLossBustPrice < entryPrice * (1 + factor)
    ) {
      return t('Trading amount is too large for selected multiplier for selected stop loss price');
    }

    const wagerBustPrice = calcBustPrice({
      entryPrice: entryPrice,
      pnl: -1 * tradingAmount,
      position: symbolPosition,
      effectivePosition,
      feeStructure,
      rlbDiscount: 0,
      symbolPriceInfo: symbolPrice,
    });

    if (direction === Direction.BuyRise ? stopLossBustPrice < wagerBustPrice : stopLossBustPrice > wagerBustPrice) {
      return t('Stop loss price cannot be through bust price');
    }
  };
}
