import { line, curveMonotoneX, curveNatural } from "d3";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import {
  motion,
  MotionValue,
  useAnimate,
  useMotionValue,
  type SVGMotionProps,
} from "motion/react";
import { useChart } from "./Context";

export function Line(props: LineProps) {
  const {
    line: propsLine,
    point = useMotionValue(0),
    duration = 0.5,
    data,
    ...others
  } = props;

  const [scope, offset] = useLineAnimate(props);
  const lineFn = propsLine || useCurveMonotone();

  return (
    <motion.path
      ref={scope}
      {...others}
      d={lineFn(data)!}
      style={{ strokeDashoffset: offset }}
    />
  );
}

function useCurveMonotone() {
  const { xScale, yScale } = useChart();
  const [lineFn] = useState(() => {
    return line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(curveMonotoneX);
  });

  return lineFn;
}

function useCurveNatural() {
  const { xScale, yScale } = useChart();
  const [lineFn] = useState(() => {
    return line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(curveNatural);
  });

  return lineFn;
}

function useLineAnimate(props: LineProps) {
  const { point = useMotionValue(0), duration = 0.5, data } = props;
  const [scope, animate] = useAnimate<SVGPathElement>();
  const offset = useMotionValue(0);

  // 记录每个点的path长度
  const lengths = useRef<Map<number[], number>>(null as any);
  if (!lengths.current) {
    lengths.current = new Map();
  }

  useLayoutEffect(() => {
    const pathEl = scope.current!;
    const lengthList = lengths.current;
    // 当记录的长度大于或等于数据长度时，说明数据进行了删减，扣除被减的长度
    if (lengthList.size >= data.length) {
      const x = data[0][0];
      let cutLength = lengthList.get(data[0]) || 0;
      for (const [item, len] of lengthList.entries()) {
        if (item[0] < x) {
          lengthList.delete(item);
        } else {
          lengthList.set(item, len - cutLength);
        }
      }
    }
    const preLength = lengthList.get(data[data.length - 2]) || 0;
    const newLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(newLength);
    offset.set(newLength - preLength);

    animate(offset, 0, {
      duration,
      ease: "linear",
      onUpdate(x) {
        const p = pathEl.getPointAtLength(newLength - x);
        point.set(p.y);
      },
    });
    lengthList.set(data[data.length - 1], newLength);
  }, [data]);

  return [scope, offset] as const;
}

interface LineProps extends SVGMotionProps<SVGPathElement> {
  data: [number, number][];
  duration?: number;
  line?: d3.Line<[number, number]>;
  point?: MotionValue<number>;
}
