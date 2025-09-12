/**
 * @file GamePeriodSelector
 * @description 游戏周期选择器组件
 * 暂时废弃
 */
import { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdownGameLabel } from '@store/system';
import { useTradingPeriods } from '@store/upDown';
import { IGameRule } from '@store/upDown/types';
import { useExchanges } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button } from '@components';
import { cn, formatter } from '@utils';
import bgCountdownCircle from '../images/countdown-circle.png';

/**
 * @interface GamePeriodSelectorProps
 * @description 组件属性接口
 */
interface IGamePeriodSelectorProps {
  /** 交易对信息 */
  tradingPair: SymbolInfo;
  onSelect: (period: IGameRule) => void;
}

/**
 * @description 倒计时圆圈组件
 */
const CountdownCircle: FC<{ seconds: number; small?: boolean }> = ({ seconds, small = false }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        ' flex flex-col items-center justify-center bg-no-repeat bg-contain text-black font-700 ',
        small ? 'size-18' : 'size-30'
      )}
      style={{ backgroundImage: `url(${bgCountdownCircle})` }}
    >
      <span className={cn('leading-none -ml-2 s768:-mt-2', small ? 'text-24' : 'text-36')}>{seconds}</span>
      <span className={cn('leading-none -ml-1 s768:-ml-2', small ? 'text-9' : 'text-14')}>{t('Seconds')}</span>
    </div>
  );
};

/**
 * @component GamePeriodSelector
 * @description 游戏周期选择器组件
 */
const GamePeriodSelector: FC<IGamePeriodSelectorProps> = ({ tradingPair, onSelect }) => {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const { data: periods } = useTradingPeriods(tradingPair.symbol);
  const currentGameLabel = useUpdownGameLabel();
  // 使用内部状态跟踪选中的游戏
  const [selectedGame, setSelectedGame] = useState<string>('');
  const currency = 'USDFIAT';
  const exchange = useExchanges();

  // 初始化时检查当前游戏标签是否在游戏列表中
  useEffect(() => {
    if (currentGameLabel && periods.some((game) => game.label === currentGameLabel)) {
      setSelectedGame(currentGameLabel);
    }
  }, [currentGameLabel, periods]);

  const handleGameSelect = (period: IGameRule) => {
    setSelectedGame(period.label);
    onSelect(period);
  };

  /**
   * @description PC端游戏卡片
   */
  const renderDesktopCard = (game: IGameRule) => {
    const isSelected = game.label === selectedGame;

    return (
      <article
        key={game.label}
        className={cn(
          'bg-layer3 rounded-3 p-6 text-primary text-16 font-700 border border-thirdly cursor-pointer',
          isSelected && 'border-selected border-2'
        )}
        onClick={() => setSelectedGame(game.label)}
        role="region"
        aria-label={`${game.label} SEC Game Card`}
      >
        {/* 币种图标和名称 */}
        <header className="flex items-center justify-center pb-3 space-x-3 border-b border-thirdly">
          <img src={tradingPair.assetBaseImage} alt={game.symbol} className="object-cover rounded-full size-8" />
          <h3>
            {game.symbol.split('/')[0]}
            <span className="text-secondary">/USDT</span>
          </h3>
        </header>

        {/* 倒计时圆圈 */}
        <section className="flex justify-center mt-8" aria-label="Countdown Timer">
          <CountdownCircle seconds={game.period} />
        </section>

        {/* 投注金额区间 */}
        <section className="flex items-center justify-between mt-8 space-x-11" aria-label="Trading Limits">
          <dl>
            <dt className="mb-3">{t('Min Trade')}</dt>
            <dd className="text-24">{formatter.amount(game.minAmount / exchange[currency], currency).toText()}</dd>
          </dl>
          <dl>
            <dt className="mb-3">{t('Max Trade')}</dt>
            <dd className="text-right text-24">
              {formatter.amount(game.maxAmount / exchange[currency], currency).toText()}
            </dd>
          </dl>
        </section>

        {/* 操作按钮 */}
        <footer className="mt-8">
          <Button className="w-full" onClick={() => handleGameSelect(game)}>
            {t('Go trading')}
          </Button>
        </footer>
      </article>
    );
  };

  /**
   * @description 移动端游戏卡片
   */
  const renderMobileCard = (game: IGameRule) => {
    const isSelected = game.label === selectedGame;

    return (
      <article
        key={game.label}
        className={cn(
          'bg-layer3 rounded-3 px-4 py-3 text-primary text-12 font-700 border border-thirdly',
          'border transition-all duration-150',
          'touch-manipulation', // 优化触摸体验
          'active:scale-[0.97] active:bg-opacity-60', // iOS风格的按压效果
          'active:shadow-inner', // 内阴影效果增加深度感
          isSelected && 'border-selected border-2'
        )}
        onClick={() => setSelectedGame(game.label)}
      >
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：币种信息和投注额度 */}
          <section className="flex flex-col flex-1 gap-3">
            {/* 币种和周期 */}
            <header className="flex items-center gap-2 pb-2 border-b border-thirdly">
              <img src={tradingPair.assetBaseImage} alt={game.symbol} className="object-cover rounded-full size-5" />
              <span>
                {game.symbol.split('/')[0]}
                <span className="text-secondary">/USDT</span>
              </span>
            </header>

            {/* 投注额度 */}
            <section className="flex justify-between" aria-label="Trading Limits">
              <dl>
                <dt className="text-9">{t('Min Trade')}</dt>
                <dd className="text-16">{formatter.amount(game.minAmount / exchange[currency], currency).toText()}</dd>
              </dl>
              <dl>
                <dt className="text-9">{t('Max Trade')}</dt>
                <dd className="text-right text-16">
                  {formatter.amount(game.maxAmount / exchange[currency], currency).toText()}
                </dd>
              </dl>
            </section>
          </section>

          {/* 右侧：倒计时和按钮 */}
          <aside className="flex items-center gap-4">
            {/* 倒计时圆圈 */}
            <section className="relative" aria-label="Countdown Timer">
              <CountdownCircle seconds={game.period} small />
            </section>
            {/* 按钮 */}
            <footer>
              <Button onClick={() => handleGameSelect(game)}>{t('Play now')}</Button>
            </footer>
          </aside>
        </div>
      </article>
    );
  };

  return (
    <div
      className={cn(
        'grid gap-4',
        ['grid-cols-1', 's768:grid-cols-2', 's1024:grid-cols-3', 's1366:grid-cols-4'].slice(0, periods.length)
      )}
    >
      {periods.map(mobile ? renderMobileCard : renderDesktopCard)}
    </div>
  );
};

GamePeriodSelector.displayName = 'GamePeriodSelector';

export default memo(GamePeriodSelector);
