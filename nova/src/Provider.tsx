import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
// avertastd-mono为等宽字体, 这里用于货币对价格
import './styles/avertastd-mono.css';
import './styles/index.css';
import { ReactNode, StrictMode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SWRConfig } from 'swr';
import { appPersistStore, store } from '@store';
import ErrorBoundary from '@pages/components/ErrorBoundary';
import ResponseViewport from './ResponseViewport';

export default function Main({ children, onReady }: { children: ReactNode; onReady: () => void }) {
  return (
    <StrictMode>
      <ErrorBoundary>
        <ReduxProvider store={store}>
          <ResponseViewport />
          <PersistGate persistor={appPersistStore} onBeforeLift={onReady}>
            <SWRConfig
              value={{
                refreshInterval: 0,
                revalidateOnFocus: true,
                focusThrottleInterval: 10 * 1000,
                revalidateOnMount: true,
                dedupingInterval: 30 * 1000,
                errorRetryCount: 3,
                errorRetryInterval: 3 * 1000,
              }}
            >
              {children}
            </SWRConfig>
          </PersistGate>
        </ReduxProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
