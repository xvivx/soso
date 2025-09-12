import { forwardRef, memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, SvgIcon } from '@components';
import { cn } from '@utils';
import type { Menu } from '../useNavMenus';

interface MenuItemProps {
  className?: string;
  menu: Menu['children'][number];
}

const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(props, ref) {
  const { className, menu } = props;
  const { pathname } = useLocation();
  const isHighLow = useMemo(() => {
    const url = pathname.replace(/\/$/, '');
    return url === '/trade-center/high-low' || url === '/trade-center';
  }, [pathname]);

  return (
    <Button
      ref={ref}
      className={cn(
        'menu-item w-full p-3 flex justify-start gap-4 bg-layer4 text-primary normal-case whitespace-normal',
        className
      )}
      size="free"
      hoverable={false}
      theme="transparent"
      asChild
      onClick={(event) => {
        if (menu.onClick) {
          event.preventDefault();
          menu.onClick();
        }
      }}
    >
      <NavLink
        // HighLow是默认的, 也有单独的URL, 需要单独判断, url传过来是/trade-center/high-low
        className={menu.url === '/trade-center/high-low' ? (isHighLow ? 'menu-item-matched' : '') : ''}
        to={menu.url}
        // logout的url是空
        activeClassName={menu.url && 'menu-item-matched'}
        exact
      >
        {menu.icon}
        <div className="flex-1 leading-normal font-700 text-14">
          {menu.title}
          {menu.subTitle && <div className="text-11 font-500">{menu.subTitle}</div>}
        </div>
        {menu.children && <SvgIcon className="size-4" name="arrow" />}
      </NavLink>
    </Button>
  );
});

export default memo(MenuItem);
