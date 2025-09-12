import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { LeaderboardItem, LeaderboardParams, Sort, useLeaderboard } from '@store/leaderboard';
import { useExchanges } from '@store/wallet';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Image, Pagination, Select, Tabs } from '@components';
import SvgBronzeMedal from '@components/SvgIcon/private/bronze-medal.svg';
import SvgGoldMedal from '@components/SvgIcon/private/gold-medal.svg';
import SvgSilverMedal from '@components/SvgIcon/private/silver-medal.svg';
import Table, { Column, SortState } from '@components/Table';
import { cn, formatter } from '@utils';
import { Card } from '@pages/components';
import leaf from './assets/leaf.png';

const SortMap: Record<string, Sort> = {
  totalTrades: 'COUNTS',
  pnl: 'PNL',
  roi: 'ROI',
  volume: 'VOLUME',
  winRate: 'WIN_RATE',
};

enum TimeType {
  Day = 1,
  Week = 2,
  Month = 3,
}

function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const [mobileTabIndex, setMobileTabIndex] = useState(0); // 手机端tab
  const [filters, setFilters] = useState<LeaderboardParams>({
    page: 1,
    pageSize: 10,
    sort: SortMap.pnl,
    timeRange: TimeType.Day,
  });
  const TradeURLMap = useMemo(() => {
    return {
      PLACE_BINARY_ORDER: { name: t('High Low'), url: '/trade-center' },
      PLACE_CONTRACT_ORDER: { name: t('Futures'), url: '/trade-center/futures' },
      PLACE_CONTEST_ORDER: { name: t('Up Down'), url: '/trade-center/up-down' },
      PLACE_BINARY_SPREAD_ORDER: { name: t('Spread'), url: '/trade-center/spread' },
      PLACE_TAP_ORDER: { name: t('Tap Trading'), url: '/trade-center/tap-trading' },
    };
  }, [t]);
  const currency = 'USDFIAT';
  const exchange = useExchanges();

  const { data, isLoading } = useLeaderboard(filters);

  const handleSort = useCallback((sortState: SortState) => {
    const { key } = sortState;
    setFilters((prev) => ({ ...prev, page: 1, sort: SortMap[key as keyof typeof SortMap] }));
  }, []);

  const titleDatas = useMemo(() => {
    if (mobile) {
      return [
        { label: t('Total trades'), amount: '32M' },
        { label: t('Total traders'), amount: '800K' },
        { label: t('Realized PnL'), amount: '530M' },
      ];
    } else {
      return [
        { label: t('Total trades'), amount: '32,000,000' },
        { label: t('Total traders'), amount: '800,000' },
        { label: t('Realized PnL'), amount: '530,000,000' },
      ];
    }
  }, [mobile, t]);

  const dateOptions = useMemo(() => {
    return [
      { label: t('Day'), value: 1 },
      { label: t('Week'), value: 2 },
      { label: t('Month'), value: 3 },
    ];
  }, [t]);

  const getMedal = useCallback((index: number) => {
    if (index === 1) {
      return <SvgGoldMedal className="size-6" />;
    } else if (index === 2) {
      return <SvgSilverMedal className="size-6" />;
    } else if (index === 3) {
      return <SvgBronzeMedal className="size-6" />;
    } else {
      return <div className="w-5 text-center">{index}</div>;
    }
  }, []);

  const mobileTabChange = useCallback((value: number) => {
    setMobileTabIndex(value);
    switch (value) {
      case 0:
        setFilters((prev) => ({ ...prev, page: 1, sort: SortMap.pnl }));
        break;
      case 1:
        setFilters((prev) => ({ ...prev, page: 1, sort: SortMap.roi }));
        break;
      case 2:
        setFilters((prev) => ({ ...prev, page: 1, sort: SortMap.volume }));
        break;
      default:
        break;
    }
  }, []);

  const columns: Column<LeaderboardItem>[] = useMemo(() => {
    if (mobile) {
      return [
        {
          title: t('Rank'),
          dataIndex: 'rank',
          width: 16,
          align: 'center',
          render: (item) => getMedal(item.rank),
        },
        {
          title: t('Trader'),
          dataIndex: 'trader',
          width: 38,
          render: (item) => (
            <div className="flex items-center">
              <Image src={item.avatar} className="size-6 rounded-full shrink-0 mr-2" />
              <div className="truncate" title={item.name}>
                {item.name}
              </div>
            </div>
          ),
        },
        {
          title: t('PNL'),
          dataIndex: 'pnl',
          width: 24,
          align: 'right',
          render: (item) => (
            <span className={cn(item.pnl > 0 ? 'text-up' : 'text-down')}>
              {formatter
                .amount(item.pnl / exchange[currency], currency)
                .sign()
                .toText()}
            </span>
          ),
        },
      ];
    } else {
      return [
        {
          title: t('Rank'),
          dataIndex: 'rank',
          width: 12,
          align: 'center',
          render: (item) => getMedal(item.rank),
        },
        {
          title: t('Trader'),
          dataIndex: 'trader',
          width: 26,
          render: (item) => (
            <div className="flex items-center">
              <Image src={item.avatar} className="size-6 rounded-full shrink-0 mr-2" />
              <div className="truncate" title={item.name}>
                {item.name}
              </div>
            </div>
          ),
        },
        {
          title: t('Volume'),
          dataIndex: 'volume',
          width: 26,
          align: 'right',
          sort: 'desc',
          render: (item) => formatter.amount(item.volume / exchange[currency], currency).toText(),
        },
        {
          title: t('PNL'),
          dataIndex: 'pnl',
          width: 32,
          align: 'right',
          sort: 'desc',
          render: (item) => (
            <span className={cn(item.pnl > 0 ? 'text-up' : 'text-down')}>
              {formatter
                .amount(item.pnl / exchange[currency], currency)
                .sign()
                .toText()}
            </span>
          ),
        },
        {
          title: t('ROI'),
          dataIndex: 'roi',
          width: 18,
          align: 'right',
          sort: 'desc',
          render: (item) => (
            <span className={cn(item.roi > 0 ? 'text-up' : 'text-down')}>{formatter.percent(item.roi, true)}</span>
          ),
        },
        { title: t('Total trades'), dataIndex: 'totalTrades', width: 26, align: 'center', sort: 'desc' },
        {
          title: t('Top trade'),
          dataIndex: 'topTrade',
          width: 20,
          align: 'left',
          render: (item) => {
            const name = TradeURLMap[item.topTrade as keyof typeof TradeURLMap].name;
            const url = TradeURLMap[item.topTrade as keyof typeof TradeURLMap].url;
            return (
              <NavLink className="border-b border-dotted border-second" to={url}>
                {name}
              </NavLink>
            );
          },
        },
        {
          title: t('Top tokens'),
          dataIndex: 'topTokens',
          width: 22,
          align: 'right',
          render: (item) => (
            <div className="flex justify-end items-center">
              {item.topTokens.map((i) => (
                <Button
                  size="free"
                  theme="text"
                  key={i.currency}
                  className="mr-1 cursor-pointer"
                  onClick={() => navigate('/trade-center/high-low')}
                  icon={<Image src={i.logo} className="rounded-full size-5" />}
                />
              ))}
            </div>
          ),
        },
      ];
    }
  }, [mobile, t, getMedal, exchange, TradeURLMap, navigate]);

  const hasMoreData = useMemo(() => {
    if (mobile) {
      return filters.page * filters.pageSize < data.total;
    }
  }, [mobile, filters.page, filters.pageSize, data.total]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreData) return;
    if (mobile) {
      setFilters((prev) => ({ ...prev, pageSize: prev.pageSize + 10 }));
    } else {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasMoreData, isLoading, mobile]);

  const renderList = useMemo(() => {
    if (mobile) {
      return (
        <>
          <div className="px-4 pt-3 pb-2 bg-layer3 rounded-3">
            <Tabs
              theme="chip"
              className="sticky top-12 bg-layer3 z-20"
              selectedIndex={mobileTabIndex}
              onChange={mobileTabChange}
            >
              <Tabs.Header>
                <Tabs.Item className="flex-1" key={t('PNL')}>
                  {t('PNL')}
                </Tabs.Item>
                <Tabs.Item className="flex-1" key={t('ROI')}>
                  {t('ROI')}
                </Tabs.Item>
                <Tabs.Item className="flex-1" key={t('Volume')}>
                  {t('Volume')}
                </Tabs.Item>
              </Tabs.Header>
            </Tabs>
            <Select
              size="md"
              className="max-w-24 mt-3 mb-1"
              options={dateOptions}
              value={filters.timeRange}
              onChange={(value) => setFilters((prev) => ({ ...prev, page: 1, timeRange: value }))}
              compact
            />
            <Table
              size="sm"
              columns={columns}
              dataSource={data.items}
              rowKey="userId"
              loading={isLoading}
              onSort={handleSort}
            />
          </div>
          {!hasMoreData && !isLoading && (
            <div className="text-12 text-tertiary text-center my-2">{t('No more data')}</div>
          )}
        </>
      );
    } else {
      return (
        <>
          <Card className="detrade-card s768:p-8 s768:pt-4">
            <Card.Title>
              <div className="text-16 font-700">{t('Leaderboard')}</div>
              <Select
                options={dateOptions}
                value={filters.timeRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, page: 1, timeRange: value }))}
                compact
                size="md"
                className="w-34"
              />
            </Card.Title>
            <Table
              size="md"
              columns={columns}
              dataSource={data.items}
              rowKey="userId"
              loading={isLoading}
              onSort={handleSort}
            />
          </Card>
          <div className="flex justify-between items-center py-3">
            <div className="text-12 font-500 text-tertiary">*{t('Updated timely')}</div>
            <Pagination
              current={filters.page}
              pageSize={filters.pageSize}
              total={data.total}
              onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
            />
          </div>
        </>
      );
    }
  }, [
    mobile,
    mobileTabIndex,
    mobileTabChange,
    t,
    dateOptions,
    filters.timeRange,
    filters.page,
    filters.pageSize,
    columns,
    data.items,
    data.total,
    isLoading,
    handleSort,
    hasMoreData,
  ]);

  // 检测手机端滚动位置
  useEffect(() => {
    if (!mobile) return; // 只在移动端启用滚动检测
    const handleScroll = () => {
      const threshold = 10;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const atBottom = scrollHeight - (scrollTop + clientHeight) < threshold;

      if (atBottom) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, mobile, isLoading]);

  return (
    <>
      <div className="referral-gradient flex flex-col justify-center items-center w-full rounded-3 mb-3 px-3 py-8 gap-6">
        <div className="flex justify-center items-center gap-3 s768:gap-12">
          <Image src={leaf} className="w-6 h-16 s768:w-10 s768:h-24" />
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="text-primary text-20 s768:text-26 font-600">{t('Leaderboard')}</div>
            <div className="text-secondary text-12 s768:text-18">{t('Unlock Top Traders, Achieve')}</div>
            <div className="text-secondary text-12 s768:text-18">{t('Champion Profits')}</div>
          </div>
          <Image src={leaf} className="w-6 h-16 s768:w-10 s768:h-24 -scale-x-100" />
        </div>
        <div className="flex gap-2 s768:gap-4">
          {titleDatas.map((item) => (
            <div
              className="flex flex-col justify-center items-center rounded-2 s768:rounded-3 py-1 s768:py-4 px-4 s768:px-18 w-24 s768:w-56 s1024:w-64 bg-white/5 light:bg-black/5"
              key={item.label}
            >
              <div className="text-12 s768:text-14 text-secondary whitespace-nowrap">{item.label}</div>
              <div className="text-16 text-primary font-600 whitespace-nowrap">{item.amount} +</div>
            </div>
          ))}
        </div>
        <Button
          className="px-16 s768:px-8"
          size="lg"
          onClick={() => {
            navigate('/trade-center/high-low');
          }}
        >
          {t('Trade to rank up')}
        </Button>
      </div>
      {renderList}
    </>
  );
}

export default memo(Leaderboard);
