import { forwardRef, memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { cn } from '@utils';
import { ImageProps } from './types';

// ----------------------------------------------------------------------

const Image = forwardRef<HTMLDivElement, ImageProps>(({ className, style, ...rests }, _) => {
  return (
    <LazyLoadImage
      wrapperClassName={cn('block overflow-hidden shrink-0', className)}
      className="object-cover size-full"
      wrapperProps={{ style }}
      {...rests}
    />
  );
});

export default memo(Image);
