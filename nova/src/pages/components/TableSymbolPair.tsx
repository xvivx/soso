/**
 * table内货币对信息
 */
import { memo } from 'react';
import { Image, SvgIcon } from '@components';
import { cn } from '@utils';
import { Direction } from '@/type';

interface SymbolPairProps {
  symbol: string;
  className?: string;
  direction: Direction;
  baseImage: string;
}

export const TableSymbolPair = memo((props: SymbolPairProps) => {
  const { symbol, className, direction, baseImage } = props;
  const [name] = symbol.split('/');

  return (
    <div className={cn('flex items-center overflow-hidden', className)}>
      <Image src={baseImage} className="rounded-full shrink-0 size-5" />
      <div className="flex-1 ml-2 truncate text-14 text-primary">
        {name}
        <span className="text-secondary">/USDT</span>
      </div>
      <SvgIcon.Updown direction={direction} className="shrink-0 pointer-events-none" />
    </div>
  );
});
