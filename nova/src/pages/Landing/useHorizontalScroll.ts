import { useEffect, useRef } from 'react';

/**
 * 用于实现横向无缝滚动的自定义 Hook
 * @param originalItems 原始数据数组（未复制前的数组）
 * @param gap 项目之间的间距（可选，默认 0）
 * @returns { ref: React.RefObject<HTMLDivElement> } 返回 ref，绑定到滚动容器
 */
export function useHorizontalScroll<T>(originalItems: T[], gap = 0) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 自动计算单个项目的宽度
    const firstChild = container.children[0] as HTMLElement;
    if (!firstChild) return;

    // 获取单个项目的宽度
    const childWidth = firstChild.offsetWidth;
    // 原数组的总宽度(多预留一个gap的距离, 这样可以实现无缝衔接滚动)
    const totalWidth = originalItems.length * (childWidth + gap);
    container.style.setProperty('--move-distance', `-${totalWidth}px`);
  }, [originalItems, gap]);

  return { ref: containerRef };
}
