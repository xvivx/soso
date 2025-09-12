import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import copy from 'copy-to-clipboard';
import { setMute, setTheme, useMuted, useTheme } from '@store/system';
import { logout, useUserInfo } from '@store/user';
import { Button, Image, message, Popover, SvgIcon, Switch } from '@components';
import { Sound, SoundType } from '@utils/sound';
import MenuItem from './MenuItem';

export default function Menu() {
  const { t } = useTranslation();
  const { avatar, nickName, id } = useUserInfo().data;

  const muted = useMuted();
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => Sound.destroy();
  }, []);
  const menus = useMemo(() => {
    return [
      {
        title: t('Profile'),
        key: 'profile',
        icon: <SvgIcon name="profile" />,
        url: '/dashboard/personal',
      },
      {
        title: t('Security'),
        key: 'security',
        icon: <SvgIcon name="security" />,
        url: '/dashboard/personal/security',
      },
      {
        title: t('Verification'),
        key: 'verification',
        icon: <SvgIcon name="verification" />,
        url: '',
      },
      {
        title: t('Preferences'),
        key: 'preferences',
        icon: <SvgIcon name="settingCenter" />,
        url: '/dashboard/personal/preferences',
      },
      {
        title: t('Deposit'),
        key: 'deposit',
        icon: <SvgIcon name="deposit" />,
        url: '/dashboard/wallet/deposit',
      },
      {
        title: t('Withdraw'),
        key: 'withdraw',
        icon: <SvgIcon name="homeWithdraw" />,
        url: '/dashboard/wallet/withdraw',
      },
      {
        title: t('Transactions'),
        key: 'transactions',
        icon: <SvgIcon name="trade" className="rotate-[135deg]" />,
        url: '/dashboard/wallet/transactions',
      },
      {
        title: t('Trade history'),
        key: 'trade-history',
        icon: <SvgIcon name="transaction" />,
        url: '/dashboard/wallet/trade-history',
      },
      {
        title: (
          <div className="flex items-center justify-between">
            <div>{t('Dark')}</div>
            <Switch checked={theme === 'darken'} />
          </div>
        ),
        onClick: () => {
          dispatch(setTheme(theme === 'darken' ? 'lighten' : 'darken'));
        },
        key: 'theme',
        icon: <SvgIcon name="theme" />,
        url: '',
      },
      {
        title: (
          <div className="flex items-center justify-between">
            <div>{t('Sound')}</div>
            <Switch checked={!muted} />
          </div>
        ),
        key: 'sound',
        icon: <SvgIcon name="sound" />,
        onClick: () => {
          dispatch(setMute(!muted));
          if (muted) {
            Sound.getInstance();
            Sound.play(SoundType.CLICK);
          } else {
            Sound.destroy();
          }
        },
        url: '',
      },
      {
        title: t('Log out'),
        key: 'logout',
        icon: <SvgIcon name="logout" />,
        url: '',
        onClick: logout,
      },
    ];
  }, [t, muted, dispatch, theme]);

  function onCopyName() {
    if (id) {
      copy(id);
      message.success(t('Copy Success'));
    }
  }

  const AvatarNode = (
    <Button
      className="overflow-hidden size-9 s1024:size-10"
      theme="transparent"
      size="free"
      icon={avatar ? <Image className="size-full" src={avatar} /> : <SvgIcon name="profile" />}
    />
  );
  return (
    <Popover
      trigger="hover"
      overlayClassName="max-h-none z-50 p-4"
      content={
        <div className="w-full text-primary">
          <div className="flex items-center gap-3">
            {AvatarNode}
            <div className="flex-1 truncate">
              <div className="truncate text-14 text-primary">{nickName}</div>
              <div onClick={onCopyName} className="cursor-pointer text-12">
                UID: {id}
              </div>
            </div>
          </div>
          <hr className="my-2 border-thirdly" />
          <div className="space-y-1">
            {menus.map((menu, index) => {
              return <MenuItem key={menu.url || index} menu={menu} />;
            })}
          </div>
        </div>
      }
    >
      {AvatarNode}
    </Popover>
  );
}
