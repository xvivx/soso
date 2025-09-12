import { createPortal } from 'react-dom';
import axios from 'axios';
import { store } from '@store';
import usePortalRootElement from '@hooks/usePortalRootElement';
import { Loading } from '@components';
import { createRender } from '@components/FunctionRender';
import { loadScript } from '@utils/script';

const captchaApi = `https://www.google.com/recaptcha/api.js?render=explicit`;
const baseURL = import.meta.env.REACT_APP_BACKEND_BASE;
const CAPTCHA_KEY = import.meta.env.REACT_APP_CAPTCHA_KEY;
class Captcha {
  // captcha badge渲染的dom, 并非验证框渲染的地方
  private container: HTMLDivElement;

  // 后端验证成功后的回调
  onSuccess!: (token: string) => void;

  private iframeRoot?: HTMLElement;

  protected captchaWidgetId = -1;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
  }

  /** google验证成功后向后端验证token是否正确 */
  protected async verify(token: string) {
    try {
      let axiosResponse: { data: { code: number } };
      const { user } = store.getState();
      // 后端为了方便gateway逻辑分成了两个接口
      if (user.token) {
        axiosResponse = await axios.post<{ code: number }>(
          '/api/risk/recaptcha/verify',
          { token },
          {
            baseURL: baseURL,
            headers: {
              Authorization: user.token,
            },
          }
        );
      } else {
        axiosResponse = await axios.post<{ code: number }>(
          '/api/user/recaptcha/singleVerify',
          { token },
          { baseURL: baseURL }
        );
      }

      if (axiosResponse.data.code === 0) {
        this.onSuccess(token);
      } else {
        // 后端验证不通过抛出错误重新拉起
        this.forceReset();
      }
    } catch {
      this.forceReset();
    }
  }

  async init() {
    window[grecaptchaName] = await loadScript<Grecaptcha>(captchaApi, 'grecaptcha', grecaptchaName);
    await new Promise<void>((resolve) => window[grecaptchaName]!.ready(resolve));
  }

  /** 验证失败或者超时重置 */
  private async forceReset() {
    try {
      //google issue: https://github.com/dozoisch/react-google-recaptcha/issues/129
      window[grecaptchaName]!.reset(this.captchaWidgetId);
    } catch {}

    await this.setupIframePosition();
    await window[grecaptchaName]!.execute(this.captchaWidgetId);
  }

  private async setupIframePosition() {
    await new Promise<void>((resolve) => {
      /** 遍历文档中的iframe, 找到captcha的iframe */
      const loopIframe = () => {
        // google没有提供api访问iframe所在位置, 用这种方法找出验证框的iframe
        const captchaIframe = Array.from(document.body.querySelectorAll('iframe')).find((iframe) => {
          return (
            // 找出本项目key产生的iframe, 不要影响到外部项目
            iframe.src.includes('https://www.google.com/recaptcha/api2/bframe') && iframe.src.includes(CAPTCHA_KEY)
          );
        });

        if (captchaIframe) {
          const iframeParent = captchaIframe.parentElement!;
          const layer = (iframeParent.previousElementSibling || iframeParent.nextElementSibling) as HTMLDivElement;
          layer.style.backgroundColor = store.getState().system.theme === 'darken' ? 'black' : 'white';
          this.iframeRoot = iframeParent.parentElement!;
          // 去除遮罩层事件, 禁止点击关闭验证弹窗
          this.iframeRoot.replaceChild(layer.cloneNode(true), layer);
          this.iframeRoot.style.zIndex = '2000000000';
          iframeParent.style.marginTop = '8vh';

          // 防止不触发onload事件
          const timer = setTimeout(() => {
            captchaIframe.onload = null;
            resolve();
          }, 1500);

          captchaIframe.onload = () => {
            clearTimeout(timer);
            resolve();
          };
        } else {
          window.requestAnimationFrame(loopIframe);
        }
      };

      window.requestAnimationFrame(loopIframe);
    });
  }

  /** 渲染captcha, 矫正iframe位置 */
  async render() {
    const { lang, theme } = store.getState().system;
    this.captchaWidgetId = window[grecaptchaName]!.render(this.container, {
      size: 'invisible',
      sitekey: CAPTCHA_KEY,
      hl: lang,
      theme: theme === 'darken' ? 'dark' : 'light',
      callback: this.verify.bind(this),
      'error-callback': () => {
        console.error('verify failed');
        this.forceReset();
      },
      'expired-callback': () => {
        console.error('captcha expired');
        this.forceReset();
      },
    });

    await this.setupIframePosition();
    await window[grecaptchaName]!.execute(this.captchaWidgetId);
  }

  /** 清理工作 */
  destroy() {
    document.body.removeChild(this.container);
    this.iframeRoot && document.body.removeChild(this.iframeRoot);
    delete window[grecaptchaName];
  }
}

let verifyPromise: Promise<void> | null = null;
/**
 * @param loading 加载captcha时是否需要展示loading
 */
async function verify(loading = true) {
  if (!verifyPromise) {
    const closeCaptchaLoading = loading ? createRender(<CenterLoading key="captcha-loading" />) : null;
    const captcha = new Captcha();
    verifyPromise = new Promise<void>((verifyResolve) => {
      // 后端验证token没问题将会调用这里
      captcha.onSuccess = () => {
        // 验证成功后销毁captcha
        captcha.destroy();
        // 重置变量
        verifyPromise = null;
        verifyResolve();
      };
    });

    await captcha.init();
    await captcha.render();
    closeCaptchaLoading && closeCaptchaLoading();
  }

  await verifyPromise;
}

export default { verify };

interface Grecaptcha {
  ready: (callback: () => void) => void;
  execute: (id?: number) => Promise<string>;
  getResponse: () => string;
  reset: (id?: number) => void;
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      size: 'invisible';
      hl: string;
      theme: 'light' | 'dark';
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
    }
  ) => number;
}

// 防止和三方平台重名
const grecaptchaName = 'detrade-google-recaptcha';
declare global {
  interface Window {
    [grecaptchaName]?: Grecaptcha;
    grecaptcha?: Grecaptcha;
  }
}

function CenterLoading() {
  const element = usePortalRootElement();

  return createPortal(
    <div className="fixed inset-0 flex-center z-modal-up">
      <Loading className="static" />
    </div>,
    element
  );
}
