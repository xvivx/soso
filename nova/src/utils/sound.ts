import { Howl, Howler } from 'howler';
import tradeSound from '@/assets/sounds/click.mp3';
import failSound from '@/assets/sounds/fail.wav';
import successSound from '@/assets/sounds/win.mp3';

/**
 * 声音类型枚举
 */
export enum SoundType {
  SUCCESS = 'success',
  FAIL = 'fail',
  CLICK = 'click',
  // 可以根据需要添加更多声音类型
}

export type AudioResourceInput = string | URL | Blob | MediaSource;

/**
 * 单个音频资源配置
 */
export interface AudioResource {
  // 音频资源（导入的模块或URL字符串）
  src: AudioResourceInput;
  // 默认音量，范围0-1，不设置则使用全局音量
  volume?: number;
  // 是否循环播放
  loop?: boolean;
  // 是否预加载
  preload?: boolean;
  // 其他音频参数
  [key: string]: unknown;
}

/**
 * 声音资源配置接口
 */
export interface SoundResources {
  [key: string]: AudioResourceInput | AudioResource;
}

/**
 * 默认声音资源配置
 */
export const DEFAULT_SOUND_RESOURCES: SoundResources = {
  [SoundType.SUCCESS]: {
    src: successSound,
    preload: true, // 启用预加载
  },
  [SoundType.FAIL]: {
    src: failSound,
    preload: true, // 启用预加载
  },
  [SoundType.CLICK]: {
    src: tradeSound,
    preload: true, // 启用预加载
  },
};

/**
 * 声音管理器类（单例模式）
 */
export class Sound {
  // 单例实例
  private static instance: Sound | null = null;
  // Howler实例缓存
  private soundCache: Record<string, Howl | undefined> = {};

  // 声音资源映射
  private soundResources: SoundResources = {};

  // 全局静音状态
  private static globalMuted = false;

  // 全局静音变化监听器
  private static globalMuteListeners: ((muted: boolean) => void)[] = [];

  /**
   * 构造函数
   * @param options 配置选项
   * @param options.resources 声音资源映射
   */
  private constructor(
    options: {
      resources?: SoundResources;
    } = {}
  ) {
    const { resources = DEFAULT_SOUND_RESOURCES } = options;

    this.soundResources = { ...resources };

    // 预加载标记为预加载的音频
    this.preloadAudios();
  }

  /**
   * 获取Sound单例
   */
  public static getInstance(options?: { resources?: SoundResources }): Sound {
    if (!Sound.instance) {
      Sound.instance = new Sound(options);
    }
    return Sound.instance;
  }

  /**
   * 销毁单例（手动清理或特殊场景使用）
   * 注意：大多数情况下不需要手动调用，浏览器会自动清理资源
   */
  public static destroy(): void {
    if (Sound.instance) {
      // 清理音频缓存
      Object.values(Sound.instance.soundCache).forEach((sound) => {
        if (sound) {
          sound.unload();
        }
      });
      Sound.instance = null;
    }
    // 清理监听器
    Sound.globalMuteListeners = [];
  }

  /**
   * 预加载标记为预加载的音频
   */
  private preloadAudios(): void {
    Object.entries(this.soundResources).forEach(([type, resource]) => {
      if (typeof resource === 'object' && resource !== null && 'preload' in resource && resource.preload) {
        try {
          this.getSound(type); // 触发加载
        } catch (error) {}
      }
    });
  }

  /**
   * 设置全局静音状态
   */
  public static setGlobalMuted(muted: boolean): void {
    if (Sound.globalMuted !== muted) {
      Sound.globalMuted = muted;
      Howler.mute(muted);
      // 通知所有监听器
      Sound.globalMuteListeners.forEach((listener) => listener(muted));
    }
  }

  /**
   * 从资源中获取音频源
   */
  private getResourceSrc(resource: AudioResourceInput | AudioResource): string {
    if (resource === null || resource === undefined) {
      throw new Error('Invalid audio resource: null or undefined');
    }

    // 如果是对象且有src属性，则使用src
    if (typeof resource === 'object' && 'src' in resource) {
      return this.getResourceSrc(resource.src);
    }

    // 如果是URL对象，转换为字符串
    if (resource instanceof URL) {
      return resource.toString();
    }

    // 如果是字符串，直接返回
    if (typeof resource === 'string') {
      return resource;
    }

    // 其他类型，尝试转换为字符串
    return String(resource);
  }

  /**
   * 获取音频资源配置
   */
  private getResourceConfig(type: string): AudioResource | null {
    const resource = this.soundResources[type];

    // 如果是对象且有src属性，则视为AudioResource
    if (typeof resource === 'object' && resource !== null && 'src' in resource) {
      return resource;
    }

    return null;
  }

  /**
   * 获取Howler实例
   */
  private getSound(type: string): Howl {
    if (!this.soundCache[type] && this.soundResources[type]) {
      const resource = this.soundResources[type];
      const src = this.getResourceSrc(resource);
      const config = this.getResourceConfig(type);

      // 创建Howler实例
      this.soundCache[type] = new Howl({
        src: [src],
        loop: config?.loop || false,
        volume: config?.volume !== undefined ? config.volume : 1,
        preload: config?.preload || false,
        pool: 10,
        onloaderror: () => {
          this.soundCache[type] = undefined;
        },
      });
    }

    if (!this.soundCache[type]) {
      throw new Error(`Sound resource not found for type: ${type}`);
    }

    return this.soundCache[type]!;
  }

  /**
   * 静态播放方法（推荐使用）
   */
  public static async play(type: string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    try {
      // 确保实例存在
      const instance = Sound.getInstance();
      return await instance.play(type, options);
    } catch (error) {
      return Promise.resolve();
    }
  }

  /**
   * 实例播放方法
   */
  public async play(type: string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    if (!this.soundResources[type]) {
      return Promise.resolve();
    }

    // 如果全局静音，则不播放声音
    if (Sound.globalMuted) {
      return Promise.resolve();
    }

    try {
      const sound = this.getSound(type);

      // 检查音频是否已加载
      if (sound.state() === 'loading') {
        // 等待音频加载完成
        return new Promise((resolve) => {
          sound.once('load', () => {
            this.playSound(sound, options);
            resolve();
          });
          sound.once('loaderror', () => {
            resolve();
          });
        });
      }

      this.playSound(sound, options);
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  }

  /**
   * 实际播放音频的内部方法
   */
  private playSound(sound: Howl, options: { volume?: number; loop?: boolean } = {}) {
    // 应用播放选项
    if (options.volume !== undefined) {
      sound.volume(options.volume);
    }

    if (options.loop !== undefined) {
      sound.loop(options.loop);
    }

    // 如果音量为0且没有特定设置音量，则不播放
    const effectiveVolume = options.volume !== undefined ? options.volume : sound.volume();
    if (effectiveVolume <= 0) {
      return;
    }

    // 重置并播放
    sound.stop();
    sound.play();
  }
}
