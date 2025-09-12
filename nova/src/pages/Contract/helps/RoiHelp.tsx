import { useCallback, useEffect, useMemo, useState } from 'react';
import { getI18n, useTranslation } from 'react-i18next';
import { store } from '@store';
import {
  CommissionType,
  useActiveTradingPair,
  usePositionOrders,
  useTradingPairs,
  useTradingPairsParams,
} from '@store/contract';
import { useExchanges } from '@store/wallet';
import { AmountInput, Button, Column, FormItem, Image, Modal, Select, Table } from '@components';
import { cn, formatter } from '@utils';
import { BetButton } from '@pages/components';
import { Direction } from '@/type';
import ChooseFeeType from '../components/ChooseFeeType';
import { calcProfitInfo } from '../ROI';
import { getActiveBetsImpact } from './calcPnlAndRoiData';

interface RoiData {
  priceMove: number;
  formatRoi: string;
  exitPrice: string;
  profit: string;
  originRoi: number;
}

export function showRoiHelp() {
  Modal.open({
    title: getI18n().t('ROI calculator'),
    children: <RoiHelp />,
    size: 'md',
  });
}

export default function RoiHelp() {
  const { data: activeOrders } = usePositionOrders();
  const currentPair = useActiveTradingPair(); // 当前货币对
  const [direction, setDirection] = useState<Direction>(Direction.BuyRise);
  const [wager, setWager] = useState('1000');
  const [multiplier, setMultiplier] = useState(1);
  const [entryPrice, setEntryPrice] = useState('0');
  const [customPriceMove, setCustomPriceMove] = useState('');
  const [feeType, setFeeType] = useState<CommissionType>(CommissionType.PNL);
  const { t } = useTranslation();
  const { data: tradingPairs } = useTradingPairs();
  const { data: symbolParams } = useTradingPairsParams();
  const [pair, setPair] = useState(currentPair); // 下拉选择的货币对
  const exchanges = useExchanges();
  const isStonks = pair.symbol === 'STONKS/USD';

  const symbolOptions = useMemo(() => {
    return tradingPairs.map((pair) => {
      const [currency] = pair.symbol.split('/');
      return {
        label: (
          <div className="flex items-center gap-2">
            <Image src={pair.assetBaseImage} className="rounded-full size-6 shrink-0" />
            <div>
              {currency}
              <span className="text-secondary">/USDT</span>
            </div>
          </div>
        ),
        value: `${pair.symbol}`,
      };
    });
  }, [tradingPairs]);

  function onSymbolChange(value: string | undefined) {
    const item = tradingPairs.find((pair) => pair.symbol === value);
    if (!item) return;
    setPair(item);
  }

  const symbolPriceInfo = useMemo(() => {
    return pair ? symbolParams[pair.symbol] : null;
  }, [symbolParams, pair]);

  // 进行中的订单对ROI的影响因素
  const activeBetsImpact = getActiveBetsImpact({ symbolPriceInfo, activeOrders, exchanges });

  const setCurrentPriceField = useCallback(() => {
    if (!symbolPriceInfo) return;
    setEntryPrice(getCurrentCurrencyPairPrice(pair).toFixed(symbolPriceInfo.precision));
  }, [symbolPriceInfo, pair]);

  useEffect(() => {
    setCurrentPriceField();
  }, [setCurrentPriceField]);

  useEffect(() => {
    isStonks && setFeeType(CommissionType.PNL);
  }, [isStonks]);

  const priceMovePercent = useMemo(() => {
    const custom = Number(customPriceMove);
    if (custom) {
      return [custom];
    }

    return [-100, -50, -10, -5, -1, -0.5, -0.1, -0.05, -0.01, 0, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 50, 100, 500, 1e3];
  }, [customPriceMove]);

  const dataSource = useMemo<RoiData[]>(() => {
    if (!symbolPriceInfo) return [];

    return priceMovePercent.map((item) => {
      const exitPrice = Number(entryPrice) + Number(entryPrice) * (item / 100);
      const profit = calcProfitInfo({
        symbolPriceInfo,
        wager: Number(wager),
        multiplier,
        direction,
        entryPrice: Number(entryPrice),
        feeType,
        exitPrice: Number(entryPrice) + Number(entryPrice) * (item / 100),
        activeBetsImpact,
      });
      const roi = profit / Number(wager);
      const gtLimit = Number(wager) * multiplier > 1000 * 100000;
      return {
        priceMove: item,
        formatRoi: gtLimit ? '-' : formatter.percent(roi, true),
        exitPrice: formatter.price(exitPrice, symbolPriceInfo.precision).toText(),
        profit: gtLimit ? '-' : formatter.amount(profit, 'USDFIAT').sign().toText(), // 这里固定用美元计算
        originRoi: roi,
      };
    });
  }, [priceMovePercent, direction, entryPrice, feeType, multiplier, wager, symbolPriceInfo, activeBetsImpact]);

  const column = useMemo<Column<RoiData>[]>(() => {
    return [
      {
        title: t('Price move'),
        dataIndex: 'priceMove',
        render: ({ originRoi, priceMove }) => {
          return (
            <div
              className={cn(
                originRoi === 0 && 'text-primary',
                originRoi > 0 && 'text-up',
                originRoi < 0 && 'text-down'
              )}
            >
              {priceMove}%
            </div>
          );
        },
      },
      {
        title: 'ROI',
        dataIndex: 'roi',
        align: 'right',
        render: ({ originRoi, formatRoi }) => {
          return (
            <div
              className={cn(
                originRoi === 0 && 'text-primary',
                originRoi > 0 && 'text-up',
                originRoi < 0 && 'text-down'
              )}
            >
              {formatRoi}
            </div>
          );
        },
      },
      {
        title: t('Exit price'),
        dataIndex: 'exitPrice',
        align: 'right',
        render: ({ originRoi, exitPrice }) => {
          return (
            <div
              className={cn(
                originRoi === 0 && 'text-primary',
                originRoi > 0 && 'text-up',
                originRoi < 0 && 'text-down'
              )}
            >
              {exitPrice}
            </div>
          );
        },
      },
      {
        title: 'P&L',
        dataIndex: 'profit',
        render: ({ originRoi, profit }) => {
          return (
            <div
              className={cn(
                originRoi === 0 && 'text-primary',
                originRoi > 0 && 'text-up',
                originRoi < 0 && 'text-down'
              )}
            >
              {profit}
            </div>
          );
        },
      },
    ];
  }, [t]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          {isStonks && (
            <div className="text-12 text-secondary">
              {t('Stonks has 2.5% house edge and a 5% fee on profitable positions.')}
            </div>
          )}
          <FormItem label={t('Entry Price')}>
            <AmountInput
              size="lg"
              value={String(entryPrice)}
              onChange={(value) => setEntryPrice(value)}
              suffix={
                <Select
                  className="h-full max-h-full border-none bg-layer5"
                  align="end"
                  options={symbolOptions}
                  value={pair?.symbol}
                  onChange={onSymbolChange}
                  placeholder={t('Crypto')}
                  size="md"
                />
              }
            />
          </FormItem>
          <FormItem label={t('Will The Price Go Up Or Down')}>
            <div className="flex h-12 -space-x-2 overflow-hidden rounded-2">
              <BetButton
                onClick={() => setDirection(Direction.BuyRise)}
                className={cn(direction !== Direction.BuyRise && 'opacity-20')}
                iconClassName="size-6"
                skewClassName="skew-x-[23deg]"
                direction={Direction.BuyRise}
                size="lg"
              />
              <BetButton
                onClick={() => setDirection(Direction.BuyFall)}
                className={cn(direction !== Direction.BuyFall && 'opacity-20')}
                iconClassName="size-6"
                skewClassName="skew-x-[23deg]"
                direction={Direction.BuyFall}
                size="lg"
              />
            </div>
          </FormItem>
          <FormItem label={t('Trading Amount') + '(USD)'}>
            <AmountInput size="lg" value={wager} onChange={(value) => setWager(value || '0')} />
          </FormItem>
          <FormItem label={t('Payout Multiplier')}>
            <AmountInput
              size="lg"
              value={String(multiplier)}
              onChange={(value) => setMultiplier(Math.min(Number(value) || 0, 1000))}
            />
          </FormItem>
          <FormItem label={t('Custom Price Move %')}>
            <AmountInput size="lg" value={customPriceMove} onChange={(value) => setCustomPriceMove(value)} />
          </FormItem>
          <div>
            {!isStonks && (
              <ChooseFeeType
                value={feeType}
                onChange={setFeeType}
                wager={wager}
                multiplier={multiplier}
                symbol={pair?.symbol}
              />
            )}
          </div>
          <Button
            className="w-full"
            theme="secondary"
            onClick={() => {
              setCurrentPriceField();
              setWager('1000');
              setMultiplier(1);
              setDirection(Direction.BuyRise);
              setCustomPriceMove('');
            }}
            size="lg"
          >
            {t('Reset fields')}
          </Button>
        </div>
        <Table<RoiData>
          columns={column}
          dataSource={dataSource}
          rowKey="priceMove"
          className="flex-1 overflow-auto no-scrollbar"
          size="sm"
        />
      </div>
      <p className="mt-4 text-center text-secondary text-12 font-500">
        {t(
          `*Calculator outcomes are estimates and actual ROI/P&L can differ to what's shown based on market conditions.`
        )}
      </p>
    </div>
  );
}

function getCurrentCurrencyPairPrice(symbol?: SymbolInfo) {
  if (!symbol) return 0;

  const price = store.getState().symbol.symbolPairPriceChangeList.find((it) => it.s === symbol.symbol);
  if (price) {
    return Number(price.p);
  } else {
    return 0;
  }
}
