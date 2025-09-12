import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';
import { useTradingPairs } from '@store/contract';
import { CandleResponse, useCollectSymbolsMap, useSymbolPricesMap } from '@store/symbol';
import { changeUpdown, setBinaryConfig, setLeverageConfig, setSpreadConfig, setTapConfig } from '@store/system';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, Column, Image, Loading, Table, Tabs } from '@components';
import { cn, formatter, request } from '@utils';
import { Card } from '@pages/components';
import TradingPair from '@pages/components/TradingPair';
import { GameTypeNumber } from '@/type';
import Chart from './Chart';

interface Markets {
  amplitude: number; // 24h振幅
  highPrice: number; // 24h最高价
  lowPrice: number; // 24h最低价
  maxLeverage: number; // 最大杠杆倍数
  price: number; // 当前价格
  symbol: string; // 交易对
  volume: number; // 24h交易量
}

interface SymbolSummary {
  candlestickData: CandleResponse[];
  symbol: string;
  symbolDetail: Markets;
}

interface Table extends Markets {
  chart: CandleResponse[];
}

function Markets() {
  const { t } = useTranslation();
  const tickerPrices = useSymbolPricesMap();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const collectsMap = useCollectSymbolsMap();
  const [sortState, setSortState] = useState<{ key: string | null; order: 'asc' | 'desc' | null }>({
    key: null,
    order: null,
  });
  const { isTemporary } = useUserInfo().data;
  const { data: futuresTradingPairs } = useTradingPairs();

  // 获取New卡片symbol字符串
  const { data: newCardList, isLoading: newCardLoading } = useSWR(
    ['symbol-summary'],
    () => {
      return request.get<{ icon: string; symbol: string }[]>('/api/data/tradePairConfig/latestSymbols');
    },
    { fallbackData: [] }
  );

  // 获取Hot、Top Gain卡片symbol字符串
  const { data: baseCardList, isLoading: baseCardLoading } = useSWR(
    ['market-list'],
    () => {
      return request.get<{ type: 'HOT' | 'TOP_GAINER'; symbols: { icon: string; symbol: string }[] }[]>(
        '/api/statistic/market/list'
      );
    },
    { fallbackData: [] }
  );

  // 根据卡片类型配置不同标题
  const titleMap = useMemo(() => {
    return {
      'HOT': t('Hot'),
      'TOP_GAINER': t('Top gainer'),
    };
  }, [t]);

  // 完整卡片数据
  const cardList = useMemo(() => {
    return [
      {
        title: t('New'),
        symbols: newCardList,
      },
      ...baseCardList.map((market) => {
        return {
          ...market,
          symbols: (market.symbols || []).slice(0, 3),
          title: titleMap[market.type],
        };
      }),
    ];
  }, [baseCardList, titleMap, newCardList, t]);

  const tabs = useMemo(() => {
    return [
      { title: t('All'), value: undefined, url: '/trade-center/futures', action: setSpreadConfig },
      ...(!isTemporary
        ? [{ title: t('Favorite'), value: 'favorite', url: '/trade-center/futures', action: setLeverageConfig }]
        : []),
      { title: t('High low'), value: GameTypeNumber.Binary, url: '/trade-center/high-low', action: setBinaryConfig },
      { title: t('Spread'), value: GameTypeNumber.BinarySpread, url: '/trade-center/spread', action: setSpreadConfig },
      { title: t('Futures'), value: GameTypeNumber.Contract, url: '/trade-center/futures', action: setLeverageConfig },
      { title: t('Up down'), value: GameTypeNumber.Updown, url: '/trade-center/up-down', action: changeUpdown },
      {
        title: t('Tap Trading'),
        value: GameTypeNumber.TapTrading,
        url: '/trade-center/tap-trading',
        action: setTapConfig,
      },
    ];
  }, [t, isTemporary]);
  const tabType = tabs[tabIndex].value;

  // 非favorite数据根据类型查询不同symbol数据;
  const { data: symbolList } = useSWR(
    tabType !== 'favorite' ? ['symbol-list', tabIndex] : null,
    async () => {
      const pairs = await request.get<SymbolInfo[]>('/api/transaction/symbol/list', {
        type: tabType,
      });
      return pairs.filter((pair) => pair.onlineStatus);
    },
    { fallbackData: [] }
  );

  /**
   * 根据tab的选择构建成symbol字符串
   * 后端data服务需要用字符串"-"拼接交易对
   */
  const symbols = useMemo(() => {
    // favorite取收藏的symbol字符串
    if (tabType === 'favorite') {
      return Object.keys(collectsMap)
        .map((collect) => collect.replace('/', '-'))
        .join(',');
    }
    // 其他从symbol-list取
    return symbolList.map((symbol) => symbol.symbol.replace('/', '-')).join(',');
  }, [symbolList, tabType, collectsMap]);

  // 用symbols字符串查询表格原始数据
  const { data: symbolSummary, isLoading } = useSWR(
    symbols ? ['symbol-summary', symbols] : null,
    async () => {
      const res = await request.get<SymbolSummary[]>('/api/data/tradePairConfig/symbolSummary', {
        symbols,
      });
      return res.map((item) => {
        // 将表格源数据symbol字段转为'/'分割
        return { ...item, symbol: item.symbol.replace('-', '/') };
      });
    },
    { fallbackData: [] }
  );

  // 用原始数据构造table实际数据
  const dataSource = useMemo(() => {
    const data = symbolSummary
      .filter((symbol) => symbol.symbolDetail)
      .map((market) => ({
        ...market.symbolDetail,
        symbol: market.symbol,
        chart: market.candlestickData,
      }));

    if (sortState.key && sortState.order) {
      data.sort((a, b) => {
        const aValue = a[sortState.key as keyof Table] as number;
        const bValue = b[sortState.key as keyof Table] as number;
        return sortState.order === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }
    return data;
  }, [symbolSummary, sortState]);

  const column = useMemo<Column<Table>[]>(() => {
    return [
      {
        title: t('Symbol'),
        dataIndex: 'symbol',
        render(market) {
          const [tradingPair] = market.symbol.split('/');
          return (
            <div className="flex items-center gap-2">
              <TradingPair.CollectButton symbol={market.symbol} />
              {tradingPair}/USDT
            </div>
          );
        },
      },
      {
        title: t('Last price'),
        dataIndex: 'price',
        align: 'right',
        sort: 'all',
        render(market) {
          if (!market.symbol) return '';
          const price = tickerPrices[market.symbol]?.p || market.price;
          const item = symbolList.find((current) => current.symbol === market.symbol);
          return <div>{formatter.price(price, item?.decimalPlaces).toText()}</div>;
        },
      },
      {
        title: t('24H High'),
        dataIndex: 'highPrice',
        align: 'right',
        sort: 'all',
        render(market) {
          if (!market.symbol) return '';
          const item = symbolList.find((current) => current.symbol === market.symbol);
          return <div>{formatter.price(market.highPrice, item?.decimalPlaces).toText()}</div>;
        },
      },
      {
        title: t('24H Low'),
        dataIndex: 'lowPrice',
        align: 'right',
        sort: 'all',
        render(market) {
          if (!market.symbol) return '';
          const item = symbolList.find((current) => current.symbol === market.symbol);
          return <div>{formatter.price(market.lowPrice, item?.decimalPlaces).toText()}</div>;
        },
      },
      {
        title: t('24H Trading volume'),
        dataIndex: 'volume',
        align: 'right',
        sort: 'all',
        render(market) {
          return market.volume ? formatter.kbm(market.volume || 0) : undefined;
        },
      },
      {
        title: t('24H Chg %'),
        dataIndex: 'amplitude',
        align: 'right',
        sort: 'all',
        render(market) {
          const change = tickerPrices[market.symbol]?.c;
          return <div className={change > 0 ? 'text-up' : 'text-down'}>{formatter.percent(change, true)}</div>;
        },
      },
      {
        title: t('Charts'),
        dataIndex: 'charts',
        align: 'center',
        render(market) {
          return <Chart dataSource={market.chart} />;
        },
      },
      {
        title: '',
        dataIndex: 'action',
        render(market) {
          return (
            <Button
              onClick={() => {
                // 如果All选项卡，需要检查该交易对是否支持
                const shouldDispatch =
                  tabType === undefined || tabType === 'favorite'
                    ? futuresTradingPairs.some(
                        (tradingPair) => tradingPair.symbol === market.symbol && tradingPair.onlineStatus
                      )
                    : true;

                if (shouldDispatch) {
                  dispatch(tabs[tabIndex].action({ symbol: market.symbol }));
                }

                navigate(tabs[tabIndex].url);
              }}
              size="sm"
              theme="primary"
            >
              {t('Trade now')}
            </Button>
          );
        },
      },
    ];
  }, [t, dispatch, navigate, symbolList, tickerPrices, futuresTradingPairs, tabType, tabIndex, tabs]);

  return (
    <div className="min-h-100 relative">
      {(newCardLoading || baseCardLoading) && <Loading />}
      {!(newCardLoading || baseCardLoading) && (
        <>
          <div className="relative flex gap-4 text-14 font-600 mb-4">
            {cardList.map((market) => {
              return (
                <div key={market.title} className="p-4 flex-1 bg-layer3 rounded-2 space-y-4">
                  <div>{market.title}</div>
                  {market.symbols.map((symbolItem) => {
                    // cardList数据源于不同服务, symbol可能是'-'和'/'拼接的都有
                    const [base] = symbolItem.symbol.split(/[\/\-]/);
                    const price = tickerPrices[base + '/USD']?.p || 0;
                    const change = tickerPrices[base + '/USD']?.c || 0;
                    return (
                      <div key={base} className="grid grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Image src={symbolItem.icon} className="size-4 rounded-full" />
                          <div>{base}/USDT</div>
                        </div>
                        <div className="text-right">{price}</div>
                        <div className={cn(change > 0 ? 'text-up' : 'text-down', 'text-right')}>
                          {formatter.percent(change)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <Card className="s768:px-8 s768:pt-3 s768:pb-8">
            <Tabs selectedIndex={tabIndex} onChange={setTabIndex} direction="horizontal" theme="chip">
              <Tabs.Header className="flex">
                {tabs.map((tab) => (
                  <Tabs.Item key={tab.title}>{tab.title}</Tabs.Item>
                ))}
              </Tabs.Header>
            </Tabs>

            <Table
              className="mt-3"
              columns={column}
              loading={isLoading}
              rowKey="symbol"
              dataSource={dataSource}
              onSort={setSortState}
            />
          </Card>
        </>
      )}
    </div>
  );
}
export default Markets;
