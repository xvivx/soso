export const START_PRICE_LINE_ID = 'START_PRICE_LINE_ID';
export const END_PRICE_LINE_ID = 'END_PRICE_LINE_ID';
export const UP_RECT_ID = 'UP_RECT_ID';
export const DOWN_RECT_ID = 'DOWN_RECT_ID';
export const K_LINE_ID = 'K_LINE_ID';

export function SvgGradient(props: { height: number }) {
  const { height } = props;
  return (
    <defs>
      <linearGradient id={START_PRICE_LINE_ID} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
        <stop className="text-primary" stopColor="currentColor" stopOpacity="0" />
        <stop className="text-primary" offset="0.510417" stopColor="currentColor" stopOpacity="0.32" />
        <stop className="text-primary" offset="1" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>

      <linearGradient id={END_PRICE_LINE_ID} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
        <stop className="text-primary" stopColor="currentColor" stopOpacity="0" />
        <stop className="text-primary" offset="0.510417" stopColor="currentColor" stopOpacity="0.32" />
        <stop className="text-primary" offset="1" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>

      <linearGradient id={UP_RECT_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgb(46, 204, 113)" stopOpacity="0" />
        <stop offset="100%" stopColor="rgb(46, 204, 113)" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={DOWN_RECT_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgb(255, 84, 73)" stopOpacity="1" />
        <stop offset="100%" stopColor="rgb(255, 84, 73)" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={K_LINE_ID} x1="0" y1="0" x2="0" y2="1.2">
        <stop className="text-[#D7ED47]/50 light:text-[#CDE919]/60" offset="0%" stopColor="currentColor" />
        <stop className="text-[#161D26] light:text-[#CDE919]" offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}
