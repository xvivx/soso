/**
 * 登录注册页面切换视图组件
 */
import { useState } from 'react';

export enum ViewDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

interface ViewState<T> {
  view: T;
  params?: Record<string, string>;
}

export function useViewNavigator<T>(initialView: T) {
  const [currentView, setCurrentView] = useState<ViewState<T>>({
    view: initialView,
    params: {},
  });
  const [viewHistory, setViewHistory] = useState<ViewState<T>[]>([]);
  const [direction, setDirection] = useState<ViewDirection>(ViewDirection.LEFT);

  // 前进到新视图（带参数）
  const navigateTo = (newView: T, params?: Record<string, string>) => {
    setDirection(ViewDirection.LEFT);
    setViewHistory((prev) => [...prev, currentView]);
    setCurrentView({
      view: newView,
      params: params || {},
    });
  };

  // 返回上一个视图
  const goBack = () => {
    if (viewHistory.length === 0) return;

    setDirection(ViewDirection.RIGHT);
    const previousView = viewHistory[viewHistory.length - 1];
    setCurrentView(previousView);
    setViewHistory((prev) => prev.slice(0, -1));
  };

  // 重置导航历史
  const resetNavigation = (newView?: T) => {
    setViewHistory([]);
    setCurrentView({
      view: newView || initialView,
      params: {},
    });
  };

  // 获取当前视图参数
  const getCurrentParams = () => {
    return currentView.params || {};
  };

  return {
    currentView: currentView.view,
    currentParams: currentView.params,
    direction,
    navigateTo,
    goBack,
    resetNavigation,
    getCurrentParams,
  };
}
