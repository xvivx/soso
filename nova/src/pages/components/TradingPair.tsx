import { memo, ReactNode, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import useSWR from 'swr';
import { toggleCollectSymbol, useActivePrice, useCollectSymbolsMap, useSymbolPricesMap } from '@store/symbol';
import { setSymbolPairFilter } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import usePrevious from '@hooks/usePrevious';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Image, Input, Popover, ScrollArea, SvgIcon, Tabs } from '@components';
import { cn, formatter, request } from '@utils';
import hots from '@/assets/fire.png';
import { Direction, GameTypeNumber } from '@/type';
import HowItWorkTrigger from './HowItWorkTrigger';

export interface SymbolDetail {
  symbol: string;
  price: number;
  volume: number;
  highPrice: number;
  lowPrice: number;
}

function CollectSymbolButton(props: { symbol: string; className?: string }) {
  const collectSymbolsMap = useCollectSymbolsMap();
  const { symbol, className } = props;

  return (
    <Button
      className={cn(collectSymbolsMap[symbol] ? 'text-warn' : 'text-primary opacity-10')}
      size="free"
      theme="transparent"
      icon={<SvgIcon className={cn('size-3.5 text-current hover:text-current', className)} name="star" />}
      onClick={async (event) => {
        event.stopPropagation();
        await toggleCollectSymbol(symbol);
      }}
    />
  );
}

/**
 * 货币对Header容器(包含收藏、交易对、实时价格、玩法说明)
 */
function TradingPair(props: {
  className?: string;
  onChange: (value: string) => void;
  tradingPair: SymbolInfo;
  symbols: SymbolInfo[];
  gameType: GameTypeNumber;
  children?: ReactNode;
}) {
  const { className, tradingPair, onChange, symbols, children, gameType } = props;
  const { mobile } = useMediaQuery();
  return (
    <div
      id="trading-pair"
      className={cn(
        'flex justify-start items-center flex-wrap px-4 pt-3 s768:pb-3 s768:px-3 s768:h-16 gap-x-3 bg-layer3 rounded-2',
        className
      )}
    >
      {/* 收藏按钮 */}
      {!mobile && <CollectSymbolButton symbol={tradingPair.symbol} className="size-5" />}
      {/* 交易对 */}
      <TradingPairPopover onChange={onChange} tradingPair={tradingPair} symbols={symbols} />
      {children || (
        <>
          {/* 实时价格 */}
          <ActivePrice tradingPair={tradingPair} />
          {/*手机端不展示 */}
          {!mobile && <SymbolDetail tradingPair={tradingPair} />}
        </>
      )}
      {/* 玩法说明 */}
      <HowItWorkTrigger gameType={gameType} tradingPair={tradingPair} />
    </div>
  );
}

function SymbolDetail({ tradingPair }: { tradingPair: SymbolInfo }) {
  const { t } = useTranslation();
  const { data: detail, isLoading: loading } = useSWR(
    ['symbol-detail', tradingPair.symbol],
    ([_, symbol]) => {
      return request.get<{ lowPrice: number; highPrice: number; volume: number }>(`/api/data/symbol/detail`, {
        symbol: symbol.replace('/', '-'),
      });
    },
    { keepPreviousData: true }
  );
  const stats = useMemo(() => {
    if (!detail) return null;
    return [
      { title: t('24h low'), value: formatter.price(detail.lowPrice, tradingPair.decimalPlaces).toText() },
      { title: t('24h high'), value: formatter.price(detail.highPrice, tradingPair.decimalPlaces).toText() },
      { title: t('Volume (24h)'), value: formatter.kbm(detail.volume) },
    ];
  }, [tradingPair, detail, t]);

  if (loading || !stats) return null;
  return (
    <div className="flex gap-4 items-center order-3 whitespace-nowrap">
      {stats.map((item) => (
        <div key={item.title}>
          <div className="text-12 text-secondary">{item.title}</div>
          <div className="text-12 text-primary">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * 货币对下拉Trigger
 */
function Trigger(props: { className?: string; open: boolean; tradingPair: SymbolInfo }) {
  const { className, open, tradingPair } = props;
  const { gt768 } = useMediaQuery();
  const currency = useMemo(() => {
    if (!tradingPair) return '';
    const [baseCurrency] = tradingPair.symbol.split('/');
    return baseCurrency;
  }, [tradingPair]);

  return (
    <div id="trading-pair-trigger" className={cn('flex items-center select-none', className)}>
      <Image src={tradingPair.assetBaseImage} className="rounded-full size-6 s768:size-7 mr-2" />
      <div className="mr-1 text-14 s768:text-24">
        {currency}
        {gt768 && <span className="text-secondary">/USDT</span>}
      </div>
      <SvgIcon
        name="arrow"
        className={cn('text-primary transition-all size-4 s768:size-6', open ? '-rotate-90' : 'rotate-90')}
      />
    </div>
  );
}

/**
 * 实时价格
 */
function ActivePrice({ tradingPair }: { tradingPair: SymbolInfo }) {
  const { price: currentPrice, change: currentChange } = useActivePrice();
  const previousPrice = usePrevious(currentPrice) || 0;
  const isDown = currentPrice < previousPrice;
  return (
    <div className={cn('flex items-center', isDown ? 'text-down' : 'text-up')}>
      <span className="text-18 s768:text-26 font-700 mr-2">
        {(currentPrice && tradingPair && formatter.price(currentPrice, tradingPair.decimalPlaces).toText()) || '--'}
      </span>
      <SvgIcon.Updown
        className="size-4 hover:text-current"
        direction={isDown ? Direction.BuyFall : Direction.BuyRise}
      />
      <span className="text-14 s768:text-16 font-600">
        {currentPrice && tradingPair ? formatter.percent(currentChange, 'fixed') : '--'}
      </span>
    </div>
  );
}

/**
 * 货币对Popover
 */
function TradingPairPopover(props: {
  onChange: (tradingPair: string) => void;
  tradingPair: SymbolInfo;
  symbols: SymbolInfo[];
}) {
  const { onChange, tradingPair, symbols } = props;
  const [open, setOpen] = useState(false);
  return (
    <Popover
      align="start"
      overlayClassName="min-h-36 s768:max-h-[70vh] s768:w-[360px]"
      open={open}
      onOpenChange={setOpen}
      content={
        <TradingPairContent
          symbols={symbols}
          selectedSymbolName={tradingPair.symbol}
          inPopover
          onChange={(tradingPair) => {
            setOpen(false);
            onChange(tradingPair);
          }}
        />
      }
    >
      <Trigger open={open} tradingPair={tradingPair} />
    </Popover>
  );
}

interface TradingPairProps {
  className?: string;
  onChange?: (symbol: string) => void;
  inPopover?: boolean;
  symbols: SymbolInfo[];
  selectedSymbolName?: string;
}

/**
 * 包含搜索栏 + 货币对列表
 */
function TradingPairContent(props: TradingPairProps) {
  const { className, symbols, inPopover, selectedSymbolName, onChange } = props;
  const [filterText, setFilterText] = useState('');

  const options = useMemo(() => {
    const keyText = filterText.trim();
    if (!keyText) return symbols;
    // 根据搜索过滤option
    return symbols.filter((symbol) => {
      const [currency] = symbol.symbol.split('/');
      return currency.toUpperCase().includes(keyText.toUpperCase());
    });
  }, [symbols, filterText]);

  return (
    <div id="trading-pair-list" className={cn('flex flex-col w-full text-12 font-500', className)}>
      <Input.Search className="h-8 mb-3 text-12 bg-layer3" value={filterText} onChange={setFilterText} />
      <TradingPairList
        onChange={onChange}
        selectedSymbolName={selectedSymbolName}
        data={options}
        inPopover={inPopover}
      />
    </div>
  );
}

/**
 * 无搜索栏的货币对列表
 */
function TradingPairList(props: {
  onChange?: (symbol: string) => void;
  selectedSymbolName?: string;
  inPopover?: boolean;
  data: SymbolInfo[];
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { onChange, selectedSymbolName, inPopover, data } = props;

  const scrollViewRef = useRef<HTMLDivElement>(null);
  const tickerPrices = useSymbolPricesMap();
  const filter = useSelector((state) => state.system.symbolPairFilter);

  const sortedOptions = useMemo(() => {
    const { price, change } = filter;
    if (price === 0 && change === 0) return data;
    return [...data].sort((curr, next) => {
      const currSymbol = tickerPrices[curr.symbol];
      const nextSymbol = tickerPrices[next.symbol];
      if (!currSymbol || !nextSymbol) return 1;
      if (price === 1) {
        return currSymbol.p - nextSymbol.p;
      } else if (price === 2) {
        return nextSymbol.p - currSymbol.p;
      } else if (change === 1) {
        return currSymbol.c - nextSymbol.c;
      } else if (change === 2) {
        return nextSymbol.c - currSymbol.c;
      } else {
        return null as never;
      }
    });
  }, [filter, data, tickerPrices]);

  useLayoutEffect(() => {
    if (!selectedSymbolName || !inPopover) return;
    const matched = document.getElementById(`symbols-list-no-${selectedSymbolName}`)!;
    const scrollView = scrollViewRef.current;
    if (!matched || !scrollView) return;

    // 确保元素在可视区域内，但不强制居中
    const targetScrollTop = Math.max(
      0,
      Math.min(
        matched.offsetTop - (scrollView.clientHeight - matched.clientHeight) / 2, // 尝试居中
        scrollView.scrollHeight - scrollView.clientHeight // 不超过最大滚动范围
      )
    );
    const animateFrameId = window.requestAnimationFrame(() => {
      scrollView.scrollTo({ left: 0, top: targetScrollTop });
    });
    return () => {
      window.cancelAnimationFrame(animateFrameId);
    };
  }, [selectedSymbolName, inPopover]);

  return (
    <>
      <div className="flex items-center shrink-0 h-6 gap-2 px-2 overflow-hidden text-secondary text-12">
        <div className="flex-1">{t('Symbol')}</div>
        <div className="flex-1 text-right">
          <Button
            className="font-500 shadow-none"
            theme="transparent"
            size="free"
            onClick={() => {
              dispatch(setSymbolPairFilter(['price', filter.price === 0 ? 2 : filter.price === 2 ? 1 : 0]));
            }}
          >
            {t('Last price')}
            <FilterIcon type={filter.price} />
          </Button>
        </div>
        <div className="shrink-0 w-1/4 text-right">
          <Button
            className="font-500 shadow-none"
            theme="transparent"
            size="free"
            onClick={() => {
              dispatch(setSymbolPairFilter(['change', filter.change === 0 ? 2 : filter.change === 2 ? 1 : 0]));
            }}
          >
            {t('Chg%')}
            <FilterIcon type={filter.change} />
          </Button>
        </div>
      </div>
      {sortedOptions.length === 0 ? (
        <div className="flex-1 p-10 flex-center text-secondary">{t('No data available')}</div>
      ) : (
        <ScrollArea ref={scrollViewRef} className="flex-1 px-4 -mx-4 s768:-mx-3 s768:px-3">
          <div className="space-y-0.5">
            {sortedOptions.map((tradingPair, index) => {
              const symbol = tickerPrices[tradingPair.symbol] || {};
              const [currency] = tradingPair.symbol.split('/');
              // 后端返回的交易对可能没有价格信息
              const price = symbol.p || 0;
              const change = symbol.c || 0;
              return (
                <div
                  key={tradingPair.symbol}
                  id={`symbols-list-no-${tradingPair.symbol}`}
                  className={cn(
                    'flex items-center gap-2 p-2 text-right cursor-pointer rounded-2 hover:darkness',
                    change > 0 ? 'text-up' : 'text-down',
                    selectedSymbolName === tradingPair.symbol && 'bg-layer5'
                  )}
                  onClick={() => {
                    if (onChange && selectedSymbolName !== tradingPair.symbol) onChange(tradingPair.symbol);
                  }}
                >
                  <div className="flex items-center flex-1 text-primary">
                    <CollectSymbolButton symbol={tradingPair.symbol} />
                    <Image src={tradingPair.assetBaseImage} className="size-5 ml-3 mr-1.5 rounded-full shrink-0" />
                    <div className="flex items-center">
                      {currency}
                      <span className="text-secondary">/USDT</span>
                      {index <= 2 && <Image src={hots} className="size-3 ml-1.5" />}
                    </div>
                  </div>

                  <div className="flex-1">{formatter.price(price, tradingPair.decimalPlaces).toText()}</div>
                  <div className="shrink-0 w-1/4">{formatter.percent(change)}</div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </>
  );
}

/**
 * 用于游戏区的交易对侧滑面板
 */
const TradingPairPanel = memo(function SymbolPanel(props: {
  onChange: (symbol: string) => void;
  tradingPair: SymbolInfo;
  symbols: SymbolInfo[];
}) {
  const { onChange, tradingPair, symbols } = props;
  const { gt1366 } = useMediaQuery();
  const [open, toggleOpen] = useReducer((open) => !open, gt1366);
  const containerRef = useRef<HTMLDivElement>(null);
  const onAnimationComplete = useMemoCallback(() => {
    !open && (containerRef.current!.style.position = 'absolute');
  });
  const onAnimationStart = useMemoCallback(() => {
    containerRef.current!.removeAttribute('style');
  });
  const { t } = useTranslation();
  const tabs = useMemo(
    () => [
      {
        title: (
          <div className="whitespace-nowrap flex items-center gap-2">
            <SvgIcon className="size-3.5 transition-none text-current" name="star" />
            <span>{t('Favorites')}</span>
          </div>
        ),
      },
      { title: t('All') },
    ],
    [t]
  );
  const [symbolListIndex, setSymbolListIndex] = useState(1);
  const collectsMap = useCollectSymbolsMap();
  const filterSymbols = useMemo(() => {
    switch (symbolListIndex) {
      case 0:
        return symbols.filter((it) => collectsMap[it.symbol]);
      case 1:
        return symbols;
      default:
        return [];
    }
  }, [collectsMap, symbols, symbolListIndex]);

  return (
    <div
      ref={containerRef}
      className={cn('z-10 inset-y-0 left-0', gt1366 ? 'relative' : ['absolute', open && 'shadow-r'])}
      // 在三方大屏时首次加载会relative, 此时收起状态应该定位不然会有gap
      style={{ position: open ? undefined : 'absolute' }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="relative h-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: 360 }}
            exit={{ width: 0 }}
            onAnimationStart={onAnimationStart}
            onAnimationComplete={onAnimationComplete}
          >
            <div className="detrade-card" style={{ width: 360 }}>
              <Tabs theme="chip" selectedIndex={symbolListIndex} onChange={setSymbolListIndex}>
                <Tabs.Header className="flex light:border-layer5">
                  {tabs.map((tab, key) => (
                    <Tabs.Item key={key} className="flex-1">
                      {tab.title}
                    </Tabs.Item>
                  ))}
                </Tabs.Header>
              </Tabs>
              {/* 要定位不然会撑破容器 */}
              <TradingPairContent
                className="detrade-card absolute inset-y-0 top-16 left-0 overflow-hidden"
                symbols={filterSymbols}
                selectedSymbolName={tradingPair.symbol}
                onChange={(symbol) => onChange(symbol)}
                inPopover
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* translate和button冲突, 所以多包一层 */}
      <div className={cn('absolute top-1/2 -translate-y-1/2 left-full z-20', open ? '-rotate-90' : 'rotate-90')}>
        <Button className="shadow-none" theme="transparent" icon={<SvgIcon.Updown />} onClick={toggleOpen} />
      </div>
    </div>
  );
});

function FilterIcon(props: { type: ValueOf<StoreState['system']['symbolPairFilter']> }) {
  const { type } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path className={type === 2 ? 'text-brand' : 'text-tertiary'} d="M5 9L8 6H2L5 9Z" fill="currentColor" />
      <path className={type === 1 ? 'text-brand' : 'text-tertiary'} d="M5 1L8 4H2L5 1Z" fill="currentColor" />
    </svg>
  );
}

export default Object.assign(memo(TradingPair), {
  Popover: TradingPairPopover,
  Content: TradingPairContent,
  List: TradingPairList,
  Panel: TradingPairPanel,
  CollectButton: CollectSymbolButton,
});
