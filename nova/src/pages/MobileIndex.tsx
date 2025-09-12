import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';
import { useTradingPairs } from '@store/contract/services';
import { useCollectSymbolsMap } from '@store/symbol';
import { setLeverageConfig, useLocalCurrency } from '@store/system';
import { useUserInfo } from '@store/user';
import { useExchanges, useTotalLocaleAmount } from '@store/wallet';
import useFirstDeposit from '@hooks/useFirstDeposit';
import useNavigate from '@hooks/useNavigate';
import { Accordion, Button, Empty, SvgIcon, Tabs } from '@components';
import { formatter, request } from '@utils';
import { useMobileIndexTradingGroup } from '@/layouts/dashboard/useNavMenus';
import LottieBox from '@/Spine/DepositBox';
import TradingPair from './components/TradingPair';
import { ChartView, TimeRange } from './Wallet/Assets';

export default function MobileIndex() {
  const navigate = useNavigate();
  const { isTemporary } = useUserInfo().data;
  const { t } = useTranslation();
  const tradingNavGroup = useMobileIndexTradingGroup();
  const dispatch = useDispatch();
  const firstDeposit = useFirstDeposit();
  const [symbolListIndex, setSymbolListIndex] = useState(1);
  const { data: symbols } = useTradingPairs();
  const collectsMap = useCollectSymbolsMap();
  const filterSymbols = useMemo(() => {
    if (symbolListIndex === 0) {
      return symbols.filter((it) => collectsMap[it.symbol]);
    } else {
      return symbols;
    }
  }, [collectsMap, symbols, symbolListIndex]);
  const balance = useTotalLocaleAmount();
  const currency = useLocalCurrency();

  return (
    <>
      <div className="detrade-card">
        {!isTemporary && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-2 text-16 font-500">{t('Balance')}</div>
                <div className="text-24 font-600">{formatter.amount(balance, currency).floor().toText()}</div>
              </div>

              <Button
                className="shrink-0 w-24 h-10 px-0 font-bold"
                onClick={() => {
                  navigate('#/wallet/deposit');
                }}
              >
                {firstDeposit && <LottieBox />}
                {t('Deposit')}
              </Button>
            </div>
            <ChartViewContainer />
          </>
        )}

        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {tradingNavGroup.map((it) => (
            <Button
              key={it.url}
              className="w-full flex flex-col items-center gap-2"
              theme="transparent"
              size="free"
              onClick={() => navigate(it.url)}
            >
              <div className="relative p-3 border border-layer5 rounded-4">
                {it.icon}
                {it.tag && (
                  <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-layer5 rounded-full">
                    <div className="text-9 text-brand_alt font-500">{it.tag}</div>
                  </div>
                )}
              </div>
              <div className="text-11 font-500">{it.title}</div>
            </Button>
          ))}
        </div>
      </div>

      <div className="detrade-card">
        <Tabs
          className="sticky top-12 z-10 bg-layer3 mb-4"
          theme="chip"
          selectedIndex={symbolListIndex}
          onChange={setSymbolListIndex}
        >
          <Tabs.Header className="flex light:border-layer5">
            <Tabs.Item className="flex-1 flex items-center gap-2 whitespace-nowrap">
              <SvgIcon className="size-3.5 transition-none text-current" name="star" />
              <span>{t('Favorites')}</span>
            </Tabs.Item>
            <Tabs.Item className="flex-1">{t('All')}</Tabs.Item>
          </Tabs.Header>
        </Tabs>
        <TradingPair.Content
          symbols={filterSymbols}
          onChange={(pairs) => {
            dispatch(setLeverageConfig({ symbol: pairs }));
            navigate('/trade-center/futures');
          }}
        />
      </div>
    </>
  );
}

type Pnl = { pnl: number; pnlPercentage: number };

function ChartViewContainer() {
  const { t } = useTranslation();
  const exchange = useExchanges();
  const currency = useLocalCurrency();

  const timeTabs = useMemo(
    () => [
      { title: t('1D'), value: TimeRange.DAY, meaning: 'DAY', desc: t("Today's Pnl") },
      { title: t('1W'), value: TimeRange.WEEK, meaning: 'WEEK', desc: t("Week's Pnl") },
      { title: t('1M'), value: TimeRange.MONTH, meaning: 'MONTH', desc: t("Month's Pnl") },
      { title: t('6M'), value: TimeRange.SIX_MONTH, meaning: 'SIX_MONTH', desc: t("6 Month's Pnl") },
    ],
    [t]
  );

  const [timeTabActiveIndex, setTimeTabActiveIndex] = useState(0);

  const pnlTimeRange = timeTabs[timeTabActiveIndex].meaning;
  const timeRange = timeTabs[timeTabActiveIndex].value;

  const { data: pnlData } = useSWR(
    ['account-pnl', pnlTimeRange],
    async () => {
      return await request.get<Pnl>('/api/account/account/pnl', { timeRange: pnlTimeRange });
    },
    { suspense: true, keepPreviousData: true }
  );

  return (
    <Accordion.Collapse
      className="mb-5"
      content={
        <Suspense fallback={<Empty className="min-h-40" />}>
          <ChartView timeRange={timeRange} />
          <Tabs tabs={timeTabs} selectedIndex={timeTabActiveIndex} onChange={setTimeTabActiveIndex}>
            <Tabs.Header className="flex justify-between bg-transparent">
              {timeTabs.map((item) => (
                <Tabs.Item key={item.value} className="text-12 w-14 h-8" selectedClassName="bg-layer5">
                  {item.title}
                </Tabs.Item>
              ))}
            </Tabs.Header>
          </Tabs>
        </Suspense>
      }
    >
      <div className="flex items-center font-500 text-12">
        <span className="mr-1">{timeTabs[timeTabActiveIndex].desc}</span>
        <span className={pnlData.pnl > 0 ? 'text-up' : 'text-down'}>
          {formatter
            .amount(pnlData.pnl / exchange[currency], currency)
            .floor()
            .sign()
            .toText()}
        </span>
        <span className={pnlData.pnlPercentage > 0 ? 'text-up' : 'text-down'}>
          ({formatter.percent(pnlData.pnlPercentage, true)})
        </span>
      </div>
    </Accordion.Collapse>
  );
}
