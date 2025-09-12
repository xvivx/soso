import { Fragment, memo, ReactNode, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { setTapConfig } from '@store/system';
import { useSettings } from '@store/tap';
import { useUserInfo } from '@store/user';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Loading, Popover, ScrollArea, SvgIcon } from '@components';
import { cn } from '@utils';
import Logo from '@pages/components/Logo';
import NotificationTrigger from '@pages/Notification/NotificationTrigger';
import I18nSelector from '../../I18nSelector';
import ChatTrigger from '../chat/Trigger';
import LoginButtons from '../LoginButtons';
import useNavMenus from '../useNavMenus';
import AvatarDropdown from './AvatarDropdown';
import DepositButton from './DepositButton';
import MenuItem from './MenuItem';
import SearchCrypto from './SearchCrypto';
import Wallet from './Wallet';

function Header(props: { className?: string }) {
  const { className } = props;
  const { isTemporary } = useUserInfo().data;
  const { mobile, gt1366 } = useMediaQuery();

  return (
    <header className={cn('flex items-center gap-3 h-12 px-4 s1024:h-16 s1024:px-3 bg-layer3', className)}>
      {mobile ? (
        <Button
          className="size-9 mr-auto"
          size="free"
          theme="secondary"
          asChild
          icon={
            <NavLink to="#/menu">
              <SvgIcon className="size-5" name="menuOff" />
            </NavLink>
          }
        />
      ) : (
        <Menus />
      )}
      {/* 未登录: pc(登录、注册) mobile(登录、注册、菜单) */}
      {isTemporary ? (
        <Fragment>
          <LoginButtons />
        </Fragment>
      ) : (
        // 已登录: pc(搜索货币对、充值、资产、个人信息、多语言、通知) mobile(钱包、通知、菜单)
        <Fragment>
          {mobile ? (
            <>
              <Wallet className="flex-1" />
              <ChatTrigger />
            </>
          ) : (
            <Fragment>
              {gt1366 && <SearchCrypto />}
              <DepositButton />
              <Wallet className="flex-1 s768:flex-none" />
              <AvatarDropdown />
              <LangSelect />
            </Fragment>
          )}
          <NotificationTrigger />
        </Fragment>
      )}
    </header>
  );
}

export default memo(Header);

/**
 * Header栏Logo和菜单栏
 */
export function Menus() {
  const { t } = useTranslation();
  const { gt1024 } = useMediaQuery();
  const menus = useNavMenus();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const settings = useSettings();

  useEffect(() => {
    pathname.includes('tap-trading') && settings.showDot && dispatch(setTapConfig({ 'showDot': false }));
  }, [pathname, settings.showDot, dispatch]);

  return (
    <div className="flex items-center gap-8 flex-1">
      <Logo className="w-auto cursor-pointer" />
      {gt1024 ? (
        <>
          {[
            // 第一个菜单项
            ...menus
              .slice(0, 1)
              .map((menu) => (
                <MenuGroup
                  key={menu.key}
                  title={menu.title}
                  content={<div className="space-y-1">{menu.children.map((nav) => getPopoverContent(nav))}</div>}
                />
              )),
            // 这里菜单是路由跳转, 所以单独插入
            <Button asChild theme="text" size="free" key="markets-button">
              <NavLink to="/dashboard/markets" className="text-14 font-700">
                {t('Markets')}
              </NavLink>
            </Button>,
            <Button asChild theme="text" size="free" key="leaderboard-button">
              <NavLink to="/dashboard/leaderboard" className="text-14 font-700">
                {t('Leaderboard')}
              </NavLink>
            </Button>,
            // 插入活动中心
            <Button asChild theme="text" size="free" key="campaign-center">
              <NavLink to="/dashboard/campaign-center" className="text-14 font-700">
                {t('Campaign')}
              </NavLink>
            </Button>,
            // 剩余的菜单项
            ...menus
              .slice(1)
              .map((menu) => (
                <MenuGroup
                  key={menu.key}
                  title={menu.title}
                  content={<div className="space-y-1">{menu.children.map((nav) => getPopoverContent(nav))}</div>}
                />
              )),
          ]}
        </>
      ) : (
        <MenuGroup
          title={t('Menu')}
          content={
            <div className="space-y-2 divide-y divide-thirdly">
              {menus.slice(0, 3).map((menu) => {
                return (
                  <div key={menu.key} className="pt-2 first:pt-0">
                    <div className="mb-1 leading-8 text-14 font-700">{menu.title}</div>
                    <div className="space-y-1">
                      {menu.children.map((sub) => {
                        return getPopoverContent(sub);
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        />
      )}
    </div>
  );
}

export function LangSelect() {
  return (
    <I18nSelector align="center" side="bottom" overlayClassName="z-50">
      <Button theme="secondary" icon={<SvgIcon className="size-5" name="language" />} />
    </I18nSelector>
  );
}

function MenuGroup(props: { title: ReactNode; content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { title, content } = props;
  return (
    <Popover
      trigger="hover"
      side="bottom"
      open={open}
      onOpenChange={setOpen}
      overlayClassName="z-50"
      content={<ScrollArea type="scroll">{content}</ScrollArea>}
    >
      <div className="flex items-center gap-1 h-8 s768:h-10 text-14 font-700 whitespace-nowrap">
        {title}
        <SvgIcon name="arrow" className={cn('size-3.5 rotate-90 transition-all', open && '-rotate-90 text-current')} />
      </div>
    </Popover>
  );
}

type MenuItem = ReturnType<typeof useNavMenus>[number]['children'][number];
function getPopoverContent(menu: MenuItem) {
  if (!menu.children) {
    return <MenuItem key={menu.url} menu={menu} />;
  } else {
    return <PopoverWithHover key={menu.url} menu={menu} />;
  }
}

function PopoverWithHover({ menu }: { menu: MenuItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      overlayClassName="z-50"
      trigger="hover"
      align="start"
      side="right"
      open={open}
      onOpenChange={setOpen}
      onCloseAutoFocus={(event) => event.preventDefault()}
      content={
        <Suspense
          fallback={
            <div className="w-72 h-20">
              <Loading />
            </div>
          }
        >
          {menu.children}
        </Suspense>
      }
    >
      <MenuItem className={open ? 'detrade-menu-hover' : undefined} menu={menu} />
    </Popover>
  );
}
