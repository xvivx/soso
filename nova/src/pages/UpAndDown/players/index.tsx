import { memo } from 'react';
import { useOrders, useRealtimeGame } from '@store/upDown';
import { useMediaQuery } from '@hooks/useResponsive';
import { cn } from '@utils';
import { Direction } from '@/type';
import { useGameResult } from '../common';
import MobilePlayerList from './MobilePlayerList';
import MobileResultAnimation from './MobileResultAnimation';
import PcPlayerList from './PcPlayerList';

interface BaseProps {
  className?: string;
}

export const PcPlayers = memo(function PcPlayers(props: BaseProps) {
  const { className } = props;
  const [, showResultAnimation] = useGameResult();
  const { gt1920 } = useMediaQuery();

  return (
    <div
      id="up-down-players"
      className={cn('detrade-card relative flex gap-2.5 s1920:gap-4 shrink-0 overflow-hidden', className)}
      style={{
        width: gt1920 ? 528 : 376,
      }}
    >
      {/* 看涨列表 */}
      <PcPlayerList key={Direction.BuyRise} direction={Direction.BuyRise} showResultAnimation={showResultAnimation} />
      {/* 看跌列表 */}
      <PcPlayerList key={Direction.BuyFall} direction={Direction.BuyFall} showResultAnimation={showResultAnimation} />
    </div>
  );
});

export const MobilePlayers = memo(function MobilePlayers(props: BaseProps) {
  const { className } = props;
  const game = useRealtimeGame();
  const orders = useOrders();

  return (
    <div className={cn('detrade-card relative overflow-hidden', className)}>
      <div className="flex items-stretch divide-x divide-second">
        <MobilePlayerList className="pr-4 text-up" direction={Direction.BuyRise} />
        <MobilePlayerList className="pl-4 text-down" direction={Direction.BuyFall} />
      </div>

      {/* 出结果并且有人下注才展示结算动画 */}
      {Boolean(game.winSide) && orders.length > 0 && <MobileResultAnimation />}
    </div>
  );
});
