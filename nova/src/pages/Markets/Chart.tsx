import { memo } from 'react';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';
import { extent, max, min } from 'd3-array';

interface ChartProps {
  dataSource: {
    t: number; // 时间戳
    c: string; // 价格
  }[];
}

const width = 100;
const height = 32;
function Chart({ dataSource }: ChartProps) {
  if (!dataSource.length) return null;
  // 定义比例尺
  const xScale = scaleUtc({
    range: [0, width],
    domain: extent(dataSource, (d) => d.t) as [number, number],
  });
  const yScale = scaleLinear({
    range: [height, 0],
    domain: [min(dataSource, (d) => Number(d.c)) || 0, max(dataSource, (d) => Number(d.c)) || 0],
  });

  const isDown = Number(dataSource[0].c) > Number(dataSource[dataSource.length - 1].c);

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        {/* 渐变背景 */}
        <defs>
          <linearGradient id="chart-up" x1="0" y1="0" x2="0" y2="1.2">
            <stop className="text-up" offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop className="text-up" offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-down" x1="0" y1="0" x2="0" y2="1.2">
            <stop className="text-down" offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop className="text-down" offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 面积图 */}
        <LinePath
          className={isDown ? 'stroke-down' : 'stroke-up'}
          data={dataSource}
          x={(item) => xScale(item.t)}
          y={(item) => yScale(Number(item.c))}
          strokeWidth="2px"
          curve={curveMonotoneX}
          shapeRendering="geometricPrecision"
        />
        <AreaClosed
          data={dataSource}
          x={(d) => xScale(d.t)}
          y={(d) => yScale(Number(d.c))}
          yScale={yScale}
          fill={isDown ? `url(#chart-down)` : `url(#chart-up)`}
          curve={curveMonotoneX}
        />
      </svg>
    </div>
  );
}
export default memo(Chart);
