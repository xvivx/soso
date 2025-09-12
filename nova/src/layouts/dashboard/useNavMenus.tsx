import { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { SWRResponse } from 'swr';
import { useTradingPairs as useHighLowPairs } from '@store/binary';
import { useTradingPairs as useFeaturePairs } from '@store/contract';
import { useAllTimePeriods, useTradingPairs as useSpreadPairs } from '@store/spread';
import { useSymbolPricesMap } from '@store/symbol';
import { changeUpdown, setBinaryConfig, setLeverageConfig, setSpreadConfig, setTapConfig } from '@store/system';
import { useSettings, useTradingPairs as useTapTradingPairs } from '@store/tap';
import { useTradingPairs as useUpdownPairs } from '@store/upDown';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Image, ScrollArea, SvgIcon } from '@components';
import MoreIcon from '@components/SvgIcon/private/more.svg';
import { formatter } from '@utils';
import { PathTradeCenter } from '@/routes/paths';

interface MenuLink {
  title: ReactNode;
  subTitle?: string;
  icon: ReactElement;
  url: string;
  auth?: boolean;
  key?: string;
  onClick?: () => void;
}

export interface Menu {
  title: ReactNode;
  key: string;
  auth?: boolean;
  children: (MenuLink & { children?: ReactNode })[];
}

function useMenuList() {
  const { isTemporary } = useUserInfo().data;
  const { mobile } = useMediaQuery();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const settings = useSettings();
  const menus = useMemo<Menu[]>(
    () => [
      {
        title: (
          <div className="relative">
            <div>{t('Trade')}</div>
            {settings.showDot && !mobile && (
              <div className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full bg-colorful1" />
            )}
          </div>
        ),
        key: 'trade',
        children: [
          {
            title: t('High Low'),
            key: 'high-low',
            subTitle: t('Guess if the price ends higher or lower than the target.'),
            icon: <SvgIcon name="highLow" />,
            url: '/trade-center/high-low',
            children: (
              <MenuPanel
                useTradingPairs={useHighLowPairs}
                onSelect={(tradingPair) => {
                  navigate(PathTradeCenter.trade);
                  dispatch(setBinaryConfig({ symbol: tradingPair }));
                }}
              />
            ),
          },
          {
            title: t('Spread'),
            key: 'spread',
            subTitle: t(`Win if the price breaks out — above the high or below the low.`),
            icon: <SvgIcon name="spread" />,
            url: PathTradeCenter.spread,
            children: (
              <MenuPanel
                showSpread={true}
                useTradingPairs={useSpreadPairs}
                onSelect={(tradingPair) => {
                  navigate(PathTradeCenter.spread);
                  dispatch(setSpreadConfig({ symbol: tradingPair }));
                }}
              />
            ),
          },
          {
            title: t('Futures'),
            key: 'futures',
            subTitle: t('Boost your trade with up to 1000× leverage — big risk, bigger reward.'),
            icon: <SvgIcon name="contract" />,
            url: PathTradeCenter.futures,
            children: (
              <MenuPanel
                useTradingPairs={useFeaturePairs}
                onSelect={(tradingPair) => {
                  navigate(PathTradeCenter.futures);
                  dispatch(setLeverageConfig({ symbol: tradingPair }));
                }}
              />
            ),
          },
          {
            title: t('Up Down'),
            key: 'up-down',
            subTitle: t('Quick tap: will the price go up or down next?'),
            icon: <SvgIcon name="arrowRotate" />,
            url: PathTradeCenter.upDown,
            children: (
              <MenuPanel
                useTradingPairs={useUpdownPairs}
                onSelect={(tradingPair) => {
                  navigate(PathTradeCenter.upDown);
                  dispatch(changeUpdown({ symbol: tradingPair }));
                }}
              />
            ),
          },
          {
            title: (
              <div className="flex items-center gap-2">
                <div>{t('Tap Trading')}</div>
                {!mobile && (
                  <div className="relative bg-colorful1 font-600 size-11 h-5 leading-5 w-10 text-center rounded-1.5 text-primary_brand">
                    <div className="text-11">{t('Beta')}</div>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                      <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 6L5.65685 0.343146V6V11.6569L0 6Z" fill="#9FE871" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ),
            key: 'tapTrading',
            subTitle: t('Tap to predict — quick moves, instant results.'),
            icon: <SvgIcon name="tap" />,
            url: PathTradeCenter.tapTrading,
            children: (
              <MenuPanel
                useTradingPairs={useTapTradingPairs}
                onSelect={(tradingPair) => {
                  navigate(PathTradeCenter.tapTrading);
                  dispatch(setTapConfig({ symbol: tradingPair }));
                }}
              />
            ),
          },
        ],
      },
      {
        title: t('More'),
        key: 'more',
        children: [
          {
            title: t('VIP'),
            key: 'vip',
            icon: <SvgIcon name="vip" className="size-5" />,
            url: '/dashboard/personal/vip',
          },
          {
            title: t('Rewards hub'),
            key: 'reward-hub',
            icon: <SvgIcon name="rewardHub" className="size-5" />,
            url: '/dashboard/campaign/reward-center',
          },
          {
            title: t('Referral'),
            key: 'referral',
            icon: <SvgIcon name="referral" className="size-5" />,
            url: '/dashboard/referral',
          },
          {
            title: t('Affiliates'),
            key: 'affiliates',
            icon: <SvgIcon name="affiliates" className="size-5" />,
            url: '/dashboard/partnership-program',
          },
          {
            title: t('Integration program'),
            key: 'integration',
            icon: <SvgIcon name="integration" className="size-5" />,
            url: '/dashboard/integration',
          },
        ],
      },
    ],
    [t, dispatch, navigate, mobile, settings.showDot]
  );

  return useMemo(() => {
    if (!isTemporary) return menus;
    return menus
      .map((group) => {
        return {
          ...group,
          children: (group.children || []).filter((sub) => !(group.auth || sub.auth)),
        };
      })
      .filter((group) => group.children.length);
  }, [isTemporary, menus]);
}

export default useMenuList;

interface MenuPanelProps {
  useTradingPairs: () => Omit<SWRResponse<SymbolInfo[], void, { suspense: true }>, 'mutate'>;
  onSelect: (tradingPair: string) => void;
  showSpread?: boolean;
}
function MenuPanel(props: MenuPanelProps) {
  const { useTradingPairs, onSelect, showSpread } = props;
  const { t } = useTranslation();
  const { data: tradingPairs } = useTradingPairs();
  const tickerPrices = useSymbolPricesMap();
  const { data: timePeriods } = useAllTimePeriods();
  // 获取第一个spread
  const getSpread = useCallback(
    (symbol: string) => {
      const matchingPeriods = timePeriods.filter((item) => item.symbol === symbol);
      if (matchingPeriods.length === 0) return '-';
      const minTimePeriod = matchingPeriods.reduce((min, current) => {
        return current.time < min.time ? current : min;
      });
      return minTimePeriod.spread;
    },
    [timePeriods]
  );

  return (
    <ScrollArea className="w-72">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 p-2 rounded-2 font-500 text-tertiary sticky top-0 bg-layer4">
          <div className="text-12">{t('Symbol')}</div>
          <div className="flex-1 text-right text-12">{t('Price')}</div>
          {showSpread && <div className="text-right text-12 w-16">{t('Spread')}</div>}
        </div>
        {tradingPairs.map((tradingPair) => {
          const symbol = tickerPrices[tradingPair.symbol] || {};
          // 后端返回的交易对可能没有价格信息
          const price = symbol.p || 0;
          const change = symbol.c || 0;
          return (
            <div
              key={tradingPair.symbol}
              className="flex items-center gap-2 p-2 cursor-pointer rounded-2 hover:darkness text-primary font-500"
              onClick={() => onSelect(tradingPair.symbol)}
            >
              <Image src={tradingPair.assetBaseImage} className="size-4.5 rounded-full shrink-0" />
              <div className="text-14">
                {tradingPair.symbol.split('/')[0]}
                <span className="text-secondary">/USDT</span>
              </div>

              <div className="flex-1 text-right text-12">
                <div>{formatter.price(price, tradingPair.decimalPlaces).toText()}</div>
                <div className={change > 0 ? 'text-up' : 'text-down'}>{formatter.percent(change)}</div>
              </div>
              {showSpread && (
                <div className="text-right text-12 w-16">
                  <div>{getSpread(tradingPair.symbol)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function useMobileIndexTradingGroup() {
  const { t } = useTranslation();
  return useMemo(() => {
    return [
      {
        title: t('High Low'),
        icon: <SvgIcon name="highLow" />,
        url: '/trade-center/high-low',
        tag: t('Simple'),
      },
      {
        title: t('Spread'),
        icon: <SvgIcon name="spread" />,
        url: PathTradeCenter.spread,
      },
      {
        title: t('Futures'),
        icon: <SvgIcon name="contract" />,
        url: PathTradeCenter.futures,
        tag: 'X1000',
      },
      {
        title: t('Up Down'),
        icon: <SvgIcon name="arrowRotate" />,
        url: PathTradeCenter.upDown,
      },
      {
        title: t('Tap Trading'),
        icon: <SvgIcon name="tap" />,
        url: PathTradeCenter.tapTrading,
        tag: t('New'),
      },
      {
        title: t('More'),
        url: '#/menu',
        icon: <MoreIcon />,
        bottom: false,
      },
    ];
  }, [t]);
}
