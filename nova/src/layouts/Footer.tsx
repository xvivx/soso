import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button, SvgIcon } from '@components';
import SvgFlame from '@components/SvgIcon/private/flame.svg';
import Logo from '@pages/components/Logo';

export const useLicenseText = () => {
  const { t } = useTranslation();

  return [
    t('Brokerage Products and Services offered by Nexus Play LLC.'),
    t(
      'Nexus Play LLC, a Brokerage Company authorised and regulated by the Mwali International Services Authority (M.I.S.A.) under the License #BFX2024137.'
    ),
    t(
      'Nexus Play LLC is a Brokerage that provides self-directed investors with brokerage services, and does not make recommendations or offer investment, financial, legal or tax advice. Online trading carries inherent risks, including fluctuations in system response and access times due to market conditions, system performance, and other factors. Before trading, consult an independent, licensed financial advisor and ensure you have the necessary risk appetite, experience, and knowledge. Under no circumstances shall Nexus Play LLC have any liability to any person or entity for any direct, indirect, special, consequential or incidental damages whatsoever. '
    ),
    t(
      'The products and services offered by Nexus Play LLC are not intended for residents of the United States, European Union, or any other jurisdictions where such services and products are prohibited by law. Nexus Play LLC does not solicit business or provide brokerage services to individuals or entities in these regions. It is the responsibility of potential clients to be aware of and comply with any applicable laws and regulations in their respective jurisdictions before engaging in online trading. By accessing this website and utilizing our services, you confirm that you are not a resident of the United States, European Union, or any other jurisdiction where our services are restricted.'
    ),
    t('All brokerage activity on this website is provided by Nexus Play LLC.'),
    t('Copyright © 2025 Nexus Play LLC. All rights reserved.'),
  ];
};

function useMenus() {
  const { t } = useTranslation();
  return useMemo(() => {
    return [
      {
        title: t('Trading center'),
        children: [
          {
            label: t('High Low'),
            path: '/trade-center',
          },
          {
            label: t('Spread'),
            path: '/trade-center/spread',
          },
          {
            label: t('1000x leverage'),
            path: '/trade-center/futures',
          },
          {
            label: t('Up Down'),
            path: '/trade-center/up-down',
          },
          {
            label: t('Tap Trading'),
            path: '/trade-center/tap-trading',
          },
        ],
      },
      {
        title: t('Profile'),
        children: [
          {
            label: t('Personal'),
            path: '/dashboard/personal',
          },
          {
            label: t('Assets'),
            path: '/dashboard/wallet',
          },
          {
            label: t('VIP'),
            path: '/dashboard/personal/vip',
          },
          {
            label: t('Settings'),
            path: '/dashboard/personal/preferences',
          },
        ],
      },
      {
        title: t('Overview'),
        children: [
          { label: t('Platform'), path: '/platform' },
          { label: t('Description'), path: '/product' },
          { label: t('Agreement'), path: '/protocol/agreement' },
          { label: t('AML & KYC policy'), path: '/protocol/kyc' },
          { label: t('Privacy policy'), path: '/protocol/privacy' },
        ],
      },
      {
        title: t('Service guide'),
        children: [
          { label: t('DeTrade overview'), path: '/service' },
          { label: t('Deposits and withdrawals'), path: '/dashboard/wallet' },
          {
            label: t('Partner program'),
            path: '/partner',
          },
          { label: t('License'), path: '/license' },
          { label: t('Connect'), path: '/contact/us' },
        ],
      },
    ];
  }, [t]);
}
export default function Footer(props: BaseProps) {
  const { className } = props;
  const { t } = useTranslation();
  const licenseWord = useLicenseText();

  return (
    <footer className={className}>
      <div className="mx-auto px-4 s768:px-6 pt-8 pb-6" style={{ maxWidth: 1200 }}>
        <Menus />
        <hr className="my-8 border-thirdly" />
        <div className="flex gap-8">
          <div className="flex flex-col gap-3">
            <Logo className="w-28 h-7 cursor-pointer" />
            <div className="text-12 font-400 text-secondary">{licenseWord.slice(0, 3).map((t) => t)}</div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <a href="https://mwaliregistrar.com/list_of_entities/verify/435" target="_blank" rel="noreferrer">
              <SvgFlame className="w-7 h-7" />
            </a>
            <div className="text-12 font-400 text-secondary">{licenseWord.slice(3, 5).map((t) => t)}</div>
          </div>
        </div>
        <hr className="my-8 border-thirdly" />
        <div className="text-12 font-600 text-secondary text-center">
          {t('Copyright © 2025 Nexus Play LLC. All rights reserved.')}
        </div>
      </div>
    </footer>
  );
}
const communities = [
  {
    icon: 'telegram' as const,
    url: 'https://t.me/+hxK5i-R_ksBjMjg1',
  },
  {
    icon: 'facebook' as const,
    url: 'https://www.facebook.com/profile.php?id=61578202508151',
  },
  {
    icon: 'twitter' as const,
    url: 'https://x.com/Detrade_en',
  },
  {
    icon: 'discord' as const,
    url: 'https://discord.com/invite/FRzx7gxv',
  },
  {
    icon: 'ins' as const,
    url: 'https://www.instagram.com/detrade_en/',
  },
];
function Menus() {
  const navigate = useNavigate();
  const menus = useMenus();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 s768:grid-cols-5 gap-8 font-600 text-14 leading-5">
      {/* 主菜单 */}
      {menus.map((menu, index) => {
        return (
          <div className="space-y-2.5" key={index}>
            <div className="mb-2.5">{menu.title}</div>
            {menu.children.map((child, index) => {
              return (
                <Button
                  onClick={() => {
                    navigate(child.path);
                  }}
                  key={index}
                  className="font-500 flex text-left w-fit text-secondary hover:text-brand whitespace-normal"
                  theme="transparent"
                  size="free"
                >
                  {child.label}
                </Button>
              );
            })}
          </div>
        );
      })}
      {/* 社区 */}
      <div>
        <div className="mb-4">{t('Join  our community')}</div>
        <div className="flex flex-wrap items-center gap-3 mb-6 max-w-48">
          {communities.map((community) => {
            return (
              <Button
                key={community.icon}
                theme="secondary"
                size="md"
                className="bg-layer8"
                icon={<SvgIcon name={community.icon} className="size-10 text-secondary" />}
                onClick={() => {
                  window.open(community.url, '_blank');
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
