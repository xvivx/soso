import { Suspense, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@store';
import { useTheme } from '@store/system';
import { Loading } from '@components';
import { FunctionRenderProvider } from '@components/FunctionRender';
import NavigateProvider from '@/routes/NavigateProvider';
import i18n from './i18n';
import AccountTypeTransition from './layouts/dashboard/header/AccountTypeTransition';
import Provider from './Provider';
import Routes from './routes';

if (import.meta.env.DEV && import.meta.env.REACT_APP_USE_MOCK) {
  await import('@mock');
}

createRoot(document.body.querySelector('#detrade-root')!).render(
  <Provider
    onReady={() => {
      i18n.initialize();
      // 初始化主题, 防止Suspense闪烁
      const classnames = ['detrade', 'bg-layer2'];
      if (store.getState().system.theme === 'lighten') {
        classnames.push('detrade-light');
      }
      classnames.forEach((cls) => document.documentElement.classList.add(cls));
    }}
  >
    <App />
  </Provider>
);

function App() {
  const theme = useTheme();
  useLayoutEffect(() => {
    const appHtml = document.documentElement;
    if (theme === 'lighten') {
      appHtml.classList.add('detrade-light');
    }

    return () => {
      appHtml.classList.remove('detrade-light');
    };
  }, [theme]);

  return (
    <BrowserRouter>
      <NavigateProvider>
        <FunctionRenderProvider />
        <AccountTypeTransition />
        <Suspense fallback={<Loading.Screen />}>
          <Routes />
        </Suspense>
      </NavigateProvider>
    </BrowserRouter>
  );
}
