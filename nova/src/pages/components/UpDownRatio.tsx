/**
 * 多空指数
 */
import { forwardRef, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useAccountType } from '@store/wallet';
import { useWebsocket } from '@store/ws';
import { Popover } from '@components';
import { cn, formatter } from '@utils';
import { useGameContext } from '@pages/components/GameProvider';
import { GameTypeNumber } from '@/type';

interface Props {
  orientation: 'horizontal' | 'vertical';
  className?: string;
  gameType: GameTypeNumber;
}

const UpDownRatio = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { orientation, className, gameType } = props;
  const isHorizontal = orientation === 'horizontal';
  const value = useSubscribeUpDownRatio(gameType);

  // 使用 motionValue 驱动动画
  const motionValue = useMotionValue(value);

  useEffect(() => {
    const controls = animate(motionValue, value);
    return () => controls.stop();
  }, [motionValue, value]);

  const size = useTransform(motionValue, (value) => `${value}%`);
  const percent = useTransform(motionValue, (value) => {
    const up = Number((value / 100).toFixed(4)); // 保留4为小数
    return [formatter.percent(up), formatter.percent(1 - up)];
  });
  const upPercent = useTransform(percent, (percent) => percent[0]);
  const downPercent = useTransform(percent, (percent) => percent[1]);

  return (
    <div ref={ref} className={cn('flex items-center gap-1', isHorizontal ? 'flex-row' : 'flex-col w-6', className)}>
      {/* up值显示 */}
      <motion.div className="text-9 text-up">{upPercent}</motion.div>

      <div className="relative flex-1">
        {/* 分割点 */}
        <motion.div
          className={cn('absolute z-10 rounded', isHorizontal ? 'w-1 h-3 -top-1/2' : 'w-3 h-1 -left-1/2')}
          style={{
            [isHorizontal ? 'left' : 'top']: size,
            backgroundColor: '#B3BEC1',
          }}
        />

        <div
          className={cn(
            'size-full flex rounded-full overflow-hidden',
            isHorizontal ? 'flex-row h-1.5' : 'flex-col w-1.5'
          )}
        >
          {/* up */}
          <motion.div
            style={{
              flexBasis: size,
              backgroundImage: isHorizontal
                ? 'linear-gradient(270deg, #005229, rgb(var(--up)))'
                : 'linear-gradient(180deg, rgb(var(--up)), #005229)',
            }}
          />

          {/* down */}
          <div
            className="flex-1"
            style={{
              backgroundImage: isHorizontal
                ? 'linear-gradient(270deg, rgb(var(--down)), #67201C)'
                : 'linear-gradient(180deg, #67201C, rgb(var(--down)))',
            }}
          />
        </div>
      </div>

      {/* down值显示 */}
      <motion.div className="text-9 text-down">{downPercent}</motion.div>
    </div>
  );
});

const PopoverBar = (props: Props) => {
  const { t } = useTranslation();
  return (
    <Popover
      side="left"
      align="center"
      overlayClassName="min-h-0 s768:w-72"
      trigger="hover"
      content={
        <div>
          <div className="text-14 text-primary">{t('Down vs. Up Ratio (Live Data)')}</div>
          <div className="text-12 text-secondary">
            {t('Open Position Direction Percentages of Users on This Platform for the Current Currency')}
          </div>
        </div>
      }
    >
      <UpDownRatio {...props} />
    </Popover>
  );
};

export default memo(PopoverBar);

const cmds: Record<
  number,
  {
    subscribe: string;
    unsubscribe: string;
    receive: string;
  }
> = {
  [GameTypeNumber.Binary]: {
    subscribe: '/binaryOrder/upDownRatio/subscribe',
    unsubscribe: '/binaryOrder/upDownRatio/unsubscribe',
    receive: '/binaryOrder/upDownRatio',
  },
  [GameTypeNumber.Contract]: {
    subscribe: '/contractOrder/upDownRatio/subscribe',
    unsubscribe: '/contractOrder/upDownRatio/unsubscribe',
    receive: '/contractOrder/upDownRatio',
  },
  [GameTypeNumber.BinarySpread]: {
    subscribe: '/binaryOrder/upDownRatio/subscribe',
    unsubscribe: '/binaryOrder/upDownRatio/unsubscribe',
    receive: '/binaryOrder/upDownRatio',
  },
};
function useSubscribeUpDownRatio(gameType: GameTypeNumber) {
  const { sendMessage, useOnMessage } = useWebsocket();
  const [upDownRatioList, setUpDownRatioList] = useState<{ symbol: string; upRatio: number }[]>([]);
  const { selectedSymbolPair } = useGameContext();
  const accountType = useAccountType();

  // 多空比例值 - 默认为50
  const ratioValue = useMemo(() => {
    const tradingPair = upDownRatioList.find((item) => item.symbol === selectedSymbolPair.symbol);
    if (!tradingPair) return 50;
    return tradingPair.upRatio;
  }, [upDownRatioList, selectedSymbolPair.symbol]);

  // 切换账户, 重置数据
  useEffect(() => {
    setUpDownRatioList([]);
  }, [accountType]);

  // 订阅多空指数
  useEffect(() => {
    sendMessage(cmds[gameType].subscribe);
    return () => sendMessage(cmds[gameType].unsubscribe);
  }, [sendMessage, gameType]);

  // 接收多空指数数据
  useOnMessage((message) => {
    if (!message) return;
    const { cmd, resp } = message;
    if (cmd === cmds[gameType].receive) {
      setUpDownRatioList(resp);
    }
  });

  return ratioValue;
}
