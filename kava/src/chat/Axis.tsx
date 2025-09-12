import { memo, useMemo } from "react";
import { motion, type SVGMotionProps } from 'motion/react';
import { useChart } from "./Context";

export default memo(function Axis (props: AxisProps) {
  const { direction = 'bottom', ticks = 10, ...others } = props;
  const ctx = useChart();
  const scale = direction === 'bottom' || direction === 'top' ? ctx.xScale : ctx.yScale;
  const tickList = useMemo(() => scale.ticks(ticks), [scale, ticks]);

  return (
    <motion.g {...others}>
      {direction === "bottom" ? (
        <line x1={0} y1={0} x2={ctx.xScale.range()[1]} y2={0} stroke="currentColor" />
      ) : (
        <line x1={0} y1={0} x2={0} y2={ctx.yScale.range()[1]} stroke="currentColor" />
      )}
      {direction === "bottom" &&
        tickList.map((tick: any) => {
          const x = scale(tick);
          return <TickX key={tick} tick={tick} position={x} />
        })}
      {direction === "left" &&
        tickList.map((tick: any, i) => {
          const y = scale(tick);
          return <TickY key={tick} tick={tick} position={y} />
        })}
    </motion.g>
  )

});

const TickX = memo((props: {tick: number|string, position: number}) => {
  return (
    <g transform={`translate(${props.position},0)`}>
      <line y1={0} y2={6} stroke="currentColor" />
      <text y={9} dy="0.71em" textAnchor="middle" fill="currentColor">
        {props.tick}
      </text>
    </g>
  );
});

const TickY = memo((props: {tick: number|string, position: number}) => {
  return (
    <g transform={`translate(0,${props.position})`}>
      <line x1={0} x2={800} stroke="currentColor" />
      <text x={-9} dy="0.32em" textAnchor="end" fill="currentColor">
        {props.tick}
      </text>
    </g>
  );
});


type Direction = 'bottom' | 'left' | 'top' | 'right';

export interface AxisProps extends Omit<SVGMotionProps<SVGGElement>, 'scale'> {
  direction?: Direction;
  ticks?: number;
}
