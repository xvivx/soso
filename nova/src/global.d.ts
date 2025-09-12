import { CSSProperties, ReactNode } from 'react';

declare global {
  type ValueOf<T> = T[keyof T];

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XorY<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

  interface SymbolInfo {
    s: string; // symbol, BTC-USD
    symbol: string; // symbol, BTC/USD
    assetBaseImage: string;
    assetQuoteImage: string;
    orderStatus: boolean;
    onlineStatus: boolean;
    type: number; // 1-binary 2-contract
    decimalPlaces: number; // 货币对精度
  }

  let __webpack_public_path__: string;
  interface Window {
    __POWERED_BY_DETRADE__?: boolean;
    google: any;
    ethereum: any;
  }

  type BaseProps = {
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
  };

  interface MockSchema {
    url: string;
    type: 'get' | 'post' | 'put' | 'patch' | 'delete';
    // 处理接口返回
    response?<T = any>(options: { body: string; url: string; type: MockSchema['type'] }): T;
    template?: Record<string, any>;
  }

  function clearInterval(intervalId: NodeJS.Timer | string | number | undefined): void;

  declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
  }
}
