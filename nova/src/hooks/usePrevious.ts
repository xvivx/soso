import { useMemo, useRef } from 'react';

export default function usePrevious<T = any>(value: T) {
  const cacheRef = useRef<T[]>(import.meta.env.DEV ? [value] : []);
  return useMemo(() => {
    // 兼容严格模式
    const index = import.meta.env.DEV ? 3 : 2;
    cacheRef.current.push(value);
    cacheRef.current = cacheRef.current.slice(-index);
    return cacheRef.current[cacheRef.current.length - index] as T | undefined;
  }, [value]);
}
