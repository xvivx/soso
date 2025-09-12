import { useSelector } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Action, Reducer } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import binary from './binary';
import bridge from './bridge';
import contract from './contract';
import guide from './guide';
import notification from './notification';
import spread from './spread';
import symbol from './symbol';
import system from './system';
import tap from './tap';
import upDown from './upDown';
import user from './user';
import account from './wallet';

export { useUserApis } from './user';

const inThirdPlatform = bridge.get().micro;
function storageReducer<S = Record<string, any>, A extends Action = Action>(
  key: string,
  reducer: Reducer<S, A>,
  options: XorY<{ whitelist: (keyof S)[] }, { blacklist: (keyof S)[] }> | null = null,
  forceCache?: true
) {
  // prettier-ignore
  const appPersistReducer = (forceCache || !inThirdPlatform)
      ? persistReducer
      : ((_, baseReducer) => baseReducer) as typeof persistReducer;

  return appPersistReducer(
    {
      key,
      keyPrefix: 'trading-v4.0.6.',
      whitelist: options && 'whitelist' in options ? (options.whitelist as string[]) : undefined,
      blacklist: options && 'blacklist' in options ? (options.blacklist as string[]) : undefined,
      storage,
    },
    reducer
  );
}

export const rootReducer = combineReducers({
  account,
  user,
  binary,
  spread,
  contract,
  symbol,
  upDown,
  tap,
  /** system要在外部平台缓存 */
  system: storageReducer(
    'system',
    system,
    // 外部平台会主动设置主题和语言, 只缓存游戏相关的配置
    inThirdPlatform
      ? { whitelist: ['binary', 'spread', 'leverage', 'updown', 'tap'] }
      : { blacklist: ['isMaintenance', 'chat'] },
    true
  ),
  /** 自己平台缓存局部字段所以单独配置 */
  notification: storageReducer('notification', notification),
  /** 新手引导状态 */
  guide: storageReducer('guide', guide),
});

const appReducer = storageReducer('root', rootReducer, {
  whitelist: ['user', 'account'],
});

const store = configureStore({
  reducer: appReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: true,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

const { dispatch } = store;
window.appDispatch = dispatch;

export type AppDispatch = typeof store.dispatch;

const appPersistStore = persistStore(store);
export { store, appPersistStore };

/* 返回是否是外部平台 */
export function useIsThirdPlatformUser() {
  const userInfo = useSelector((state) => state.user.info);
  return 'currency' in userInfo;
}

declare global {
  type StoreState = ReturnType<typeof store.getState>;
  const appDispatch: AppDispatch;

  interface Window {
    appDispatch: AppDispatch;
  }
}
