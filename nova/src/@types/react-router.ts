import * as H from 'history';

declare module 'react-router' {
  export type LocationState = {
    action?: 'FORCE-POP';
    replace?: boolean;
    from?: string;
    ts?: number;
    [key: string]: string | number | boolean | undefined;
  };
  export function useLocation<S = LocationState>(): H.Location<S>;
}
