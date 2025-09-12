import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import bridge from '@store/bridge';
import { markGameCompleted } from '@store/guide';
import { useMediaQuery } from '@hooks/useResponsive';
import guideMask from '@components/FunctionRender/GuideMask';
import { GAME_ROUTES, GameType, useGudeConfig } from './guiedTourConfig';

/**
 * 游戏引导状态
 */
export function useGuideStatus() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const guideState = useSelector((state) => state.guide.completedGames);

  // 获取当前游戏类型
  const currentGameType = useMemo((): GameType | null => {
    const gameEntry = Object.entries(GAME_ROUTES).find(([, routes]) => routes.includes(pathname));
    return gameEntry ? (gameEntry[0] as GameType) : null;
  }, [pathname]);

  // 检查游戏是否已完成引导
  const isCurrentGameCompleted = useMemo((): boolean => {
    if (!currentGameType || !guideState) return false;
    return guideState[currentGameType];
  }, [currentGameType, guideState]);

  // 标记游戏引导已完成
  const markGuideCompleted = useCallback((): void => {
    dispatch(markGameCompleted(currentGameType as GameType));
  }, [dispatch, currentGameType]);

  return {
    currentGameType,
    isCurrentGameCompleted,
    markGuideCompleted,
  };
}

/**
 * 是否应该显示引导
 */
export function useGuideConditions() {
  const { gt1366 } = useMediaQuery();
  const { isCurrentGameCompleted, currentGameType } = useGuideStatus();

  return useMemo(() => {
    const isMicro = bridge.get().micro;
    return {
      shouldShowGuide: !isMicro && gt1366 && !!currentGameType && !isCurrentGameCompleted,
      currentGameType,
    };
  }, [isCurrentGameCompleted, currentGameType, gt1366]);
}

/**
 * 显示引导遮罩
 */
function useShowGuide() {
  const guideConfig = useGudeConfig();
  return useCallback(
    (gameType: GameType) => {
      guideMask.show({
        ...guideConfig[gameType],
      });
    },
    [guideConfig]
  );
}

export default function useGuideTour() {
  const { pathname } = useLocation();
  const { shouldShowGuide, currentGameType } = useGuideConditions();
  const showGuide = useShowGuide();

  useEffect(() => {
    if (!shouldShowGuide || !currentGameType) return;

    showGuide(currentGameType);

    return () => {
      guideMask.close();
    };
  }, [pathname, shouldShowGuide, currentGameType, showGuide]);
}
