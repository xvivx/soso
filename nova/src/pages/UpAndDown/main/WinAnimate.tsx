import { memo, useMemo } from 'react';
import { GameStatus, useAmountPool, useOrders, useRealtimeGame } from '@store/upDown';
import { useUserInfo } from '@store/user';
import { useExchanges } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import AnimateNumber from '@components/AnimateNumber';
import { calcRealProfit } from '../common';
import CoinImage from '../images/coin.png';
import FlowerImage from '../images/flower.png';

function WinAnimate() {
  const { id: userId } = useUserInfo().data;
  const orders = useOrders();
  const game = useRealtimeGame();
  const amountPool = useAmountPool();
  const { gt1024 } = useMediaQuery();
  const winAmount = useMemo(() => {
    if (!game.winSide) return 0;

    let amount = 0;
    const winOrders = orders.filter((it) => it.userId === userId && it.direction === game.winSide);
    winOrders.forEach((it) => {
      amount += calcRealProfit(it.usdAmount, it.direction, game, amountPool);
    });

    return amount;
  }, [game, userId, orders, amountPool]);

  if (game.status !== GameStatus.FINISHED || !winAmount) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex-center"
      style={{
        backgroundImage: `radial-gradient(64.05% 64.05% at 50% 50%, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.00) 100%)`,
      }}
    >
      <Animate isMobile={!gt1024} winAmount={winAmount} />
    </div>
  );
}

export default memo(WinAnimate);

export function Animate(props: { isMobile: boolean; winAmount: number }) {
  const { winAmount, isMobile } = props;
  const localCurrency = 'USDFIAT';
  const exchange = useExchanges();

  return (
    <div
      className="relative"
      style={{
        width: isMobile ? 300 : 480,
        height: isMobile ? 300 : 480,
      }}
    >
      <img
        className="w-full h-full"
        style={{
          animation: 'spin 10s linear infinite',
        }}
        src={FlowerImage}
        alt="flower"
      />
      <img className="absolute inset-0 z-10" src={CoinImage} alt="coin" />
      <div className="abs-center z-20 pt-5 text-[#FFD542] font-700">
        <AnimateNumber
          value={winAmount / exchange[localCurrency]}
          currency={localCurrency}
          style={{
            'textShadow': `3px 6px 5.8px rgba(0, 0, 0, 0.25)`,
            fontSize: isMobile ? '62px' : '96px',
          }}
          duration={1.5}
        />
      </div>
    </div>
  );
}
