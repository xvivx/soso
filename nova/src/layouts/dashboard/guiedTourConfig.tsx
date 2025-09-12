import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GuideMaskOptions } from '@components/FunctionRender/GuideMask';
import { useGuideStatus } from './useGuideTour';

export type GameType = 'HIGH_LOW' | 'SPREAD' | 'FUTURES' | 'UP_DOWN' | 'TAP_TRADING';
// 游戏类型路由映射
export const GAME_ROUTES: Record<GameType, string[]> = {
  HIGH_LOW: ['/trade-center', '/trade-center/high-low'],
  SPREAD: ['/trade-center/spread'],
  FUTURES: ['/trade-center/futures'],
  UP_DOWN: ['/trade-center/up-down'],
  TAP_TRADING: ['/trade-center/tap-trading'],
};

export const useGudeConfig = () => {
  const { t } = useTranslation();
  const { markGuideCompleted } = useGuideStatus();

  return useMemo<Record<GameType, GuideMaskOptions>>(() => {
    return {
      HIGH_LOW: {
        steps: [
          {
            selectorIds: ['trading-pair-list'],
            content: t('Choose the cryptocurrency you want to trade.'),
            placement: 'right',
          },
          {
            selectorIds: ['available-balance-input'],
            content: t('Enter the amount you want to trade.'),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['time-periods'],
            content: t('Choose a countdown duration.'),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['chart-view', 'up-or-down-button'],
            content: (
              <>
                <p>{t('Predict the price trend and select UP or DOWN to trade.')}</p>
                <p>{t('The button percentage shows the profit for a correct prediction.')}</p>
                <p>{t('If incorrect, the investment will be lost. ')}</p>
              </>
            ),
            placement: 'left',
            hightPadding: 10,
          },
        ],
        onComplete: () => markGuideCompleted(),
        onClose: () => markGuideCompleted(),
      },
      SPREAD: {
        steps: [
          {
            selectorIds: ['trading-pair-list'],
            content: t('Choose the cryptocurrency you want to trade.'),
            placement: 'right',
          },
          {
            selectorIds: ['available-balance-input'],
            content: t('Enter the amount you want to trade.'),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['time-periods'],
            content: t(
              'Select a countdown and spread. spread refers to the difference between the start and end price.'
            ),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['chart-view'],
            content: (
              <>
                <div>{t('Predict the price trend and select UP or DOWN to trade.')}</div>
                <div>{t('To win, two conditions must be met:')}</div>
                <div>• {t('The price moves in your predicted direction.')}</div>
                <div>• {t('The movement exceeds the spread.')}</div>
                <div>{t('The percentage on the button shows your potential profit.')}</div>
                <div>{t('If the prediction is wrong, your investment will be lost.')}</div>
              </>
            ),
            placement: 'left',
            hightPadding: 10,
          },
        ],
        onComplete: () => markGuideCompleted(),
        onClose: () => markGuideCompleted(),
      },
      FUTURES: {
        steps: [
          {
            selectorIds: ['trading-pair-list'],
            content: t('Choose the cryptocurrency you want to trade.'),
            placement: 'right',
          },
          {
            selectorIds: ['available-balance-input'],
            content: t('Enter the amount you want to trade.'),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['leverage-input'],
            content: t('Enter the amount you want to trade.'),
            placement: 'left',
            hightPadding: 10,
          },
          {
            selectorIds: ['direction-buttons'],
            content: (
              <>
                <div>{t('Choose UP if you think the price will rise, or DOWN if you think it will fall.')}</div>
                <div>{t('If your prediction is correct, you’ll earn a profit.')}</div>
                <div>{t('Click “Close” anytime to realize your profit or loss.')}</div>
                <div>{t('You can also set target levels for auto-close.')}</div>
              </>
            ),
            placement: 'left',
            hightPadding: 10,
          },
        ],
        onComplete: () => markGuideCompleted(),
        onClose: () => markGuideCompleted(),
      },
      UP_DOWN: {
        steps: [
          {
            selectorIds: ['trading-pair'],
            content: t('Pick a crypto and choose how long the trade should last.'),
            placement: 'bottom',
            tooltipAlign: 'start',
          },
          {
            selectorIds: ['available-balance-input'],
            content: t('Enter the amount you want to trade.'),
            placement: 'right',
            hightPadding: 10,
          },
          {
            selectorIds: ['up-down-content', 'up-down-direction-buttons'],
            content: t('Decide if the price will go UP or DOWN and make your move before the countdown runs out.'),
            placement: 'right',
            hightPadding: 10,
          },
          {
            selectorIds: ['up-down-players'],
            content: t(
              'Check the total fund pool for UP and DOWN orders. See both your own and others’ order statuses in the list.'
            ),
            placement: 'left',
            hightPadding: 10,
          },
        ],
        onComplete: () => markGuideCompleted(),
        onClose: () => markGuideCompleted(),
      },
      TAP_TRADING: {
        steps: [
          {
            selectorIds: ['trading-pair-list'],
            content: t('Choose the cryptocurrency you want to trade.'),
            placement: 'right',
          },
          {
            selectorIds: ['tap-trading-available-balance'],
            content: t('Enter the amount you want to trade.'),
            placement: 'left',
          },
          {
            selectorIds: ['chart-view'],
            content: t(
              'Tap a block to place your order. If the curve touches your block, you earn profit based on its multiplier. If not, you lose the invested amount.'
            ),
            placement: 'left',
          },
        ],
        onComplete: () => markGuideCompleted(),
        onClose: () => markGuideCompleted(),
      },
    };
  }, [t, markGuideCompleted]);
};
