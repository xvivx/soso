import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from 'i18next';
import { Button, SvgIcon } from '@components';
import { Card } from '@pages/components';
import { createRender, render } from './store';

const INIT_CARD_WIDTH = 304;
const INIT_CARD_HEIGHT = 200;
const TOOLTIP_MARGIN = 40;
const RETRY_TIMEOUT = 200;
const MAX_RETRY_TIME = 3000;
const SCROLL_OFFSET = 70;
const SCROLL_DELAY = 200;

type Placement = 'top' | 'bottom' | 'left' | 'right';
type tooltipAlign = 'center' | 'start';
export interface GuideMaskStep {
  selectorIds: string[];
  placement: Placement;
  cardWidth?: number;
  title?: string;
  content?: ReactNode;
  maskImage?: string; // 遮罩图片URL
  hightPadding?: number;
  tooltipAlign?: tooltipAlign;
}

export type GuideMaskOptions = {
  steps: GuideMaskStep[];
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  onClose?: () => void;
};
interface GuideMaskOverlayProps {
  rects: DOMRect[];
  step: number;
  steps: GuideMaskStep[];
  tooltipPos: {
    top: number;
    left: number;
  };
  onNext: () => void;
  onClose: () => void;
  tooltipRef: React.RefObject<HTMLDivElement>;
}

const getArrowPosition = (placement: Placement) => {
  const positions: Record<Placement, React.CSSProperties> = {
    top: { bottom: '-10px', left: '50%', transform: 'translateX(-50%) rotate(180deg)' },
    bottom: { top: '-10px', left: '50%', transform: 'translateX(-50%)' },
    left: { right: '-17px', top: '50%', transform: 'translateY(-50%) rotate(90deg)' },
    right: { left: '-17px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' },
  };

  return positions[placement] || positions.bottom;
};

// 遮罩层
function GuideMaskOverlay(props: GuideMaskOverlayProps) {
  const { rects, step, steps, onNext, tooltipPos, onClose, tooltipRef } = props;
  const hightPadding = steps[step].hightPadding ?? 0;

  return (
    <motion.div
      key="overlay"
      className="fixed inset-0 z-[1000] w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="cm-mask" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rects.map((rect, index) => (
              <rect
                key={index}
                x={rect.x - hightPadding / 2}
                y={rect.y - hightPadding / 2}
                width={rect.width + hightPadding}
                height={rect.height + hightPadding}
                fill="black"
                rx="8"
                ry="8"
              />
            ))}
          </mask>
          {steps[step].maskImage && (
            <pattern id="mask-pattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
              <image href={steps[step].maskImage} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#cm-mask)" />
        {steps[step].maskImage &&
          rects.map((rect, index) => (
            <rect
              key={`mask-${index}`}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill="url(#mask-pattern)"
              opacity="0.3"
            />
          ))}
      </svg>

      {/* Tooltip card */}
      <motion.div
        className="absolute"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: `${steps[step].cardWidth ?? INIT_CARD_WIDTH}px`,
        }}
      >
        <div ref={tooltipRef}>
          <Card className="relative mb-6 s768:p-4 s768:pr-8 bg-layer4 text-primary">
            <div
              className="absolute text-[#323738] light:text-[#ffffff]"
              style={getArrowPosition(steps[step].placement)}
            >
              <svg width="25" height="10" viewBox="0 0 25 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.516 1.5121C14.5634 -0.440525 11.3976 -0.440525 9.44493 1.5121L0.959653 9.99738L25.0013 9.99738L16.516 1.5121Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <SvgIcon name="close" className="absolute top-2 right-2 size-4" onClick={onClose} />
            <div>{steps[step].content}</div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            theme="ghost"
            onClick={onNext}
            className="border-brand text-brand bg-alpha10 s768:font-600 s768:text-14 s768:px-9 s768:h-10"
          >
            {step === steps.length - 1 ? t('Complete') : t('Next')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GuideMaskCore(props: GuideMaskOptions) {
  const { steps, onClose, onComplete, onStepChange } = props;
  const [rects, setRects] = useState<DOMRect[]>([]);
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const retryStartRef = useRef<number | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 阻止页面滚动
  const preventScroll = () => {
    document.body.style.overflow = 'hidden';
  };
  // 恢复页面滚动
  const restoreScroll = () => {
    document.body.style.overflow = '';
  };

  const positionTooltip = useCallback((_currentStep: GuideMaskStep, rect: DOMRect, placement: Placement) => {
    const { tooltipAlign = 'center' } = _currentStep;

    // 计算中心点坐标
    let centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    if (placement === 'bottom' && tooltipAlign === 'start') {
      centerX = rect.x + rect.width / 4;
    }

    // 获取 tooltip 实际尺寸
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const cardWidth = tooltipRect?.width || INIT_CARD_WIDTH;
    const cardHeight = tooltipRect?.height || INIT_CARD_HEIGHT;

    // 计算不同位置的坐标
    const placementPosition: Record<Placement, { top: number; left: number }> = {
      top: {
        top: rect.y - TOOLTIP_MARGIN - cardHeight,
        left: centerX - cardWidth / 2,
      },
      bottom: {
        top: rect.y + rect.height + TOOLTIP_MARGIN,
        left: centerX - cardWidth / 2,
      },
      left: {
        top: centerY - cardHeight / 2,
        left: rect.x - TOOLTIP_MARGIN - cardWidth,
      },
      right: {
        top: centerY - cardHeight / 2,
        left: rect.x + rect.width + TOOLTIP_MARGIN,
      },
    };
    return placementPosition[placement];
  }, []);

  // 滚动到元素位置
  const scrollToElement = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    // 检查元素是否在视口内
    const isInViewport =
      rect.top >= SCROLL_OFFSET && rect.left >= 0 && rect.bottom <= innerHeight && rect.right <= innerWidth;

    if (!isInViewport) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, []);

  // 更新元素位置的函数
  const updateElementPosition = useCallback(() => {
    const currentStep = steps[step];
    // 查找目标元素
    const foundElements = currentStep.selectorIds
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null) as HTMLElement[];

    // 获取元素位置信息
    const rects = foundElements.map((element) => element.getBoundingClientRect());
    const allElementsHaveWidth = rects.every((rect) => rect && rect.width > 0);

    // 数量正确&都有宽度
    if (rects.length === currentStep.selectorIds.length && allElementsHaveWidth) {
      const tooltipPos = positionTooltip(currentStep, rects[0], currentStep.placement);
      setTooltipPos(tooltipPos);
      setRects(rects);
      clearTimeout(retryTimerRef.current as NodeJS.Timeout);
      // 滚动元素到可见区域
      setTimeout(() => {
        if (foundElements.length > 0) {
          scrollToElement(foundElements[0]);
        }
      }, SCROLL_DELAY);
    } else {
      // 元素未找到或无效，启动重试机制
      // 启动/续用重试计时
      if (retryStartRef.current === null) {
        retryStartRef.current = Date.now();
      }
      const gapTime = Date.now() - retryStartRef.current;
      if (gapTime >= MAX_RETRY_TIME) {
        // 超时关闭
        render.close('guide');
        return;
      }
      // 继续重试
      retryTimerRef.current = setTimeout(() => {
        updateElementPosition();
      }, RETRY_TIMEOUT);
    }
  }, [steps, step, positionTooltip, scrollToElement]);

  useEffect(() => {
    if (steps.length === 0) return;
    const handleReposition = () => {
      updateElementPosition();
    };
    handleReposition();
    // 添加全局事件监听器
    window.addEventListener('scroll', handleReposition, { capture: true });
    window.addEventListener('resize', handleReposition);
    // 监听目标元素变化
    const currentStep = steps[step];
    const elements = currentStep.selectorIds
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null) as HTMLElement[];

    const observer = new ResizeObserver(handleReposition);

    // 监听所有目标元素
    elements.forEach((element) => {
      observer.observe(element);
    });

    // 清理
    return () => {
      window.removeEventListener('scroll', handleReposition, { capture: true });
      window.removeEventListener('resize', handleReposition);
      observer.disconnect();
    };
  }, [step, steps, updateElementPosition]);

  // 卸载时恢复
  useEffect(() => {
    preventScroll();
    return () => {
      restoreScroll();
      clearTimeout(retryTimerRef.current);
      retryStartRef.current = null;
    };
  }, []);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      onComplete?.();
      onClose?.();
    }
  }, [step, steps.length, onStepChange, onComplete, onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <AnimatePresence>
      {rects.length ? (
        <GuideMaskOverlay
          rects={rects}
          step={step}
          steps={steps}
          tooltipPos={tooltipPos}
          onNext={handleNext}
          onClose={handleClose}
          tooltipRef={tooltipRef}
        />
      ) : null}
    </AnimatePresence>
  );
}

function showGuideMask(options: GuideMaskOptions) {
  const { steps, onComplete, onStepChange, onClose } = options;

  const destroy = createRender(
    <GuideMaskCore
      steps={steps}
      onComplete={onComplete}
      onStepChange={onStepChange}
      onClose={() => {
        onClose?.();
        destroy();
      }}
    />,
    'guide'
  );

  return destroy;
}

const guideMask = {
  show: showGuideMask,
  close: () => render.close('guide'),
};

export default guideMask;
