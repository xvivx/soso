import { sum } from 'lodash-es';
import { CommissionType } from '@store/contract';
import i18n from '@/i18n';
import { Direction } from '@/type';

export interface SymbolPrice {
  name: string;
  bust_buffer: number;
  buffer_multiplier: number;
  base_rate: number;
  rate_exponent: number;
  rate_multiplier: number;
  position_multiplier: number;
  precision: number;
  interest_rate: number;
  interest_threshold: number;
  impact_speed: number;
  fixed_cost: number;
  impact_cost: number;
}

export function getSymbolPosition(params: { wager: number; multiplier: number; direction: Direction }) {
  const { wager, multiplier, direction } = params;
  return (direction === Direction.BuyRise ? 1 : -1) * multiplier * wager;
}

export function calcSymbolBustPrice(params: {
  entryPrice: number;
  wager: number;
  multiplier: number;
  direction: Direction;
  symbolPriceInfo: SymbolPrice;
  feeType: CommissionType;
  activeBetsImpact: number[];
}) {
  const { symbolPriceInfo, wager, multiplier, direction, entryPrice, feeType, activeBetsImpact } = params;
  const position = wager * multiplier;
  const symbolPosition = getSymbolPosition({ wager, multiplier, direction });
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));

  return calcBustPrice({
    entryPrice,
    pnl: -1 * wager,
    position: symbolPosition,
    effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount: 0,
    symbolPriceInfo,
  });
}

export function calcBustPrice(params: {
  entryPrice: number;
  pnl: number;
  position: number;
  effectivePosition: number;
  feeStructure: number;
  rlbDiscount: number;
  symbolPriceInfo: SymbolPrice;
}) {
  const { entryPrice, pnl, position, effectivePosition, feeStructure, rlbDiscount, symbolPriceInfo } = params;
  const {
    priceBuffer,
    baseRate,
    rateMultiplier,
    rateExponent,
    positionMultiplier,
    pricePrecision,
    positionOffsetMultiplier,
  } = {
    priceBuffer: symbolPriceInfo.bust_buffer,
    positionOffsetMultiplier: symbolPriceInfo.buffer_multiplier,
    baseRate: symbolPriceInfo.base_rate,
    rateExponent: symbolPriceInfo.rate_exponent,
    positionMultiplier: symbolPriceInfo.position_multiplier,
    rateMultiplier: symbolPriceInfo.rate_multiplier,
    pricePrecision: symbolPriceInfo.precision,
    // 这两个参数还没用到
    // interestRate: symbolPriceInfo.interest_rate,
    // interestThreshold: symbolPriceInfo.interest_threshold,
  };
  const b = unknown2({
    entryPrice,
    pnl: pnl,
    position: position,
    baseRate: baseRate,
    rateMultiplier: rateMultiplier,
    rateExponent: rateExponent,
    positionMultiplier: positionMultiplier,
    effectivePosition: effectivePosition,
    feeStructure: feeStructure,
    rlbDiscount: rlbDiscount,
  });
  const y = unknown3({
    entryPrice: entryPrice,
    position: position,
    priceBuffer: priceBuffer,
    positionOffsetMultiplier: positionOffsetMultiplier,
  });
  return Number((b + y).toFixed(pricePrecision));
}

function unknown2(params: {
  entryPrice: number;
  pnl: number;
  position: number;
  baseRate: number;
  rateMultiplier: number;
  rateExponent: number;
  positionMultiplier: number;
  effectivePosition: number;
  feeStructure: number;
  rlbDiscount: number;
}) {
  const {
    entryPrice,
    pnl,
    position,
    baseRate,
    rateMultiplier,
    // rateExponent,
    positionMultiplier,
    effectivePosition,
    feeStructure,
    rlbDiscount,
  } = params;
  if (position === 0) return 0;
  if (pnl > 0 && feeStructure === 0) {
    const h = Math.max(1, Math.max(Math.abs(position), effectivePosition)) / 1e6;
    const m = unknown1(
      Math.abs(pnl / position),
      1 - baseRate * (1 - rlbDiscount),
      h,
      positionMultiplier,
      rateMultiplier
    );
    return entryPrice * (1 + m * Math.sign(position));
  } else {
    return entryPrice * (1 + pnl / position);
  }
}

function unknown3(params: {
  entryPrice: number;
  position: number;
  priceBuffer: number;
  positionOffsetMultiplier: number;
}) {
  const { entryPrice, position, priceBuffer, positionOffsetMultiplier } = params;
  return entryPrice * (priceBuffer + Math.abs(position) * positionOffsetMultiplier) * Math.sign(position);
}

/** 暂时不清楚是用来计算什么的 */
function unknown1(e: number, t: number, n: number, r: number, i: number) {
  return (t * Math.sqrt((e * (4 * t * (i * n + r) + i * r * e)) / (t * t * i * r)) + e) / (2 * t);
}

function calcTempProfit(params: {
  entryPrice: number;
  exitPrice: number;
  position: number;
  baseRate: number;
  rateMultiplier: number;
  rateExponent: number;
  positionMultiplier: number;
  effectivePosition: number;
  feeStructure: number;
  rlbDiscount: number;
}) {
  const {
    entryPrice,
    exitPrice,
    position,
    baseRate,
    rateMultiplier,
    rateExponent,
    positionMultiplier,
    effectivePosition,
    feeStructure,
    rlbDiscount,
  } = params;
  let h = (exitPrice / entryPrice - 1) * position;
  if (h > 0 && feeStructure === 0) {
    const m = Math.max(1e-8, (exitPrice / entryPrice - 1) * Math.sign(position)),
      v = Math.max(1, Math.max(Math.abs(position), effectivePosition)) / 1e6,
      x =
        (1 - baseRate * (1 - rlbDiscount)) /
        (1 + 1 / Math.pow(m * rateMultiplier, rateExponent) + v / (m * positionMultiplier));
    h *= x;
  }
  return h;
}

export function calcProfitInfo(params: {
  wager: number;
  multiplier: number;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  feeType: CommissionType;
  // 从prices列表中找到当前symbol的price信息
  symbolPriceInfo: SymbolPrice;
  activeBetsImpact: number[];
  rlbDiscount?: number;
}) {
  const {
    symbolPriceInfo,
    wager,
    multiplier,
    direction,
    entryPrice,
    feeType,
    exitPrice,
    activeBetsImpact,
    rlbDiscount = 0,
  } = params;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, wager * multiplier]));

  // 爆仓价格
  const bustPrice = calcBustPrice({
    entryPrice: entryPrice,
    pnl: -1 * wager,
    position: getSymbolPosition({
      wager: wager,
      multiplier: multiplier,
      direction: direction,
    }),
    effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount,
    symbolPriceInfo,
  });

  let tempProfit = calcTempProfit({
    entryPrice: Number(entryPrice),
    exitPrice: exitPrice,
    position: getSymbolPosition({
      wager: Number(wager),
      multiplier: Number(multiplier),
      direction: direction,
    }),
    baseRate: symbolPriceInfo.base_rate,
    rateMultiplier: symbolPriceInfo.rate_multiplier,
    rateExponent: symbolPriceInfo.rate_exponent,
    positionMultiplier: symbolPriceInfo.position_multiplier,
    effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount: 0,
  });

  if (direction === Direction.BuyRise ? exitPrice <= bustPrice : exitPrice >= bustPrice) {
    tempProfit = -1 * Number(wager);
  }

  return tempProfit;
}

// unknown参数和折扣相关, 没有折扣就取0
export const calcFlatFee = (
  symbolPrice: SymbolPrice,
  position: number,
  activeBetsImpact: number[] = [],
  unknown = 0
) => {
  const hasCost = symbolPrice.fixed_cost > 0 && symbolPrice.impact_cost > 0;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));

  if (!hasCost) return 0;

  return (
    (2 *
      1e-4 *
      Math.abs(position) *
      (symbolPrice.fixed_cost * (1 - unknown) + (symbolPrice.impact_cost * Math.abs(effectivePosition)) / 1e6)) /
    (2 * position)
  );
};

export function changeTakePrice(params: {
  symbolPrice: SymbolPrice;
  wager: number;
  multiplier: number;
  direction: Direction;
  takeProfitPrice: number;
  entryPrice: number;
  feeType: CommissionType;
  activeBetsImpact: number[];
}) {
  const factor = 1e-4;
  const { symbolPrice, wager, multiplier, direction, feeType, activeBetsImpact, takeProfitPrice, entryPrice } = params;
  const position = wager * multiplier;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));
  const tempProfit = calcTempProfit({
    entryPrice: entryPrice,
    exitPrice: takeProfitPrice,
    position: getSymbolPosition({ wager, multiplier, direction }),
    baseRate: symbolPrice.base_rate,
    rateMultiplier: symbolPrice.rate_multiplier,
    rateExponent: symbolPrice.rate_exponent,
    positionMultiplier: symbolPrice.position_multiplier,
    effectivePosition: effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount: 0,
  });
  if (
    direction === Direction.BuyRise
      ? takeProfitPrice < entryPrice * (1 + factor)
      : takeProfitPrice > entryPrice * (1 - factor)
  ) {
    throw new Error(i18n.t('Trigger price is too close to current price'));
  }

  return tempProfit;
}

function calcExitPriceByProfit(params: {
  symbolPrice: SymbolPrice;
  entryPrice: number;
  pnl: number;
  position: number;
  effectivePosition: number;
  feeStructure: number;
  rlbDiscount: number;
}) {
  const { symbolPrice, entryPrice, pnl, position, effectivePosition, feeStructure, rlbDiscount } = params;

  return unknown2({
    entryPrice,
    pnl,
    position,
    baseRate: symbolPrice.base_rate,
    rateMultiplier: symbolPrice.rate_multiplier,
    rateExponent: symbolPrice.rate_exponent,
    positionMultiplier: symbolPrice.position_multiplier,
    effectivePosition,
    feeStructure,
    rlbDiscount,
  });
}

export function changeTakeProfit(params: {
  symbolPrice: SymbolPrice;
  wager: number;
  multiplier: number;
  direction: Direction;
  takeProfitPnl: number;
  entryPrice: number;
  activeBetsImpact: number[];
  feeType: CommissionType;
  rlbDiscount?: number;
}) {
  const {
    symbolPrice,
    wager,
    multiplier,
    direction,
    takeProfitPnl,
    entryPrice,
    activeBetsImpact,
    feeType,
    rlbDiscount = 0,
  } = params;
  const position = wager * multiplier;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));

  return calcExitPriceByProfit({
    symbolPrice,
    entryPrice,
    pnl: takeProfitPnl,
    position: getSymbolPosition({ wager, multiplier, direction }),
    effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount,
  });
}

export function changeClosePrice(params: {
  symbolPrice: SymbolPrice;
  wager: number;
  multiplier: number;
  direction: Direction;
  stopLossPrice: number;
  entryPrice: number;
  activeBetsImpact: number[];
  rlbDiscount?: number;
  feeType: CommissionType;
}) {
  const factor = 1e-4;
  const {
    symbolPrice,
    wager,
    multiplier,
    direction,
    stopLossPrice,
    entryPrice,
    rlbDiscount = 0,
    activeBetsImpact,
    feeType,
  } = params;
  const feeStructure = feeType === CommissionType.PNL ? 0 : 1;
  const position = wager * multiplier;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));
  const symbolPosition = getSymbolPosition({ wager, multiplier, direction });
  const exitPrice =
    stopLossPrice -
    unknown3({
      entryPrice,
      position: symbolPosition,
      priceBuffer: symbolPrice.bust_buffer,
      positionOffsetMultiplier: symbolPrice.buffer_multiplier,
    });
  const closePrice = -calcTempProfit({
    entryPrice,
    exitPrice: exitPrice,
    position: symbolPosition,
    baseRate: symbolPrice.base_rate,
    rateMultiplier: symbolPrice.rate_multiplier,
    rateExponent: symbolPrice.rate_exponent,
    positionMultiplier: symbolPrice.position_multiplier,
    effectivePosition,
    feeStructure,
    rlbDiscount,
  });
  const bustPrice = calcBustPrice({
    entryPrice: entryPrice,
    pnl: -1 * wager,
    position: symbolPosition,
    effectivePosition,
    feeStructure: feeType === CommissionType.PNL ? 0 : 1,
    rlbDiscount,
    symbolPriceInfo: symbolPrice,
  });

  if (
    direction === Direction.BuyRise
      ? stopLossPrice < bustPrice * (1 + factor)
      : stopLossPrice > bustPrice * (1 - factor)
  ) {
    throw new Error(i18n.t('Trigger price is too close to bust price'));
  }

  if (
    direction === Direction.BuyRise
      ? stopLossPrice > entryPrice * (1 - factor)
      : stopLossPrice < entryPrice * (1 + factor)
  ) {
    throw new Error(i18n.t('Trigger price is too close to current price'));
  }

  return closePrice;
}

export function changeCloseProfit(params: {
  symbolPrice: SymbolPrice;
  wager: number;
  multiplier: number;
  direction: Direction;
  stopLossPnl: number;
  entryPrice: number;
  activeBetsImpact: number[];
  feeType: CommissionType;
  rlbDiscount?: number;
}) {
  const {
    symbolPrice,
    wager,
    multiplier,
    direction,
    stopLossPnl,
    entryPrice,
    activeBetsImpact,
    feeType,
    rlbDiscount = 0,
  } = params;
  const factor = 1e-4;
  const position = wager * multiplier;
  const feeStructure = feeType === CommissionType.PNL ? 0 : 1;
  const effectivePosition = Math.abs(sum([...activeBetsImpact, position]));
  const symbolPosition = getSymbolPosition({ wager, multiplier, direction });
  const stopLossBustPrice = calcBustPrice({
    entryPrice: entryPrice,
    pnl: -1 * stopLossPnl,
    position: symbolPosition,
    effectivePosition,
    feeStructure,
    rlbDiscount,
    symbolPriceInfo: symbolPrice,
  });

  if (
    direction === Direction.BuyRise
      ? stopLossBustPrice > entryPrice * (1 - factor)
      : stopLossBustPrice < entryPrice * (1 + factor)
  ) {
    throw new Error(i18n.t('Trading amount is too large for selected multiplier for selected stop loss price'));
  }

  const wagerBustPrice = calcBustPrice({
    entryPrice: entryPrice,
    pnl: -1 * wager,
    position: symbolPosition,
    effectivePosition,
    feeStructure,
    rlbDiscount,
    symbolPriceInfo: symbolPrice,
  });

  if (direction === Direction.BuyRise ? stopLossBustPrice < wagerBustPrice : stopLossBustPrice > wagerBustPrice) {
    throw new Error(i18n.t('Stop loss price cannot be through bust price'));
  }
  return stopLossBustPrice;
}
