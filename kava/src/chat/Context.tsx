import { scaleLinear, type ScaleLinear } from 'd3';
import { motion } from 'motion/react';
import type { SVGMotionProps } from 'motion/react';
import { createContext, useContext, type PropsWithChildren } from "react";

export function Chart (props: PropsWithChildren<SVGMotionProps<SVGSVGElement>&Partial<ChartContextProps>>) {
  const {
    width = 900,
    height = 500,
    xScale = scaleLinear().domain([0, 100]).range([0, width]),
    yScale = scaleLinear().domain([0, 100]).range([height, 0]),
    ...others
  } = props;

  return (
    <motion.svg {...others} viewBox={`0 0 ${width} ${height}`}>
      <Context value={{width, height, xScale, yScale}}>
        { props.children }
      </Context>
    </motion.svg>
  );
}

interface ChartContextProps {
  width: number;
  height: number;
  yScale: ScaleLinear<number, number>;
  xScale: ScaleLinear<number, number>;
}


const Context = createContext<ChartContextProps>(null as unknown as ChartContextProps);
// const XScale = createContext<ScaleLinear<number, number>>(null as unknown as ScaleLinear<number, number>);
// const YScale = createContext<ScaleLinear<number, number>>(null as unknown as ScaleLinear<number, number>);

export function useChart () {
  return useContext(Context);
}
