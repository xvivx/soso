/**
 * 用于在函数中直接渲染组件，调用createRender即可
 */
import { Suspense, useContext, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import usePortalRootElement from '@hooks/usePortalRootElement';
import { cn } from '@utils';
import { useNavigateContext } from '@/NavigateContext';
import Loading from '../Loading';
import { useRender, type OverlayVmNode } from './store';
import { PortalContext } from './useContextHolder';
// eslint-disable-next-line no-restricted-imports
import useDevice from './useDevice';

export { createRender, useOverlayContext } from './store';
export function useInPortal() {
  return useContext(PortalContext);
}

export function FunctionRenderProvider() {
  const element = usePortalRootElement();
  const { mobile } = useDevice();
  const [render, vmNodes] = useRender();
  const [messages, guides, overlays] = useMemo(
    () => [
      vmNodes.filter((node) => node.type === 'message'),
      vmNodes.filter((node) => node.type === 'guide'),
      vmNodes.filter((node) => node.type === 'overlay'),
    ],
    [vmNodes]
  );

  const variants = useMemo(
    () => ({
      mobile: {
        hidden: { y: '100%' },
        visible: { y: 0 },
      },
      desktop: {
        hidden: { scale: 0.25 },
        visible: { scale: 1, y: 0 },
      },
      message: {
        hidden: { x: mobile ? '100%' : '-100%' },
        visible: { x: 0 },
      },
    }),
    [mobile]
  );

  const activeOverlay = overlays[overlays.length - 1] as OverlayVmNode;

  useEffect(() => {
    if (mobile || !activeOverlay) return;

    document.body.addEventListener('keyup', onEscKeyUp, false);
    return () => {
      document.body.removeEventListener('keyup', onEscKeyUp);
    };

    function onEscKeyUp(event: KeyboardEvent) {
      event.key === 'Escape' && activeOverlay.closable && render.close();
    }
  }, [mobile, activeOverlay, render]);

  const { disableAnimation } = useNavigateContext();
  return createPortal(
    <PortalContext.Provider value={true}>
      <AnimatePresence key="message">
        {messages.length > 0 && (
          <motion.div
            key="message"
            variants={variants.message}
            exit="hidden"
            className={cn(
              'fixed z-max flex flex-col gap-2',
              mobile ? 'top-16 right-4 items-end' : 'left-4 bottom-4 items-start'
            )}
          >
            <AnimatePresence>
              {messages.map((it) => (
                <motion.div
                  key={it.key}
                  className="max-w-80"
                  variants={variants.message}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout="position"
                >
                  {it.node}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {disableAnimation && overlays.length === 0 ? null : (
        <AnimatePresence key="overlay">
          {overlays.length > 0 && (
            // 封装成组件和直接写在这里并不等价, 动画时间不一致会报removeChild错误
            <div className="detrade-overlay fixed inset-0 h-screen z-modal overflow-auto no-scrollbar overscroll-none touch-none">
              {/* 原来是在外层容器的背景做动画在safari上会闪, 还是加一个遮罩层用opacity动画 */}
              <motion.div
                className="absolute inset-x-0 top-0 -z-10 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ height: 'calc(100% + 1px)' }}
                transition={{ duration: 0.25 }}
                // 消除子元素事件冒泡误判
                onClick={() => {
                  activeOverlay.closable && render.close();
                }}
              />
              <div
                className="flex items-end s768:flex-center transform-gpu pointer-events-none"
                style={{ height: 'calc(100% + 1px)' }}
              >
                {overlays.map((it) => {
                  const shouldHiddenWithoutAnimation = overlays.length > 1 && activeOverlay.key !== it.key;
                  return (
                    <motion.div
                      key={it.key}
                      id={String(it.key)}
                      className={cn('w-full s768:w-auto pointer-events-auto', shouldHiddenWithoutAnimation && 'hidden')}
                      variants={mobile ? variants.mobile : variants.desktop}
                      // 48是非移动端的屏幕时最小边距左右24px
                      style={{
                        maxWidth: mobile ? '100%' : 'calc(100% - 48px)',
                      }}
                      initial="hidden"
                      animate={activeOverlay.key === it.key ? 'visible' : 'hidden'}
                      exit="hidden"
                      transition={{
                        duration: shouldHiddenWithoutAnimation ? 0 : 0.25,
                      }}
                    >
                      <Suspense
                        fallback={
                          <div className="relative w-full h-50">
                            <Loading />
                          </div>
                        }
                      >
                        {it.node}
                      </Suspense>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Guide 类型渲染 */}
      <AnimatePresence key="guide">
        {guides.map((guide) => (
          <motion.div
            key={guide.key}
            id={String(guide.key)}
            className="fixed inset-0 z-modal w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {guide.node}
          </motion.div>
        ))}
      </AnimatePresence>
    </PortalContext.Provider>,
    element
  );
}
