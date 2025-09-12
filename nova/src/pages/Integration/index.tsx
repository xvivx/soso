/**
 * @file Integration Program Page
 * @description 集成项目页面，展示Detrade Connect的主要功能和特性，包含介绍、特性展示和行动号召等部分
 */

import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerService } from '@hooks/useIntercom';
import useNavigate from '@hooks/useNavigate';
import { Button, SvgIcon } from '@components';
import { Card } from '@pages/components';
import bannerImg from './assets/banner.png';
import capabilitiesIcon from './assets/capabilities.png';
import coverageIcon from './assets/coverage.png';
import usersIcon from './assets/users.png';

/**
 * @constant docUrl
 * @description 文档链接地址
 */
const docUrl =
  'https://currency-trade.s3.ap-east-1.amazonaws.com/document/Detrade+Integration+Technical+Documentation.pdf';

/**
 * @interface IFeatureCard
 * @description 特性卡片的属性接口定义
 */
interface IFeatureCard {
  /** 特性图标路径 */
  icon: string | React.ReactElement;
  /** 特性标题 */
  title: string;
  /** 特性描述列表 */
  description: string[];
}

/**
 * @component Header
 * @description 页面顶部横幅组件，展示欢迎信息和banner图片
 */
const Header = memo(() => {
  const { t } = useTranslation();
  return (
    <header className="items-center justify-between detrade-card s768:px-8 s768:pl-4 s768:pr-22 s768:flex referral-gradient">
      <article className="mb-6 text-left s768:text-center text-primary">
        <h1 className="mb-2 text-24 s768:text-28 font-600">{t('Welcome to Detrade Connect')}</h1>
        <p className="text-14 s768:text-16 font-500 text-secondary s768:max-w-[420px] s768:text-left">
          {t('Integrate Detrade Cryptocurrency derivatives on your platform')}
        </p>
      </article>
      <img src={bannerImg} alt="banner" className="w-40 mx-auto s768:mx-0" />
    </header>
  );
});

Header.displayName = 'Header';

/**
 * @component Introduction
 * @description 介绍部分组件，说明Detrade Connect的定义和主要功能
 */
const Introduction = memo(() => {
  const { t } = useTranslation();
  return (
    <Card className="s768:p-8 s768:pt-4" title={t('What is Detrade Connect?')}>
      <p className="text-12 text-secondary s768:text-14 font-500">
        {t(
          'Detrade Connect is a seamless integration solution that allows third-party platforms to easily connect to our ecosystem. Through powerful APIs and automation tools, we directly integrate the core functions of our products into your platform. It aims to provide platforms with diversified cryptocurrency derivatives, faster data exchange, and the ability to access our cutting-edge features, while ensuring secure, scalable, and reliable connections. Whether you want to expand service delivery or simplify workflows, Detrade Connect can make integration simple, efficient, and effective.'
        )}
      </p>
    </Card>
  );
});

Introduction.displayName = 'Introduction';

/**
 * @component FeatureCard
 * @description 特性卡片组件，展示单个特性的详细信息
 */
const FeatureCard = memo<IFeatureCard>(({ icon, title, description }) => {
  return (
    <div
      className="flex flex-col p-4 transition-all duration-300 rounded-3 bg-layer5
    /* 桌面端悬浮效果 */
    s768:hover:bg-layer4 s768:hover:shadow-lg s768:hover:shadow-layer4 
    s768:hover:-translate-y-2 s768:cursor-pointer
    /* 移动端点击效果 */
    active:bg-layer4 active:scale-95
    transform-gpu"
    >
      {/* <img src={icon} alt={title} className="s768:size-12 size-8" /> */}
      {typeof icon === 'string' ? <img src={icon} alt={title} className="s768:size-12 size-8" /> : icon}
      <h3 className="mt-3 mb-4 text-14 s768:text-16 font-700 text-primary">{title}</h3>
      <div className="space-y-3">
        {description.map((item, index) => (
          <p key={index} className="text-12 s768:text-14 text-secondary font-500">
            {`• ${item}`}
          </p>
        ))}
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

/**
 * @component Features
 * @description 特性展示组件，以网格形式展示所有产品特性
 */
const Features = memo(() => {
  const { t } = useTranslation();

  const featureList = useMemo(() => {
    return [
      {
        icon: coverageIcon,
        title: t('Extensive coverage'),
        description: [
          t('Providing users with diverse options for transactions'),
          t('Multiple crypto currency binary options derivatives'),
          t('50+ trading pairs'),
        ],
      },
      {
        icon: usersIcon,
        title: t('Loved by users'),
        description: [t('Simple, Fast, Intelligence'), t('Verifiable fairness')],
      },
      {
        icon: capabilitiesIcon,
        title: t('Product capabilities'),
        description: [
          t('Continuously updated'),
          t('Large product research & Development team'),
          t('Product iteration, new product development'),
        ],
      },
      {
        icon: <SvgIcon name="integration" className="size-8 s768:size-12 text-brand" />,
        title: t('Simple integration'),
        description: [t('Intelligent integrated services'), t('Rapid deployment'), t('7 * 24 technical services')],
      },
    ];
  }, [t]);

  return (
    <section>
      <Card className="s768:p-8 s768:pt-4" title={t('Why choose Detrade')}>
        <div className="grid gap-4 s768:grid-cols-2 s1366:grid-cols-4">
          {featureList.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </Card>
    </section>
  );
});

Features.displayName = 'Features';

/**
 * @interface ICallToAction
 * @description 行动号召部分的属性接口定义
 */
interface ICallToAction {
  /** 申请按钮点击处理函数 */
  onApply: () => void;
  /** 联系我们按钮点击处理函数 */
  onContact: () => void;
  /** 查看文档按钮点击处理函数 */
  onViewDoc: () => void;
}

/**
 * @component CallToAction
 * @description 行动号召组件，包含申请、联系和查看文档等操作按钮
 */
const CallToAction = memo<ICallToAction>(({ onApply, onContact, onViewDoc }) => {
  const { t } = useTranslation();
  return (
    <Card className="s768:p-8">
      <div className="s768:flex s768:justify-between s768:space-x-8">
        <div>
          <h2 className="s768:text-16 text-14 font-600 text-primary">{t('Ready to Get Started')}</h2>
          <p className="mt-4 s768:text-14 text-12 text-secondary font-500">
            {t(
              "Join Detrade Connect to accelerate your platform's operational growth, and we provide you with service guarantees."
            )}
          </p>
          <p className="mt-4 s768:text-14 text-12 text-secondary font-500">
            <span>{t('Click Here To View The')}</span>
            <button className="ml-1 cursor-pointer text-brand" onClick={onViewDoc}>
              {t('Developer documentation')}
            </button>
          </p>
        </div>
        <div className="flex justify-between mt-8 space-x-4 s768:mt-0 s768:items-center">
          <Button size="lg" onClick={onApply} className="flex-1">
            {t('Apply')}
          </Button>
          <Button size="lg" onClick={onContact} className="flex-1">
            {t('Contact us')}
          </Button>
        </div>
      </div>
    </Card>
  );
});

CallToAction.displayName = 'CallToAction';

/**
 * @component IntegrationProgram
 * @description 集成项目页面主组件，整合所有子组件并处理交互逻辑
 */
export default function IntegrationProgram() {
  const navigate = useNavigate();
  const { open } = useCustomerService();

  /**
   * @description 处理申请按钮点击事件，跳转到申请页面
   */
  const handleApply = useCallback(() => {
    navigate('/dashboard/integration/apply');
  }, [navigate]);

  /**
   * @description 处理联系我们按钮点击事件
   */
  const handleContact = useCallback(async () => {
    await open();
    // 处理联系我们逻辑
  }, [open]);

  /**
   * @description 处理查看文档按钮点击事件，支持打开外部链接或下载PDF文档
   * @param {string} docUrl - 文档链接地址
   */
  const handleViewDoc = useCallback(() => {
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="space-y-3">
      <Header />
      <Introduction />
      <Features />
      <CallToAction onApply={handleApply} onContact={handleContact} onViewDoc={handleViewDoc} />
    </div>
  );
}

IntegrationProgram.displayName = 'IntegrationProgram';
