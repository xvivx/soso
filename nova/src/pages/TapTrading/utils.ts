import { scaleLinear } from '@visx/scale';

type MinBoundary = number;
type MaxBoundary = number;
export type XY = [number, number];
export type Scale = ReturnType<typeof scaleLinear<number>>;
export type ViewBounding = { width: number; height: number };
export type Domain = [MinBoundary, MaxBoundary];
export type Kline = [number, number];
export const KlineGap = 500;

function mod(price: number, gap: number) {
  const [intNumber, dotNumber = ''] = String(gap).split('.');
  if (dotNumber.length) {
    const tenPow = Math.pow(10, dotNumber.length);
    return ((price * tenPow) % (Number(intNumber) * tenPow + Number(dotNumber))) / tenPow;
  } else {
    return price % gap;
  }
}

export function calcGridXY(xDomain: Domain, yDomain: Domain, xy: XY, xGap: number, yGap: number): XY {
  const startX = xDomain[0] - mod(xDomain[0], xGap);
  const startY = yDomain[0] - mod(yDomain[0], yGap);
  let [x, y] = [0, 0];
  for (let i = 0; i < 10000; i++) {
    if (!x && xy[0] >= startX + i * xGap && xy[0] < startX + (i + 1) * xGap) {
      x = startX + i * xGap;
    }

    if (!y && xy[1] >= startY + i * yGap && xy[1] < startY + (i + 1) * yGap) {
      y = startY + i * yGap;
    }

    if (x && y) return [Number(x.toFixed(9)), Number(y.toFixed(9))];
  }

  return [x, y];
}
