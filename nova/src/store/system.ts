import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGameRule } from '@store/upDown/types';
import { Modal } from '@components';
import { openRiskWarning } from '@pages/Contract/helps/RiskyWarning';
import { ChartAppearType } from '@/type';
import { AccountType, useAccountType } from './wallet';

// 0不排序 1升序 2降序
type Filter = 0 | 1 | 2;
const initialState: SystemState = {
  lang: 'en',
  currency: 'USDFIAT',
  theme: 'darken',
  isMaintenance: false, // 维护标识，这个字段不能缓存到store里面，否则可能永远在维护
  viewport: {
    mobile: true,
  } as SystemState['viewport'],
  device: {
    mobile: true,
  } as SystemState['device'],
  symbolPairFilter: {
    price: 0,
    change: 0,
  },
  binary: {
    symbol: '',
    showPublicBets: true,
    showMyBets: true,
    advancedChart: false,
    tick: '500ms',
    chartType: ChartAppearType.kline,
  },
  spread: {
    symbol: '',
    showPublicBets: true,
    showMyBets: true,
    advancedChart: false,
    tick: '500ms',
    chartType: ChartAppearType.kline,
  },
  leverage: {
    symbol: '',
    showPublicBets: true,
    showMyBets: true,
    confirmCashOut: true,
    advancedChart: false,
    tick: '500ms',
    chartType: ChartAppearType.kline,
    lever: 10,
  },
  updown: {
    symbol: '',
    gameLabel: '',
    mode: 'normal',
  },
  chat: {
    visible: false,
  },
  tap: {
    symbol: '',
    showDot: true,
    showPublicBets: true,
    showMultiplier: true,
  },
  sound: {
    muted: false,
  },
  accountTypeTransition: {
    visible: false,
    shownDemoModal: false,
  },
  firstDepositTip: false,
  emoji: [],
};

const slice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.lang = action.payload;
    },
    setLocalCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setTheme(state, action: PayloadAction<SystemState['theme']>) {
      state.theme = action.payload;
    },
    setBinaryConfig(state, action: PayloadAction<Partial<SystemState['binary']>>) {
      state.binary = { ...state.binary, ...action.payload };
    },
    setSpreadConfig(state, action: PayloadAction<Partial<SystemState['spread']>>) {
      state.spread = { ...state.spread, ...action.payload };
    },
    setLeverageConfig(state, action: PayloadAction<Partial<SystemState['leverage']>>) {
      state.leverage = { ...state.leverage, ...action.payload };
    },
    setTapConfig(state, action: PayloadAction<Partial<SystemState['tap']>>) {
      state.tap = { ...state.tap, ...action.payload };
    },
    changeUpdown(state, action: PayloadAction<Partial<SystemState['updown']>>) {
      state.updown = { ...state.updown, ...action.payload };
    },
    setMaintenance(state, action: PayloadAction<boolean>) {
      state.isMaintenance = action.payload;
    },
    setSymbolPairFilter(state, action: PayloadAction<[keyof SystemState['symbolPairFilter'], Filter]>) {
      const [filter, value] = action.payload;
      // 重置其他过滤条件
      state.symbolPairFilter = { price: 0, change: 0 };
      state.symbolPairFilter[filter] = value;
    },
    setViewport(state, action: PayloadAction<SystemState['viewport']>) {
      state.viewport = action.payload;
    },
    setDevice(state, action: PayloadAction<SystemState['device']>) {
      state.device = action.payload;
    },
    setChatVisible(state, action: PayloadAction<boolean>) {
      state.chat.visible = action.payload;
    },
    setMute(state, action: PayloadAction<boolean>) {
      state.sound.muted = action.payload;
    },
    setAccountTypeTransition(state, action: PayloadAction<Partial<SystemState['accountTypeTransition']>>) {
      state.accountTypeTransition = { ...state.accountTypeTransition, ...action.payload };
    },
    setEmoji(state, action: PayloadAction<string>) {
      const newRecent = [action.payload, ...state.emoji.filter((emj) => emj !== action.payload)].slice(0, 24);
      state.emoji = newRecent;
    },
    setFirstDepositTip(state, action: PayloadAction<boolean>) {
      state.firstDepositTip = action.payload;
    },
  },
  extraReducers(builder) {
    // 添加对游戏周期列表的处理
    builder.addCase<string, PayloadAction<IGameRule[]>>('upAndDown/gameRules/list/fulfilled', (state, action) => {
      const gameRules = action.payload;

      // 如果没有规则或当前没有选择symbol，不做处理
      if (gameRules.length === 0) return;

      // 过滤出当前symbol相关的规则
      const currentSymbolRules = gameRules.filter((rule) => rule.symbol === state.updown.symbol);
      // 当前symbol没有对应规则
      if (currentSymbolRules.length === 0) return;

      // 情况1: gameLabel为空时设置初始值
      if (!state.updown.gameLabel) {
        state.updown.gameLabel = currentSymbolRules[0].label;
      }
      // 情况2: 检查当前symbol下的gameLabel是否有效
      else {
        const isLabelValidForCurrentSymbol = currentSymbolRules.some((rule) => rule.label === state.updown.gameLabel);
        if (!isLabelValidForCurrentSymbol) {
          // 只有当在当前symbol下找不到对应gameLabel时才重置
          state.updown.gameLabel = currentSymbolRules[0].label;
        }
      }
    });
  },
});

export const {
  setLanguage,
  setLocalCurrency,
  setTheme,
  changeUpdown,
  setLeverageConfig,
  setBinaryConfig,
  setSpreadConfig,
  setTapConfig,
  setMaintenance,
  setSymbolPairFilter,
  setViewport,
  setDevice,
  setChatVisible,
  setMute,
  setAccountTypeTransition,
  setEmoji,
  setFirstDepositTip,
} = slice.actions;

export default slice.reducer;

export interface Settings {
  symbol: string; // 斜杠, 例如 BTC/USD
  showPublicBets: boolean;
  showMyBets: boolean;
  advancedChart: boolean;
  tick: Ticks;
  confirmCashOut?: boolean;
  chartType: ChartAppearType;
}

type Media = {
  /** 手机端, < 768 */
  mobile: boolean;
  /** 768 <= x < 1024 */
  s768: boolean;
  /** 1024 <= x < 1366 */
  s1024: boolean;
  /** 1366 <= x < 1440 */
  s1366: boolean;
  /** 1440 <= x < 1920 */
  s1440: boolean;
  /** \>= 1920 */
  s1920: boolean;
  /** \>= 768 */
  gt768: boolean;
  /** \>= 1024 */
  gt1024: boolean;
  /** \>= 1366 */
  gt1366: boolean;
  /** \>= 1440 */
  gt1440: boolean;
  /** \>= 1920 */
  gt1920?: boolean;
};
export interface SystemState {
  lang: string;
  currency: string;
  theme: 'darken' | 'lighten';
  isMaintenance: boolean;
  binary: Settings;
  spread: Settings;
  leverage: Settings & { lever: number; doNotShowRiskyWarning?: boolean };
  updown: {
    symbol: string;
    gameLabel: string;
    mode: 'candle' | 'turbo' | 'normal';
  };
  tap: {
    symbol: string;
    showPublicBets: boolean;
    showMultiplier: boolean;
    showDot: boolean;
  };
  symbolPairFilter: {
    price: Filter;
    change: Filter;
  };
  viewport: Media;
  // 设备宽度, 一般不会使用这个值
  device: Media;
  chat: {
    visible: boolean;
  };
  sound: {
    muted: boolean;
  };
  accountTypeTransition: {
    visible: boolean;
    shownDemoModal: boolean;
  };
  firstDepositTip: boolean;
  emoji: string[];
}

export type ContractSetting = SystemState['leverage'];

const ticks = ['500ms', '5s', '15s', '30s', '1m', '5m', '1h', '4h', '1d'] as const;
export type Ticks = (typeof ticks)[number];
export const tickOptions = ticks.map((tick) => {
  return {
    label: tick === '500ms' ? 'Tick' : tick,
    value: tick,
  };
});

/**
 * 获取本地化货币
 */
export function useLocalCurrency() {
  return useSelector((state: StoreState) => state.system.currency);
}

export function useTheme() {
  return useSelector((state: StoreState) => state.system.theme);
}

export const useUpdownGameLabel = () => {
  return useSelector((state: StoreState) => state.system.updown.gameLabel);
};

export function useMuted() {
  return useSelector((state: StoreState) => state.system.sound.muted);
}

// 账户类型切换动画
export function useAccountTypeTransition() {
  return useSelector((state: StoreState) => state.system.accountTypeTransition);
}

// 最近使用的表情包
export function useRecentEmojis() {
  return useSelector((state: StoreState) => state.system.emoji);
}

// 玩法2风险提醒
export function useRiskyWarning() {
  const doNotShowRiskyWarning = useSelector((state: StoreState) => state.system.leverage.doNotShowRiskyWarning);
  const accountType = useAccountType();
  // const { shouldShowGuide } = useGuideConditions();

  useEffect(() => {
    // 如果是demo账户，不显示风险提示
    if (accountType === AccountType.DEMO) return;

    // 是否不显示风险提示
    if (doNotShowRiskyWarning) return;

    // 是否展示引导
    // if (shouldShowGuide) return;

    openRiskWarning(true);

    return () => {
      Modal.close();
    };
  }, [accountType, doNotShowRiskyWarning]);
}
