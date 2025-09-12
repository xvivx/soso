import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { SvgIcon } from '@components';
import { cn } from '@utils';

function Logo(props: Omit<BaseProps, 'onClick'>) {
  const { className } = props;
  return <SvgIcon.Logo className={cn('flex items-center gap-1.5 overflow-hidden', className)} as={NavLink} to="/" />;
}

export default memo(Logo);
