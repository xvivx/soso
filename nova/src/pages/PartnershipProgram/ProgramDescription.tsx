import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 合作伙伴计划内容接口
 */
interface IProgramSection {
  title?: string;
  content: string[];
  type?: 'normal' | 'bullet';
}

/**
 * 合作伙伴等级接口
 */
interface IPartnerTier {
  title: string;
  requirements: string[];
  benefits: string[];
}

/**
 * 合作伙伴计划详细说明组件
 * @returns JSX.Element
 */
const ProgramDescription = () => {
  const { t } = useTranslation();
  /**
   * 计划内容数据
   */
  const programSections: IProgramSection[] = [
    {
      content: [
        t(
          'Detrade Partner Program ! This program is designed to provide creators with enhanced revenue potential and exclusive benefits, making your promotional efforts truly rewarding.'
        ),
        t('Our plan aims to provide incentives to those who achieve outstanding results.'),
        t(
          'Through the Detrade partnership program, you can unlock increased affiliate commissions, exclusive sponsored events, and other unique benefits. Want to learn more? Keep reading!'
        ),
      ],
    },
    {
      title: t('Why Partner with Detrade?'),
      content: [
        t(
          'Detrade is on a fast growth track. We are committed to providing our users with an innovative and engaging experience that makes it the platform of choice for cryptocurrency binary option trading.'
        ),
      ],
    },
    {
      title: t('This is why you should promote Detrade:'),
      content: [
        t(
          'Unique experiences : From innovative trading challenges to streamlined crypto trading options and exclusive trading models, Detred offers an experience you won t find anywhere else.'
        ),
        t(
          "Member-friendly system : Many of our current members have successfully built sustainable passive income through our program. Now it's your turn."
        ),
      ],
      type: 'bullet',
    },
    {
      content: [
        t(
          'With exciting new features and updates on the horizon, now is the perfect time to start promoting Detlard .'
        ),
        t(
          'Our partner program reflects our commitment to creating win-win cooperation and is tailored for affiliates of all sizes. Join us on our journey of mutual growth!'
        ),
      ],
    },
  ];

  /**
   * 合作伙伴等级数据
   */
  const partnerTiers: IPartnerTier[] = [
    {
      title: t('Promising Affiliate'),
      requirements: [
        t('Requirements: 50 unique, actively-engaged signups with at least $100,000 trading volume by referrals.'),
      ],
      benefits: [t('Benefits:'), t('20% affiliate commission (a 100% increase from our base rate).')],
    },
    {
      title: t('Esteemed Affiliate'),
      requirements: [
        t('Requirements: 100 unique, actively-engaged signups with at least $1,000,000 trading volume by referrals.'),
      ],
      benefits: [
        t('Benefits:'),
        t('Customized incentives tailored to your needs.'),
        t('Perks include higher commission rates, sponsored Detrade campaigns, and more!'),
      ],
    },
  ];

  /**
   * 申请步骤数据
   */
  const applySteps: string[] = [
    t('Want to join the Detrade partnership program? Contact our support team to get started!'),
    t(
      'Any questions? Our dedicated support team is ready to assist you and guide you through the application process.'
    ),
    t(
      "We look forward to seeing you become a member of our growing alliance family and help us shape Detrade's future together!"
    ),
  ];

  /**
   * 渲染内容部分
   * @param section - 内容区块
   * @param index - 区块索引
   */
  const renderContent = (section: IProgramSection, index: number) => {
    return (
      <div className="space-y-2">
        {section.title && (
          <h3
            className={`font-bold ${
              // 使用索引 2 来标识需要添加间距的部分（对应第三个区块）
              index === 2 ? 'mt-2' : ''
            }`}
          >
            {section.title}
          </h3>
        )}
        {section.type === 'bullet' ? (
          <ul className="space-y-2">
            {section.content.map((text, i) => (
              <li key={i}>• {text}</li>
            ))}
          </ul>
        ) : (
          section.content.map((text, i) => <p key={i}>{text}</p>)
        )}
      </div>
    );
  };

  return (
    <div className="text-14 text-secondary">
      {/* 介绍部分 */}
      {programSections.map((section, index) => (
        <div key={index} className={index === 1 ? 'mt-6' : ''}>
          {renderContent(section, index)}
        </div>
      ))}

      {/* Partnership Tiers 部分 */}
      <div className="mt-6">
        <h3 className="mb-2 font-bold text-primary">{t('Partnership Tiers')}</h3>
        <div className="space-y-4">
          {partnerTiers.map((tier, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-bold">{tier.title}</h4>
              <ul className="space-y-2">
                {/* 渲染要求列表 */}
                {tier.requirements.map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
                {/* 先渲染 Benefits 标题 */}
                <div className="mt-2 font-bold">• {t('Benefits')}:</div>
                {/* 跳过第一项（Benefits:），只渲染实际的福利内容 */}
                {tier.benefits.slice(1).map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* How To Apply 部分 */}
      <div className="mt-6">
        {/* 添加 mt-6 (24px) */}
        <h3 className="font-bold">{t('How to apply')}</h3>
        {applySteps.map((step, index) => (
          <p key={index}>{step}</p>
        ))}
      </div>
    </div>
  );
};

ProgramDescription.displayName = 'ProgramDescription';

export default memo(ProgramDescription);
