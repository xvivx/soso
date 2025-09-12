/**
 * @fileoverview Crisp SDK 封装
 * @author cloud
 * @copyright Detrade
 * @version 1.0.0
 * @description
 * 该模块提供了对 Crisp 客服系统的封装，支持访客模式和用户模式，
 * 提供了简单易用的 API 接口，自动处理用户信息同步、错误处理等功能。
 */

/**
 * @description 使用说明和示例
 * @example
 *
 * 1. 基础配置
 * 在你的配置文件中 比如config.ts 中配置 CRISP_WEBSITE_ID：
 * ```ts
 * export const CRISP_WEBSITE_ID = 'your_website_id';
 * ```
 *
 * 2. 初始化和使用
 * 方式一：直接使用导出的实例
 * ```ts
 * import { crisp } from '@/utils/crisp';
 *
 * 打开对话框
 * await crisp.open();
 *
 * 关闭对话框
 * await crisp.close();
 * ```
 *
 * 方式二：创建自定义实例
 * ```ts
 * const customCrisp = CrispSDK.createInstance({
 *   appId: 'your_website_id',
 *   getUserInfo: () => ({
 *     userId: 'user123',
 *     email: 'user@example.com',
 *     nickname: 'User Name',
 *     created_at: Date.now() / 1000,
 *     language: 'zh-CN'
 *   }),
 *   isVisitor: () => false,
 *   trackFields: ['email', 'userId', 'nickname']  // 可选：自定义需要追踪的用户属性字段
 * });
 * ```
 *
 * 3. 注意事项：
 * - appId 必须配置，否则将无法初始化
 * - getUserInfo 必须返回符合 UserData 类型的对象
 * - created_at 必须是 Unix 时间戳（秒）
 * - 首次调用 open() 时会自动初始化
 * - 用户配置发生变化时会自动同步到 Crisp
 * - 支持访客模式，通过 isVisitor 控制
 *
 * 4. 错误处理
 * ```ts
 * try {
 *   await crisp.open();
 * } catch (error) {
 *   if (error instanceof Error) {
 *     console.error('Crisp错误:', error.message);
 *   }
 * }
 * ```
 *
 * 5. 清理资源
 * ```ts
 *  在需要时（如用户退出登录）销毁实例
 * await crisp.destroy();
 * ```
 */

import { Crisp } from 'crisp-sdk-web';

/**
 * @description Crisp 用户数据接口
 * @interface UserData
 */
interface UserData {
  userId?: string;
  email?: string;
  nickname?: string;
  phone?: string;
  avatar?: string;
  created_at?: number;
  local?: string;
  [key: string]: any;
}

/**
 * @description Crisp 用户核心属性和会话数据相关字段
 * @constant
 */
const CRISP_USER_FIELDS = {
  /** 用户核心属性 */
  CORE_FIELDS: ['email', 'nickname', 'phone', 'avatar'] as const,
  /** 会话数据字段 */
  SESSION_FIELDS: ['userId', 'created_at', 'locale'] as const,
};

/**
 * @description Crisp 用户属性追踪字段列表
 * @constant {Array<keyof UserData>} CRISP_USER_CONFIG_KEYS
 * @remarks 定义需要与 Crisp 进行同步的用户核心属性，当这些字段发生变化时会触发配置更新
 */
const CRISP_USER_CONFIG_KEYS: (keyof UserData)[] = [
  ...CRISP_USER_FIELDS.CORE_FIELDS,
  'userId',
  'created_at',
  'local',
] as (keyof UserData)[];

/**
 * @description 所有标准字段的集合，用于识别自定义字段
 */
const ALL_STANDARD_FIELDS = [...CRISP_USER_FIELDS.CORE_FIELDS, ...CRISP_USER_FIELDS.SESSION_FIELDS] as const;

/**
 * @description Crisp SDK 配置接口
 * @interface CrispSDKConfig
 * @extends {Object}
 * @property {string} appId - Crisp 应用 ID
 * @property {Function} getUserInfo - 获取用户信息的方法
 * @property {Function} isVisitor - 判断是否为访客的方法
 * @property {Array<keyof UserData>} [trackFields] - 用户属性追踪字段列表，默认使用 CRISP_USER_CONFIG_KEYS
 */
interface CrispSDKConfig {
  appId: string;
  getUserInfo: () => UserData;
  isVisitor: () => boolean;
  trackFields?: (keyof UserData)[];
}

/**
 * @description Crisp SDK 类
 * @class CrispSDK
 */
export class CrispSDK {
  /**
   * @description 初始化状态标志
   */
  private isInitialized = false;

  /**
   * @description SDK 配置
   */
  private config: CrispSDKConfig;

  /**
   * @description 加载状态标志
   */
  private loading = false;

  /**
   * @description 上次更新的用户配置缓存
   */
  private lastUserConfig: Partial<UserData> | null = null;

  /**
   * @description 打开对话框的 Promise 解析函数
   */
  private openChatResolve: (() => void) | null = null;

  /**
   * @description SDK 加载重试相关配置
   * @constant {number} MAX_RETRIES - 最大重试次数
   * @constant {number} RETRY_DELAY - 重试间隔时间(毫秒)
   */
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  /**
   * @description 构造函数
   * @param {CrispSDKConfig} config - SDK 配置
   */
  constructor(config: CrispSDKConfig) {
    this.config = config;
  }

  /**
   * @description 延迟执行工具函数
   * @param {number} ms - 延迟时间（毫秒）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * @description 重置实例属性
   */
  private resetInstanceProperties(): void {
    // SDK 状态
    this.isInitialized = false;
    this.loading = false;

    // 缓存数据
    this.lastUserConfig = null;
    this.openChatResolve = null;
  }

  /**
   * @description 初始化 Crisp SDK，支持失败重试机制
   */
  private async initCrispSDK(retryCount = 0): Promise<void> {
    if (this.isInitialized) return;

    try {
      const userInfo = this.config.getUserInfo();

      Crisp.configure(this.config.appId, {
        autoload: false,
        locale: userInfo.local,
      });

      // 如果用户已登录，设置 tokenId 以实现会话连续性
      if (!this.config.isVisitor() && userInfo.userId) {
        const secureToken = `crisp_token_${userInfo.userId}_${new Date().getTime()}`;
        Crisp.setTokenId(secureToken);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error(error);
      if (retryCount < this.MAX_RETRIES) {
        await this.sleep(this.RETRY_DELAY);
        return this.initCrispSDK(retryCount + 1);
      }
    }
  }

  /**
   * @description 处理聊天窗口UI元素的显示状态
   * @private
   */
  private handleChatUIElements(): void {
    try {
      // 获取Crisp聊天窗口容器
      const crispChatbox = document.getElementById('crisp-chatbox')!;
      // 在聊天窗口容器内查找元素
      // 隐藏默认启动按钮 - 使用data属性选择器
      const unreadIndicator = crispChatbox.querySelector('[data-has-unread]') as HTMLElement;
      if (unreadIndicator) {
        // 添加一个自定义类来控制显示
        unreadIndicator.classList.add('crisp-hide');
        // 添加内联样式
        unreadIndicator.setAttribute('style', 'display: none !important');
      }

      // 显示聊天窗中右上角关闭按钮 - 使用role和aria-label属性选择器
      const closeBtn = crispChatbox.querySelector('[role="button"][aria-label="Close chat"]') as HTMLElement;
      if (closeBtn) {
        // 添加一个自定义类来控制显示
        closeBtn.classList.add('crisp-show');
        // 添加内联样式
        closeBtn.setAttribute('style', 'display: block !important');
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 设置聊天窗口的事件监听器
   * @private
   */
  private setupChatEventListeners(): void {
    // 使用 Crisp SDK 原生方法注册事件
    Crisp?.chat?.onChatOpened(() => {
      this.loading = false;
      this.handleChatUIElements();
      if (this.openChatResolve) {
        this.openChatResolve();
        this.openChatResolve = null;
      }
    });

    // 设置 DOM 观察机制
    this.setupDOMObserver();

    // 注册关闭事件
    Crisp?.chat?.onChatClosed(() => {
      this.loading = false;
    });
  }

  /**
   * @description 设置 DOM 变化观察器
   * @private
   */
  private setupDOMObserver(): void {
    let observer: MutationObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    const checkInterval = 100; // 每100ms检查一次

    const checkChatbox = () => {
      try {
        const crispChatbox = document.getElementById('crisp-chatbox');
        if (crispChatbox && window.getComputedStyle(crispChatbox).display !== 'none') {
          // 清除定时器和观察器
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (observer) {
            observer.disconnect();
            observer = null;
          }

          this.loading = false;
          this.handleChatUIElements();
          if (this.openChatResolve) {
            this.openChatResolve();
            this.openChatResolve = null;
          }
          return;
        }
      } catch (error) {
        console.error(error);
      }

      timeoutId = setTimeout(checkChatbox, checkInterval);
    };

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          checkChatbox();
          break;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 立即开始检查
    checkChatbox();
  }

  /**
   * @description 检查用户配置是否发生变化
   * @param {Partial<UserData>} newConfig - 新的用户配置
   * @returns {boolean} 如果配置发生变化返回 true
   */
  private hasConfigChanged(newConfig: Partial<UserData>): boolean {
    // 1. 首次检查：如果没有上次的配置记录，直接返回 true
    if (!this.lastUserConfig) return true;
    // 2. 获取需要追踪的字段列表
    // - 优先使用自定义的 trackFields
    // - 如果没有自定义，则使用默认的 CRISP_USER_CONFIG_KEYS
    const fieldsToTrack = this.config.trackFields || CRISP_USER_CONFIG_KEYS;
    // 3. 使用 some 方法检查是否有字段值发生变化
    return fieldsToTrack.some((field) => this.lastUserConfig?.[field] !== newConfig[field]);
  }

  /**
   * @description 更新用户配置
   * @returns {Promise<void>}
   */
  private async syncUserConfig(): Promise<void> {
    // 如果尚未初始化，则不需要更新配置
    if (!this.isInitialized) {
      return;
    }

    const newConfig = this.buildUserConfig();

    if (!this.hasConfigChanged(newConfig)) {
      return;
    }
    try {
      await this.update(newConfig);
      this.lastUserConfig = newConfig;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 构建 Crisp 用户配置
   * @remarks
   * - 访客用户：仅返回默认配置
   * - 登录用户：合并默认配置和用户信息
   * @returns {Partial<UserData>} 用户配置对象，包含界面样式和用户属性
   */
  private buildUserConfig(): Partial<UserData> {
    const userInfo = this.config.getUserInfo();

    if (this.config.isVisitor()) {
      return {};
    }

    return userInfo;
  }

  /**
   * @description 获取加载状态
   * @returns {boolean} 当前加载状态
   */
  public get isLoading(): boolean {
    return this.loading;
  }

  /**
   * @description 打开 Crisp 对话框
   */
  public async open(): Promise<void> {
    try {
      // 如果对话框已经打开，直接返回
      if (Crisp?.chat?.isChatOpened?.()) return;

      // 如果正在加载中，直接返回
      if (this.loading) return;

      this.loading = true;

      if (!this.isInitialized) {
        await this.initCrispSDK();
      }

      await this.syncUserConfig();

      // 创建一个 Promise 来等待对话框打开
      return new Promise<void>((resolve) => {
        // 保存 resolve 函数以便在事件监听器中调用
        this.openChatResolve = resolve;

        // 打开聊天窗口并设置事件监听
        Crisp?.chat?.open?.();
        this.setupChatEventListeners();
      });
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  /**
   * @description 关闭 Crisp 对话框
   */
  public async close(): Promise<void> {
    try {
      // 调用 SDK 的关闭方法
      Crisp.chat.close();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 更新 Crisp 配置
   */
  public async update(config: Partial<UserData>): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initCrispSDK();
      }

      // 设置用户基本信息 - 处理核心字段
      if (config.email) {
        Crisp.user.setEmail(config.email);
      }

      if (config.nickname) {
        Crisp.user.setNickname(config.nickname);
      }

      if (config.phone) {
        Crisp.user.setPhone(config.phone);
      }

      if (config.avatar) {
        Crisp.user.setAvatar(config.avatar);
      }

      // 设置会话数据
      const sessionData: Record<string, any> = {
        user_id: config.userId,
        created_at: config.created_at,
        locale: config.language || config.local,
      };

      // 添加其他自定义数据 - 使用过滤方式识别自定义字段
      const standardFieldSet = new Set(ALL_STANDARD_FIELDS);

      Object.entries(config).forEach(([key, value]) => {
        if (!standardFieldSet.has(key as any) && value !== undefined) {
          sessionData[key] = value;
        }
      });

      // 更新会话数据
      if (Object.keys(sessionData).length > 0) {
        Crisp.session.setData(sessionData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 销毁 Crisp 实例并清理资源
   * @remarks
   * - 重置所有实例属性到初始状态
   * @throws {Error} 销毁实例失败时抛出错误
   */
  public async destroy(): Promise<void> {
    try {
      // 清除 tokenId 和重置会话，解绑当前会话
      if (this.isInitialized) {
        Crisp.setTokenId(); // 清除 token 值
        Crisp.session.reset(); // 解绑当前会话
      }

      this.resetInstanceProperties();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 添加对话框关闭事件的回调函数
   * @param {() => void} callback - 关闭事件的回调函数
   * @returns {() => void} 返回用于移除该回调的函数
   * @throws {Error} 当回调函数不是函数类型时抛出错误
   */
  public onClose(callback: () => void): () => void {
    // 直接使用 Crisp SDK 的事件监听能力
    // 使用类型断言解决类型问题
    Crisp.chat.onChatClosed(callback);

    // 返回移除回调的函数
    return () => {
      // 移除事件监听器
      Crisp.chat.offChatClosed();
    };
  }

  /**
   * @param {CrispSDKConfig} config - SDK 配置
   * @returns {CrispSDK} CrispSDK 实例
   */
  public static createInstance(config: CrispSDKConfig): CrispSDK {
    return new CrispSDK(config);
  }
}
