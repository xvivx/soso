import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { store } from '@store';
import bridge, { BridgeOptions } from '@store/bridge';
import { setMute, setTheme } from '@store/system';
import { Loading } from '@components';
import { FunctionRenderProvider } from '@components/FunctionRender';
import { detradePortal } from '@utils/others';
import Main from '@pages/ThirdPlatform';
import NavigateContext from '@/NavigateContext';
import i18n from './i18n';
import Provider from './Provider';

type Lang =
  | 'en'
  | 'en-IN'
  | 'vi'
  | 'id'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'es-ES'
  | 'fil'
  | 'ar'
  | 'hi'
  | 'tr'
  | 'fa'
  | 'pt-PT'
  | 'ru'
  | 'de'
  | 'th'
  | 'fi'
  | 'pl'
  | 'it'
  | 'my'
  | 'nl'
  | 'ur-PK'
  | 'uk'
  | 'ms'
  | 'bn-IN'
  | 'mr'
  | 'ta'
  | 'te'
  | 'zh-CN'
  | 'zh-TW';

type Options = BridgeOptions & { theme?: 'darken' | 'lighten'; lang?: Lang };

class Trading {
  private root: ReactDOM.Root;
  private options: Options;

  constructor(options: Options) {
    this.root = ReactDOM.createRoot(options.container);
    this.options = options;
  }

  render(options: Options) {
    this.options = { ...this.options, ...options };
    const { theme = 'darken', lang = 'en', accessCode = '', type = 'contract', sound } = this.options;
    bridge.set(this.options);
    i18n.initialize(lang);
    store.dispatch(setTheme(theme));
    store.dispatch(setMute(!sound));
    setupRootElement(theme, this.options.container);

    this.root.render(
      <Provider
        onReady={() => {
          this.options.onLoad && this.options.onLoad();
          this.options.container.classList.add('detrade');
          detradePortal.root.classList.add('detrade', 'detrade-portal');
        }}
      >
        <NavigateContext.Provider value={{ isPopAction: false, disableAnimation: false }}>
          <FunctionRenderProvider />
          <Suspense fallback={<Loading.Screen showLogo={false} />}>
            <Main accessCode={accessCode} type={type} />
          </Suspense>
        </NavigateContext.Provider>
      </Provider>
    );
  }

  unmount() {
    detradePortal.destroy();
    this.root.unmount();
  }
}
// @ts-expect-error 暴露给全局对象, 兼容之前的接入方式
window.Trading = Trading;
export default Trading;

function setupRootElement(theme: Options['theme'] = 'darken', appRoot: HTMLElement) {
  if (theme === 'lighten') {
    appRoot.classList.add('detrade-light');
    detradePortal.root.classList.add('detrade-light');
  } else {
    appRoot.classList.remove('detrade-light');
    detradePortal.root.classList.remove('detrade-light');
  }
}
