import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@hooks/useResponsive';
import { Loading } from '@components';
import WaterMark from '@pages/components/WaterMark';
import ChartView from './ChartView';
import GameStats from './GameStats';
import RoundTextAnimation from './RoundTextAnimation';
import WinAnimate from './WinAnimate';

function Main() {
  const loading = useSelector((state) => state.upDown.loading);
  const hasGame = useSelector((state) => Boolean(state.upDown.game.id));
  const { mobile } = useMediaQuery();

  return (
    <div className="relative flex-col space-y-3 w-full select-none s1024:h-full s1024:flex">
      <div className="relative h-56 s768:flex-1">
        <WaterMark className="absolute left-3 bottom-3" />
        {/* 每回合不同状态时文字动画 */}
        {!mobile && <RoundTextAnimation />}
        {(loading || !hasGame) && <Loading />}
        {/* chart主视图 */}
        <ChartView />
      </div>
      {/* 游戏统计数据 */}
      <GameStats />
      <WinAnimate />
    </div>
  );
}

export default memo(Main, () => true);
