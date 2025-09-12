import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Chart } from "./chat/Context";
import { Line } from "./chat/Line";
import Axis from "./chat/Axis";
import { scaleLinear, scaleTime } from "d3";
import {
  motion,
  useMotionValue,
  useTransform,
  type TargetAndTransition,
  type Transition,
} from "motion/react";

/** 添加数据的频率 */
const TIME = 500;
const TRANSITION: Transition<any> = {
  ease: "linear",
  duration: TIME / 1e3,
};
/** 限制Y轴的移动在一个固定的区间，而不是一直移动 */
const RELATIVE_Y = 0.5;
/** 每次添加数据时的随机增量 */
const RANDOM = 0.1;
/** 每条x数据占用100px */
const PIXELX = 40 / 500;
const PIXELY = 40;
/** x轴渲染屏数 */
const ScreenX = 2;

function App() {
  const width = 800;
  const height = 800;
  // x轴屏幕外多渲染4屏
  const ticks = (800 * ScreenX) / 40;
  // y轴屏幕外多渲染两屏
  const offScreenDatas = Math.ceil(height / PIXELY);
  const [data, setData] = useState<[number, number][]>(sourceData);
  const pointY = useMotionValue(0);

  useEffect(() => {
    // if (data.length > 5) return;
    const yMin = 30,
      yMax = 100;
    let newData = data;
    const last = data[data.length - 1];
    const timer = setTimeout(() => {
      const delta = (Math.random() * RANDOM - RANDOM / 2) * last[1];
      const newItem = Math.max(yMin, Math.min(yMax, last[1] + delta));
      setData([...newData, [Date.now(), newItem]]);
    }, TIME);
    return () => {
      clearTimeout(timer);
    };
  }, [data]);

  const startX = data[0][0];
  const lastX = data[data.length - 1][0];
  const lastY = data[data.length - 1][1];
  const scaleX = useMemo(() => {
    const domain = [new Date(startX), new Date(startX + ticks * 500)];
    return scaleTime().domain(domain).range([400, 800]);
  }, [startX, lastX]);

  const ys = useMemo(() => data.map((it) => it[1]), [data]);
  const minY = useMemo(() => Math.min(...ys), [ys]);
  const maxY = useMemo(() => Math.max(...ys), [ys]);
  const domainY = useMemo(
    () => [minY - offScreenDatas, maxY + offScreenDatas],
    [minY, maxY]
  );

  const scaleY = useMemo(() => {
    return scaleLinear()
      .domain(domainY)
      .range(domainY.map((it) => it * PIXELY));
  }, [domainY]);

  const x = -scaleX(lastX) + width / 2;
  console.log(x);

  const moveX: TargetAndTransition = {
    x,
    transition: TRANSITION,
  };

  const y = -scaleY(lastY) + height / 2;

  const relativeY = useRef(y);
  relativeY.current;
  if (relativeY.current - (RELATIVE_Y * height) / 2 > y) {
    relativeY.current = y + (RELATIVE_Y * height) / 2;
  } else if (relativeY.current + (RELATIVE_Y * height) / 2 < y) {
    relativeY.current = y - (RELATIVE_Y * height) / 2;
  }

  const moveY: TargetAndTransition = {
    y: relativeY.current,
    transition: TRANSITION,
  };

  const border = 24;
  const transformPoint = useTransform(() => pointY.get() - 80);

  return (
    <Chart xScale={scaleX} yScale={scaleY} width={width} height={height}>
      <defs>
        <clipPath id="clip">
          <rect x={0} y={0} width={width} height={height - border} />{" "}
          {/* 只显示左半部分 */}
        </clipPath>
      </defs>
      <g clipPath="url(#clip)">
        <Line
          data={data}
          fill="none"
          stroke="#66d9e8"
          strokeWidth={2}
          animate={{
            x,
            y: relativeY.current,
            transition: TRANSITION,
          }}
          duration={TRANSITION.duration}
          point={pointY}
        />
      </g>
      <g transform={`translate(0,${height - border})`} clipPath="url(#clip)">
        {/* <Axis direction="bottom" ticks={ticks} animate={moveX} /> */}
      </g>
      <motion.g animate={moveY}>
        {/* <Axis direction="left" ticks={domainY[1] - domainY[0]} /> */}
        <motion.foreignObject
          x={width / 2}
          y={80}
          width={120}
          height={60}
          style={{ y: transformPoint }}
        >
          0000000
        </motion.foreignObject>
      </motion.g>
      {/* <Grid width={width} height={height} spacing={PIXELX} /> */}
    </Chart>
  );
}

function Tooltip() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <foreignObject x={100} y={30} width={120} height={60}>
      {count}
    </foreignObject>
  );
}

export default App;
const now = Date.now();
const sourceData: [number, number][] = [
  [0, 46.45889659154335],
  [1, 43.13133194467011],
  [2, 45.072347235971854],
  [3, 40.110668330319136],
  [4, 38.71356330715831],
  [5, 41.15355710587292],
  [6, 42.3190143273753],
  [7, 41.5246318804715],
  [8, 45.53740581791818],
  [9, 47.64947082436963],
].map((it, index) => [now - (9 - index) * 500, it[1]]);

export const Grid: React.FC<GridProps> = ({ width, height, spacing = 10 }) => {
  const verticalLines = [];
  const horizontalLines = [];

  // 垂直线
  for (let x = 0; x <= width; x += spacing) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="gray"
        strokeWidth={1}
        strokeDasharray="4,4" // 虚线: 4px 实线 + 4px 空白
      />
    );
  }

  // 水平线
  for (let y = 0; y <= height; y += spacing) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="gray"
        strokeWidth={1}
        strokeDasharray="4,4"
      />
    );
  }

  return <g>{[...verticalLines, ...horizontalLines]}</g>;
};

interface GridProps {
  width: number;
  height: number;
  spacing?: number; // 每个格子间隔像素
}
