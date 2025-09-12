import { useEffect, useRef } from 'react';
import useDocumentVisible from './useDocumentVisible';

export default function useDebounceEffect(callback: Function, wait: number, deps: any[]) {
  const visible = useDocumentVisible();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!visible) return;

    callbackRef.current();
    const timer = setInterval(callbackRef.current, wait);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wait, visible, ...deps]);
}
