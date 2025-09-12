import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { useBinarySelectedTimePeriod } from '@store/binary';
import { FormItem, SvgIcon } from '@components';
import { getCoinUrl } from '@utils/others';
import { BetButton } from '@pages/components';
import { Direction } from '@/type';
import { CONSTANTS, GuidanceCardConfig, GuidanceStep } from '../constants';
import GuidanceCard from './GuidanceCard';

const CustomTradingPanel: React.FC<{
  onStartGuidance?: (() => void) | React.MutableRefObject<(() => void) | null>;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  historyData: any[];
}> = ({ onStartGuidance, iframeRef, historyData }) => {
  const { t } = useTranslation();
  const [wagerAmount, setWagerAmount] = useState<string>(CONSTANTS.DEFAULT_WAGER);
  const [isTrading, setIsTrading] = useState(false);
  const [guidanceStep, setGuidanceStep] = useState<GuidanceStep>('hidden');
  const [countdown, setCountdown] = useState<number>(0);

  const selectedTimePeriod = useBinarySelectedTimePeriod();

  const runningRef = useRef(false);

  const handleDemoTrade = useCallback(
    (direction: Direction) => {
      if (!Number(wagerAmount)) return;
      setGuidanceStep('trading');
      setIsTrading(true);
      setCountdown(5);
      window.postMessage('guide-simulating-start', '*');

      // 取历史最后N根K线的平均间隔
      const N = 10;
      const lastN = historyData.slice(-N);
      const lastCandle = historyData[historyData.length - 1];
      const lastClose = lastCandle?.Close ?? lastCandle?.close ?? 43285.67;
      const lastDT =
        lastCandle?.DT instanceof Date ? lastCandle.DT.getTime() : new Date(lastCandle?.DT || Date.now()).getTime();
      const rawAvgInterval = lastN.length > 1 ? (lastN[lastN.length - 1].DT - lastN[0].DT) / (lastN.length - 1) : 500;
      const avgInterval = Math.max(80, Math.min(200, rawAvgInterval)); // 强制在80~200ms之间
      const targetDirection = direction === Direction.BuyRise ? 1 : -1;
      const maxDelta = 0.5; // 最大单步涨跌幅限制

      // 取历史最后N根K线的涨跌分布
      const Ndelta = 20;
      const lastNdelta = historyData.slice(-Ndelta);
      const deltas: number[] = [];
      for (let i = 1; i < lastNdelta.length; i++) {
        const prev = lastNdelta[i - 1]?.Close ?? lastNdelta[i - 1]?.close;
        const curr = lastNdelta[i]?.Close ?? lastNdelta[i]?.close;
        if (typeof prev === 'number' && typeof curr === 'number') {
          deltas.push(curr - prev);
        }
      }
      const avgDelta = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
      const stdDelta = deltas.length
        ? Math.sqrt(deltas.reduce((a, b) => a + Math.pow(b - avgDelta, 2), 0) / deltas.length)
        : 0.1;
      let prevDelta = targetDirection * Math.abs(avgDelta) || targetDirection * 0.1;

      let prevPrice = lastClose;
      let prevDT = lastDT;
      let isFirst = true;
      runningRef.current = true;

      let elapsed = 0;
      const duration = 5000; // 5秒动画

      // 倒计时严格同步
      setCountdown(5);
      let countdown = 5;
      const countdownTimer = setInterval(() => {
        countdown -= 1;
        setCountdown(countdown);
        if (countdown <= 0) clearInterval(countdownTimer);
      }, 1000);

      const pushMock = () => {
        if (!runningRef.current) return;
        let nextPrice;
        let delta;
        if (isFirst) {
          nextPrice = lastClose;
          isFirst = false;
        } else {
          // 用历史分布+惯性+趋势增强
          const randomDelta = (deltas[Math.floor(Math.random() * deltas.length)] || avgDelta) * targetDirection;
          // 惯性：新delta部分参考上一次
          delta = prevDelta * 0.85 + randomDelta * 0.15 + (Math.random() - 0.5) * stdDelta * 0.2;
          // 趋势增强：上涨时更大，下跌时更大
          if (targetDirection === 1) {
            delta = Math.abs(delta) + Math.abs(avgDelta) * 0.2;
          } else {
            delta = -Math.abs(delta) - Math.abs(avgDelta) * 0.2;
          }
          // 限制最大单步涨跌幅
          if (delta > maxDelta) delta = maxDelta;
          if (delta < -maxDelta) delta = -maxDelta;
          nextPrice = prevPrice + delta;
          nextPrice = Math.max(0.01, nextPrice);
          prevDelta = delta;
        }
        const dt = new Date(prevDT + avgInterval);
        // 高低点也用历史分布微扰动
        const highOffset = Math.abs(stdDelta) * (0.2 + Math.random() * 0.2);
        const lowOffset = Math.abs(stdDelta) * (0.2 + Math.random() * 0.2);
        const kline = {
          DT: dt,
          Open: prevPrice,
          High: Math.max(prevPrice, nextPrice) + highOffset,
          Low: Math.min(prevPrice, nextPrice) - lowOffset,
          Close: nextPrice,
          Volume: 1000 + Math.random() * 200,
        };
        const win = iframeRef?.current?.contentWindow;
        if (win) {
          win.postMessage(
            JSON.stringify({
              type: 'draw',
              payload: [kline],
            }),
            '*'
          );
        }
        prevPrice = nextPrice;
        prevDT = dt.getTime();
        elapsed += avgInterval;
        if (elapsed < duration) {
          setTimeout(pushMock, avgInterval);
        } else {
          runningRef.current = false;
          clearInterval(countdownTimer);
          setIsTrading(false);
          setCountdown(0);
          setGuidanceStep('completed');
          window.postMessage('guide-simulating-end', '*');
        }
      };
      pushMock();
    },
    [wagerAmount, iframeRef, historyData]
  );

  const startGuidance = useCallback(() => {
    setGuidanceStep('initial');
    setIsTrading(false);
  }, []);

  useEffect(() => {
    if (onStartGuidance && 'current' in onStartGuidance) {
      onStartGuidance.current = startGuidance;
    }
  }, [onStartGuidance, startGuidance]);

  const profit = useMemo(() => (Number(wagerAmount) * CONSTANTS.PROFIT_RATE).toFixed(0), [wagerAmount]);

  const createGuidanceConfig = useCallback(
    (): Record<GuidanceStep, GuidanceCardConfig | null> => ({
      initial: {
        step: 1,
        icon: <SvgIcon name="point" className="size-10 text-primary mx-auto" />,
        title: t('Click Up or Down to Trading'),
      },
      trading: {
        step: 2,
        icon: <SvgIcon name="clock" className="size-10 text-primary mx-auto" />,
        title: t('Good Job!'),
        subtitle:
          countdown > 0 ? (
            <Trans
              i18nKey="The trade will complete in <0>{{countdown}}s</0>."
              values={{ countdown: countdown.toString() }}
            >
              <span className="text-brand" />
            </Trans>
          ) : (
            t('The trade will complete in 5s.')
          ),
      },
      completed: {
        step: 3,
        icon: <SvgIcon name={'like'} className="size-10 text-primary mx-auto" />,
        title: `Lucky you! ${(Number(wagerAmount) + Number(profit)).toFixed(0)} USDT is yours!`,
        showButton: true,
        buttonText: t('Done'),
        onButtonClick: typeof onStartGuidance === 'function' ? onStartGuidance : undefined,
      },
      hidden: null,
    }),
    [t, profit, onStartGuidance, wagerAmount, countdown]
  );

  const currentConfig = useMemo(() => createGuidanceConfig()[guidanceStep], [createGuidanceConfig, guidanceStep]);

  return (
    <div className={`s768:${CONSTANTS.PANEL_WIDTH.sm} s1024:w-${CONSTANTS.PANEL_WIDTH.lg} shrink-0  sticky z-10`}>
      <FormItem label={t('Amount')}>
        <div className="min-w-20 text-primary bg-layer8 rounded-2 px-4 h-10 s768:h-12 flex items-center justify-between border border-input focus-within:border-brand">
          <div className="flex items-center justify-center">
            <img className="w-5 mr-2" src={getCoinUrl('USDT')} alt="USDT" />
            <input
              type="number"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              className="text-primary text-16 font-600 bg-transparent border-none outline-none w-20"
              min={1}
              max={1000}
              step="1"
              disabled={isTrading}
            />
          </div>
        </div>
      </FormItem>
      <FormItem label={t('Time')}>
        <div className="rounded-2 p-1 h-10 s768:h-12 border-none flex items-center bg-layer2 text-secondary">
          <div className="text-primary text-14 text-center font-700 rounded-2 h-full bg-layer4 content-center w-full">
            {selectedTimePeriod ? `${selectedTimePeriod.time}s` : '5s'} {isTrading && '⏱️'}
          </div>
        </div>
      </FormItem>
      <div className="pt-2">
        <div className="relative flex h-10 s768:h-14 w-full rounded-2 overflow-hidden -space-x-2">
          <BetButton
            disabled={!Number(wagerAmount) || isTrading || guidanceStep === 'hidden' || guidanceStep === 'completed'}
            onClick={() => handleDemoTrade(Direction.BuyRise)}
            className="gap-2 font-bold"
            iconClassName="size-6"
            skewClassName="skew-x-[23deg]"
            direction={Direction.BuyRise}
          >
            <div className="relative flex items-center gap-2 text-18 font-bold">
              <div>{isTrading ? '...' : t('Up')}</div>
              <div>90%</div>
            </div>
          </BetButton>
          <BetButton
            disabled={!Number(wagerAmount) || isTrading || guidanceStep === 'hidden' || guidanceStep === 'completed'}
            onClick={() => handleDemoTrade(Direction.BuyFall)}
            className="flex-row-reverse gap-2 font-bold "
            iconClassName="size-6"
            skewClassName="skew-x-[23deg]"
            direction={Direction.BuyFall}
          >
            <div className="relative flex items-center gap-2 text-18 font-bold">
              <div>90%</div>
              <div>{isTrading ? '...' : t('Down')}</div>
            </div>
          </BetButton>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {currentConfig && <GuidanceCard config={currentConfig} isVisible={true} />}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(CustomTradingPanel);
