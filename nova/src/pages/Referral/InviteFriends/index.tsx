import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, message, SvgIcon } from '@components';
import { AffiliateCard, Card, StepGuide } from '@pages/components';
import i18n from '@/i18n';
import bannerImg from '../imgs/banner.png';
import step1Icon from '../imgs/step1.png';
import step2Icon from '../imgs/step2.png';
import step3Icon from '../imgs/step3.png';
import telegramIcon from '../imgs/telegram.png';
import xIcon from '../imgs/x.png';
import PreviewPoster from './PreviewModal';
import { ISocialPlatform, useShare } from './useShare';

/**
 * @interface IRuleItem
 * @description 规则项属性接口
 */
interface IRuleItem {
  question: string;
  answer: string;
}

/**
 * @constant SOCIAL_ICONS
 * @description 社交媒体图标配置
 */
const SOCIAL_ICONS = [
  {
    type: 'twitter' as ISocialPlatform,
    icon: xIcon,
    alt: 'X',
  },
  {
    type: 'telegram' as ISocialPlatform,
    icon: telegramIcon,
    alt: 'Telegram',
  },
] as const;

/**
 * @component RuleItem
 * @description 规则项组件
 */
const RuleItem = memo(({ question, answer }: IRuleItem) => {
  return (
    <article className="first:mt-0">
      <div className="flex items-start gap-2">
        <SvgIcon name="help" className="flex-shrink-0 mt-1 size-5" />
        <div className="flex flex-col">
          <h3 className="text-16 text-primary">{question}</h3>
          <p className="text-14 text-secondary">{answer}</p>
        </div>
      </div>
    </article>
  );
});

RuleItem.displayName = 'RuleItem';

/**
 * @component LastRuleItem
 * @description 最后一个规则项组件
 */
const LastRuleItem = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const myRewardLink = '/dashboard/referral/my-reward';
  const toMyReward = () => {
    navigate(myRewardLink);
  };
  return (
    <article className="mt-6 first:mt-0">
      <div className="flex items-start gap-2">
        <SvgIcon name="help" className="flex-shrink-0 mt-1 size-5" />
        <div className="flex flex-col">
          <h3 className="text-16 text-primary">{t('Can I See The Data Of My Referral?')}</h3>
          <p className="text-14 text-secondary">
            {t(
              'Yes, DeTrade Believes In Total Transparency And Offers All Data To You. You Can See All Of This Information In'
            )}
            <span onClick={toMyReward} className="ml-1 cursor-pointer text-brand">
              {t('My reward')}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
});

LastRuleItem.displayName = 'LastRuleItem';

/**
 * @component ReferralLinkSection
 * @description 推荐链接区域组件
 */
const ReferralLinkSection = memo(
  ({ label, value, onCopy }: { label: string; value: string; onCopy: (text: string) => void }) => (
    <section className="flex flex-col s768:grid s768:grid-cols-[1fr,auto] gap-3 s768:gap-4">
      <div className="space-y-2">
        <label className="text-14 text-secondary">{label}</label>
        <div className="flex items-center px-3 py-1 break-all select-all font-600 min-h-12 bg-layer8 rounded-2 text-14 normal-case">
          {value}
        </div>
      </div>
      <div className="mt-4 s768:self-end s768:mt-0">
        <Button size="lg" className="w-full s768:w-auto" onClick={() => onCopy(value)}>
          {i18n.t('Copy')}
        </Button>
      </div>
    </section>
  )
);

ReferralLinkSection.displayName = 'ReferralLinkSection';

/**
 * @component ShareSection
 * @description 分享区域组件，使用统一的响应式布局
 */
const ShareSection = memo(
  ({
    referralLink,
    shareToSocial,
  }: {
    referralLink: string;
    shareToSocial: (platform: ISocialPlatform, link: string) => void;
  }) => (
    <section className="flex flex-col s768:grid s768:grid-cols-[1fr,auto] gap-3 s768:gap-4">
      {/* Share to 部分 */}
      <div className="space-y-2">
        <label className="text-14 text-secondary">{i18n.t('Share to')}</label>
        <div className="flex items-center gap-6 px-3 py-1 min-h-12 bg-layer8 rounded-2">
          {SOCIAL_ICONS.map(({ type, icon, alt }) => (
            <img
              key={type}
              onClick={() => shareToSocial(type, referralLink)}
              src={icon}
              alt={alt}
              className="rounded-full cursor-pointer size-6"
            />
          ))}
        </div>
      </div>

      {/* Preview 按钮 */}
      <div className="mt-4 s768:self-end s768:mt-0">
        <Button size="lg" className="w-full s768:w-auto" onClick={() => PreviewPoster.openPreviewModal(referralLink)}>
          {i18n.t('Preview')}
        </Button>
      </div>
    </section>
  )
);

ShareSection.displayName = 'ShareSection';

/**
 * @component InviteFriends
 * @description 邀请好友页面主组件
 */
export default function InviteFriends() {
  const { t } = useTranslation();
  const { shareToSocial } = useShare();
  const { inviteCode } = useUserInfo().data;

  const referralLink = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/account/register?r=${inviteCode}`;
  }, [inviteCode]);

  const handleCopy = useCallback(
    (text: string) => {
      copy(text);
      message.success(t('Copy Success'));
    },
    [t]
  );

  // 步骤配置
  const steps = useMemo(() => {
    return [
      {
        icon: step1Icon,
        title: t('Share your referral link or code'),
        desc: t('You can share your invite link to your friend or your social media'),
      },
      {
        icon: step2Icon,
        title: t('Connect with your friends'),
        desc: t('Your friends will be associated with you after they sign up'),
      },
      {
        icon: step3Icon,
        title: t('Receive commission rewards'),
        desc: t('Get Trading commission when your friends trading.'),
      },
    ];
  }, [t]);

  // 规则配置
  const rules = useMemo(() => {
    return [
      {
        question: t('How much can I earn from my referral?'),
        answer: t(
          'You will receive 20% of the house edge of for each trading they place. if you have a many followers, you can contact us for more commission.'
        ),
      },
      {
        question: t('Is there a limit to the invitation rewards I can receive?'),
        answer: t(
          'There is no limit to how much you can earn. The more friends you invite, The more rewards you will receive.'
        ),
      },
      {
        question: t('Is there a limit to how long I can earn commissions through the referral program?'),
        answer: t(
          'As long as the program remains active, you can earn commissions from the moment your referee registers for a Detrade account.'
        ),
      },
      {
        question: t('When will the commission be distributed?'),
        answer: t("When your friend's trading ends, you can receive an immediate commission for that trading."),
      },
    ];
  }, [t]);

  return (
    <div className="flex flex-col gap-3">
      {/* Banner */}
      <section className="relative flex items-center justify-between px-4 rounded-3 referral-gradient s768:px-11 h-22">
        <h1 className=" text-14 text-primary s768:text-16 font-800">
          {t('Simple way to earn money, The more invite, the more you will get!')}
        </h1>
        <img src={bannerImg} alt="banner" className="hidden object-cover max-h-full s768:block" />
      </section>

      {/* Referral Info */}
      <Card className="s768:p-8 s768:pt-4" title={t('Invite friends to earn  20% commission')}>
        <div className="space-y-4">
          <ReferralLinkSection label={t('My referral link')} value={referralLink} onCopy={handleCopy} />
          <ReferralLinkSection label={t('My referral code')} value={inviteCode} onCopy={handleCopy} />
          <ShareSection referralLink={referralLink} shareToSocial={shareToSocial} />
        </div>
      </Card>

      {/* Invite Steps */}
      <Card className="s768:p-8 s768:pt-4" title={t('How to invite')}>
        <StepGuide steps={steps} />
      </Card>

      {/* Referral Rules */}
      <Card className="s768:p-8 s768:pt-4" title={t('Referral rules')}>
        <div className="space-y-6">
          {rules.map((rule, index) => (
            <RuleItem key={index} {...rule} />
          ))}
        </div>
        <LastRuleItem />
      </Card>

      {/* Affiliate Program */}
      <Card className="s768:p-8 s768:pt-4" title={t('Affiliate program')}>
        <AffiliateCard />
      </Card>
    </div>
  );
}

InviteFriends.displayName = 'InviteFriends';
