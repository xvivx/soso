import { createContext, ReactElement, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const PortalContext = createContext<boolean>(false);

export default function useContextHolder() {
  const [contextHolder, setContextHolder] = useState<ReactElement>();
  const contextWrapper = useCallback((element: ReactElement) => {
    if (import.meta.env.MODE === 'development') {
      if (!element.key) throw new Error('传入的元素必须要有key');
    }
    return (
      <ContextHolder
        key={element.key}
        onReady={() => {
          setContextHolder(
            createPortal(
              <PortalContext.Provider value={true}>{element}</PortalContext.Provider>,
              document.getElementById(element.key!)!
            )
          );
        }}
        onDestroy={() => {
          setContextHolder(undefined);
        }}
      />
    );
  }, []);

  return [contextHolder, contextWrapper] as [ReactElement, typeof contextWrapper];
}

/** @param props.onReady createRender中动画节点加载回调, 此时可以安全调用createPortal将要传送的元素传出去 */
function ContextHolder(props: { onReady(): void; onDestroy: () => void }) {
  const { onReady, onDestroy } = props;
  useEffect(onReady);
  useEffect(() => onDestroy, [onDestroy]);
  return null;
}
