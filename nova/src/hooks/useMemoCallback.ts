import { useCallback, useRef } from 'react';

type AnyFunction = (...args: any[]) => any;

export default function useMemoCallback<T extends AnyFunction>(cb: T): T {
  const callbackRef = useRef<T>(cb);
  callbackRef.current = cb;
  return useCallback<AnyFunction>((...args) => callbackRef.current(...args), []) as T;
}
