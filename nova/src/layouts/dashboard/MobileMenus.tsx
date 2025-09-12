import { cloneElement, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { logout, useUserInfo } from '@store/user';
import { useCustomerService } from '@hooks/useIntercom';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, SvgIcon } from '@components';
import { cn } from '@utils';
import CopyButton from '@pages/components/CopyButton';
import useMenus, { type Menu } from './useNavMenus';

function Menus() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [trade] = useMenus();
  const { isTemporary, avatar, id, nickName } = useUserInfo().data;
  const { open } = useCustomerService();

  const menus = useMemo<Menu[]>(
    () => [
      {
        title: t('Assets'),
        key: 'assets',
        auth: true,
        children: [
          {
            title: t('deposit'),
            key: 'deposit',
            url: '#/wallet/deposit',
            icon: <SvgIcon name="deposit" />,
          },
          {
            title: t('withdraw'),
            key: 'withdraw',
            url: '/dashboard/wallet/withdraw',
            icon: <SvgIcon name="homeWithdraw" />,
          },
          {
            title: t('Transactions'),
            key: 'transactions',
            url: '/dashboard/wallet/transactions',
            icon: <SvgIcon name="trade" className="rotate-[135deg]" />,
          },
          {
            title: t('Trade history'),
            key: 'trade-history',
            url: '/dashboard/wallet/trade-history',
            icon: <SvgIcon name="transaction" />,
          },
        ],
      },
      trade,
      {
        title: t('Rewords'),
        key: 'rewords',
        children: [
          {
            title: t('VIP'),
            key: 'vip',
            icon: <SvgIcon name="vip" />,
            url: '/dashboard/personal/vip',
          },
          {
            title: t('Leaderboard'),
            key: 'leaderboard',
            icon: <SvgIcon name="leaderboard" />,
            url: '/dashboard/leaderboard',
          },
          {
            title: t('Rewards hub'),
            key: 'reward-hub',
            icon: <SvgIcon name="rewardHub" />,
            url: '/dashboard/campaign/reward-center',
          },
          {
            title: t('Referral'),
            key: 'referral',
            url: '/dashboard/referral',
            icon: <SvgIcon name="referral" />,
            auth: true,
          },
          {
            title: t('Affiliates'),
            key: 'affiliates',
            icon: <SvgIcon name="affiliates" />,
            url: '/dashboard/partnership-program',
          },
          {
            title: t('Integration'),
            key: 'integration',
            url: '/dashboard/integration',
            icon: <SvgIcon name="integration" />,
          },
        ],
      },
      {
        title: t('More'),
        key: 'more',
        children: [
          {
            title: t('Announcement'),
            key: 'announcement',
            icon: <SvgIcon name="announcement" />,
            url: '',
          },
          {
            title: t('Learn'),
            key: 'learn',
            icon: <SvgIcon name="detradeLearn" />,
            url: '',
          },
          {
            title: t('Community'),
            key: 'community',
            icon: <SvgIcon name="community" />,
            url: '',
          },
          {
            title: t('Get help'),
            key: 'get-help',
            icon: <SvgIcon name="intercom" />,
            url: '',
            onClick: open,
          },
        ],
      },
    ],
    [t, trade, open]
  );

  return (
    <div className="flex flex-col gap-8 justify-between py-4" style={{ minHeight: 'calc(var(--view-h) - 80px)' }}>
      <div>
        {!isTemporary && (
          <div className="flex items-center gap-3 mb-8 -mx-4 px-4 pb-8 border-b border-thirdly">
            <Image className="size-9 rounded-3" src={avatar} />
            <div className="flex-1">
              <div className="text-14 font-600 leading-none mb-1">{nickName}</div>
              <div className="flex-1 flex items-center gap-1 text-12 leading-none">
                <div className="text-secondary">{t('UID')}</div>
                <div>{id}</div>
                <CopyButton size="free" className="size-4" value={id} theme="transparent" />
              </div>
            </div>

            <Button
              theme="transparent"
              icon={<SvgIcon name="arrow" />}
              onClick={() => {
                navigate('/dashboard/personal', { replace: true, action: 'FORCE-POP' });
              }}
            />
          </div>
        )}

        <nav className="space-y-8">
          {menus.map((group, key) => {
            return (
              <div key={key}>
                <div className="text-14 font-600 mb-4">{group.title}</div>
                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {group.children.map((menu, key) => {
                    return (
                      <Button
                        key={key}
                        className="flex flex-col items-center gap-2 w-20"
                        theme="transparent"
                        size="free"
                        onClick={() => {
                          if ((menu.auth || group.auth) && isTemporary) {
                            return navigate('/account/login', { from: menu.url });
                          } else if (menu.onClick) {
                            return menu.onClick();
                          } else {
                            const isHomeTab = menu.url.startsWith('/dashboard/campaign');
                            return navigate(menu.url, {
                              replace: isHomeTab,
                              action: isHomeTab ? 'FORCE-POP' : undefined,
                            });
                          }
                        }}
                      >
                        {cloneElement(menu.icon, { className: cn(menu.icon.props.className, 'size-6') })}
                        <div className="text-11 font-500 truncate">{menu.title}</div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {!isTemporary && (
        <Button className="flex min-w-36 mx-auto bg-layer7" theme="secondary" size="md" onClick={logout}>
          {t('Log out')}
        </Button>
      )}
    </div>
  );
}

export default memo(Menus);
