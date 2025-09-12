import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGridSize } from './hooks';
import { Scale, ViewBounding } from './utils';

type Ripple = { key: number; x: number; y: number };
const listeners: ((ripple: Ripple) => void)[] = [];

export function addRipple(ripple: Ripple) {
  listeners.forEach((callback) => callback(ripple));
}

function ClickRipple(props: { xScale: Scale; yScale: Scale; bounding: ViewBounding }) {
  const { xScale, yScale, bounding } = props;
  const GridSize = useGridSize(bounding);
  const [ripple, setRipple] = useState<Ripple>();
  useEffect(() => {
    const index = listeners.length;
    listeners.push(setRipple);
    return () => {
      listeners.splice(index, 1);
    };
  }, []);

  if (!ripple) return null;
  return (
    <motion.rect
      key={ripple.key}
      className="stroke-down fill-down"
      x={xScale(ripple.x)}
      y={yScale(ripple.y) - GridSize}
      width={GridSize}
      height={GridSize}
      rx={GridSize}
      ry={GridSize}
      strokeDasharray="3 3"
      animate={{ scale: [0.3, 0.6, 1.2], fillOpacity: [1, 0, 0], strokeWidth: [0, 3, 0], strokeOpacity: [0, 1, 1] }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => setRipple(undefined)}
    />
  );
}

export default memo(ClickRipple);
