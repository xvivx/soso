import { memo } from 'react';
import { SvgIcon } from '@components';
import { cn } from '@utils';

interface StarRatingProps {
  value?: number;
  max?: number;
  className?: string;
  activeClassName?: string;
}

function StarRating(props: StarRatingProps) {
  const { value = 0, max = 5, className = '', activeClassName = '' } = props;

  return [...Array(max)].map((_, index) => (
    <SvgIcon
      name="vipStar"
      key={index}
      className={cn('size-3.5', index < value ? `text-warn ${activeClassName}` : 'text-primary/20', className)}
    />
  ));
}

export default memo(StarRating);
