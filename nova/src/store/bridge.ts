export interface BridgeOptions {
  container: HTMLElement;
  micro?: boolean;
  // 渲染哪个游戏
  type?: 'trading' | 'contract' | 'up-down' | 'spread' | 'tap-trading';
  // 主应用传递过来登陆用的code
  accessCode?: string;
  // 主应用的登陆方法
  onLogin?: () => void;
  // 主应用的注册方法
  onRegister?: () => void;
  // 主应用的充值方法
  onRecharge?: () => void;
  // 主应用刷新会话方法（预留用）
  onSessionRefresh?: () => void;
  // 主应用token过期处理方法（预留用）
  onTokenExpired?: () => void;
  // chart ready
  onLoad?: () => void;
  sound?: boolean;
}

let bridge: BridgeOptions = {
  container: document.body,
  micro: Boolean(import.meta.env.REACT_APP_SDK),
};

export default {
  get() {
    return bridge;
  },
  set(payload: Partial<BridgeOptions>) {
    bridge = { ...bridge, ...payload };
    return bridge;
  },
};
