// 交易引导页常量与类型定义
import { ReactNode } from 'react';

export const CONSTANTS = {
  TOTAL_PAGES: 5,
  TRADE_DURATION: 5000, // 5秒
  PROFIT_RATE: 0.9, // 90%
  DEFAULT_WAGER: '100',
  CHART_HEIGHT: 578,
  PANEL_WIDTH: {
    sm: '340px',
    lg: '100',
  },
  PRICE_VARIATION: {
    MIN: 3,
    MAX: 5,
    MICRO_VARIATION: 0.5,
  },
  UPDATE_INTERVALS: {
    PRICE_UPDATE: 1000, // 1秒
    STEPS: 5,
  },
} as const;

// 引导步骤类型
export type GuidanceStep = 'initial' | 'trading' | 'completed' | 'hidden';

// 引导卡片配置类型
export interface GuidanceCardConfig {
  step: number;
  icon: ReactNode;
  title: string;
  subtitle?: string | ReactNode;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}
