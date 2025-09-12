import { memo, ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Image from '@components/image';
import { GameTypeNumber } from '@/type';
import bannerImageBinary from './assets/price-formulation-binary.png';
import bannerImageContract from './assets/price-formulation-contract.png';
import bannerImageSpread from './assets/price-formulation-spread.png';

const maps = {
  [GameTypeNumber.Binary]: bannerImageBinary,
  [GameTypeNumber.BinarySpread]: bannerImageSpread,
  [GameTypeNumber.Contract]: bannerImageContract,
} as Record<number, string>;
function PriceDetail(props: { children?: ReactNode; gameType: GameTypeNumber }) {
  const { t } = useTranslation();
  const { children, gameType } = props;
  const css = {
    title: 'text-18 font-bold mb-4',
    subTitle: 'text-16 font-bold mb-2',
    code: 'mb-1 inline-block p-1 rounded bg-layer1',
  };

  return (
    <div className="text-secondary">
      <div className="flex flex-col gap-8 mb-8">
        <Image src={maps[gameType]} />
        <div className="flex-1">
          <h2 className={css.title}>{t('Detrade Index Prices')}</h2>
          <p className="mb-4">
            {t(
              'To provide fair and reliable pricing for the trading games, Detrade calculates a composite index price every 500 milliseconds that is derived from real-time price feeds to the worlds most liquid spot and derivative cryptocurrency exchanges. By incorporating many price sources, the Detrade index is robust to market manipulation, technical issues, and other anomalous trading activity that may occur on individual exchanges from time to time.'
            )}
          </p>
        </div>
      </div>

      <h2 className={css.title}>{t('INDEX CONSTITUENTS SPOT EXCHANGES')}</h2>

      <h3 className={css.subTitle}>{t('Spot Exchanges')}</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Binance</li>
        <li>Okex</li>
        <li>Huobi</li>
        <li>KuCoin</li>
        <li>MEXC</li>
        <li>Bybit</li>
      </ul>

      <h3 className={css.subTitle}>{t('Derivative Exchanges')}</h3>
      <ul className="list-disc list-inside mb-8">
        <li>{`Binance(${t('Coin-Margined')})`}</li>
        <li>{`Binance(${t('USDT-Margined')})`}</li>
        <li>{`Huobi(${t('Coin-Margined')})`}</li>
        <li>{`Huobi(${t('USDT-Margined')})`}</li>
        <li>{`OKEx(${t('Coin-Margined')})`}</li>
        <li>{`OKEx(${t('USDT-Margined')})`}</li>
      </ul>

      <p className="mb-8">
        {t(
          'The index price methodology has been designed to satisfy two important statistical properties of time series: the Markov and martingale properties. The Markov property refers to the memoryless nature of a stochastic process, which ensures that the conditional probability distribution of future values only depends on the current value. The martingale property implies that the current value of a stochastic process is also the expected value of future values. These two properties make Detrade`s index prices unbiased estimators of future prices, so that users can trade on the changes in value of the underlying cryptocurrencies without having to worry about the microstructure effects of individual exchanges.'
        )}
      </p>

      <h3 className={css.subTitle}>{t('The calculation steps are as follows:')}</h3>
      <ul className="list-decimal list-inside mb-8">
        <li>{t(`Subscribe to as many levels of depth as available using each exchange's streaming APIs.`)}</li>
        <li>{t('Remove any price feeds for which there have been no market data updates for the last 30 seconds.')}</li>
        <li>
          {t(
            'Remove any price feeds with crossed buy and sell prices or whose top-of-book mid-price is more than 10% away from the median top-of-book mid-price across all price feeds.'
          )}
        </li>
        <li>
          {t(
            'Wait until there are at least 6 valid price feeds. If there are not enough price feeds, the Detrade index price will not be updated.'
          )}
        </li>
        <li>
          {t(
            'Combine all resting limit orders from each price feed into a single composite order book. It is okay and expected that the price of some buy orders will exceed the price of some sell orders from other exchanges. Individual order sizes are capped to $1 million to limit the influence of a single large order.'
          )}
        </li>
        <li className="mb-3">
          {t(
            'Using the composite order book, a function is defined to represent the marginal price to buy or sell a given amount. For example, the marginal buying function is:'
          )}
        </li>
        <div className={css.code}>{`P_buy(s) = max{p_i | sum_{i in 1..N}{s_i} <= s}`}</div>
        <div className="mb-4">
          <Trans i18nKey="Where <0>p_i | i in 1..N</0> and <1>s_i|i in 1..N</1> are the buy prices and sizes sorted in increasing distance from the top-of-book. This function gives the maximum price one would pay to buy an amount <2>s</2>">
            <code className={css.code} />
            <code className={css.code} />
            <code className={css.code} />
          </Trans>
        </div>
        <li>
          {t(
            'The marginal buy and sell price functions are then used to define a marginal mid-price function given a size: '
          )}
        </li>
        <div className={css.code}>P_mid(s)=(P_buy(s)+P_sell(s))/2</div>
        <li>
          {t(
            'The final index price is then calculated as the weighted average of the marginal mid-prices at each size. The weights are chosen to be the probability density of the exponential distribution, which is monotonically decreasing, resulting in a higher emphasis on prices closer to the top-of-book. The weights are given by:'
          )}
        </li>
        <div className={css.code}>w_i=L*exp(-L*v_i)</div>
        <div className="mb-4">
          <Trans i18nKey="Where <0>v_i</0> are the sizes at which the mid-prices are calculated and are defined as the union of the cumulative buy and sell sizes from the composite order book. <1>L</1> is a scaling factor defined as <2>1/V</2>, where <3>V</3> is the maximum size at which a mid-price is calculated and is defined as the minimum of the sum of buying and selling sizes in the composite order book.">
            <code className={css.code} />
            <code className={css.code} />
            <code className={css.code} />
            <code className={css.code} />
          </Trans>
        </div>
        <div>
          {t(
            'The output of this calculation is a single index price that is used for both long and short positions in the Detrade trading game. Unlike with most other trading platforms, Detrade does not charge a bid-offer spread. Trading with a single price makes it possible to speculate on short-term price moves for which a bid-offer spread would be prohibitively expensive.'
          )}
        </div>
      </ul>

      <h2 className={css.title}>{t('Funding Payments')}</h2>
      <p className="mb-8 ">
        {t(
          'Keep your position open for longer than 8 hours and you might incur or receive hourly funding payments, depending on market conditions. When the market is bullish, the funding rate is positive and long traders pay short traders. When the market is bearish, the funding rate is negative and short traders pay long traders.'
        )}
        <br />
        <br />
        {t(
          'For example, if you have an open long BTC position for $500 with a 10x multiplier and the funding rate is 0.1%, you will be charged $0.21 per hour after the first 8 hours. If the position were short rather than long, then you would receive funding payments. If your position is closed within 8 hours, no funding payments will be made.'
        )}
      </p>

      <h2 className={css.title}>{t('Bust And Stop Loss Prices')}</h2>
      <div className="mb-8">
        {t(
          'Regardless of the liquidity in the underlying markets, Detrade guarantees that busts and stop loss trades will consistently be filled at a price predetermined at entry. Bust losses are limited to the original position size and stop losses are limited by the trader entry setting. The trigger prices for busts and stop losses can be calculated by:'
        )}
        <div className="mt-2 mb-4 p-2 rounded bg-layer1">P_trigger=P_close*(1+trade_sign*bust_buffer)</div>
        <Trans i18nKey="Where <0>P_close</0> is <1>P_open*(1-1/multiplier_leverage)</1> for busts or the stop loss price.">
          <code className={css.code} />
          <code className={css.code} />
        </Trans>
      </div>

      <h2 className={css.title}>{t('Market Impact Effects')}</h2>
      <p className={children ? 'mb-8' : ''}>
        {t(
          `When traded on a traditional exchange with a central limit order book, large taking orders will generally cross with resting orders beyond the best bid or offer, resulting in an average fill price worse than the top-of-book price. Market makers restrict the amount of liquidity that they're willing to offer at the top-of-book because of the additional risk that large orders represent. Rather than require large orders to be filled at multiple prices, Detrade instead uses a market impact formula to set the closing price for winning trades (losing manually-closed trades are unaffected) to replicate the market impact of large taking orders, but in a more consistent and predictable way. The easiest way to see the exact market impact effects is to use the ROI Calculator found on the futures trading page.`
        )}
      </p>
      {children}
    </div>
  );
}

export default memo(PriceDetail);
