import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Accordion, AmountInput, AnimateNumber, Button, Image, Tabs } from '@components';
import CalculatorBackground from '@components/SvgIcon/private/home-section2-bg.svg';
import { cn } from '@utils';
import BestFormPicture from '@pages/Landing/img/landing-footer.png';
import bannerImage from '@pages/Landing/img/section4-mobile.png';
import BestFormBg from './assets/bg-blur.png';
import FaqBg from './assets/faq.jpg';
import PartnerIcon1 from './assets/partner-icon1.png';
import PartnerIcon2 from './assets/partner-icon2.png';
import PartnerIcon3 from './assets/partner-icon3.png';
import SecurityBg from './assets/security.jpg';
import * as Icons from './Icons';

export default function Partner() {
  return (
    <div className="overflow-x-hidden">
      <Banner />

      <ProfitCalculator />

      <Advantage />

      <BestFor />

      <PartnerProgram />

      <Security />

      <FAQ />
    </div>
  );
}

function Banner() {
  const { t } = useTranslation();
  return (
    <div className="bg-primary">
      <Container className="items-center px-4 py-8 mx-auto overflow-hidden text-center s1024:flex gap-25 s1024:px-24 s768:py-15 s1024:py-20 s1920:py-36 s1024:text-left">
        <div className="flex-1 s1366:flex-initial s1366:w-[532px] s1920:w-[732px]">
          <h1 className="mb-8 s0124:mb-11 text-32 s768:text-36 s1366:text-[50px] s1920:text-[54px] font-700 leading-tight">
            {t('Detrade Partner')}
            <br />
            {t('Program — Work with a trustworthy online trading provider.')}
          </h1>
          <div className="max-w-full s1024:w-[473px] mb-8 s1024:mb-12 text-12 font-400">
            {t(
              `We offer the widest range of derivatives trading options, attracting over 2.5 million online traders worldwide. Our technology delivers an intuitive and powerful trading experience, allowing our clients to more effectively understand risk and make informed trading decisions.`
            )}
          </div>

          <Link to="/partner/contact/us">
            <Button size="lg" className="mb-6 rounded-full s1024:mb-0">
              {t('Launch now')}
            </Button>
          </Link>
        </div>
        <div className="flex-1">
          <img className="flex-1 object-fill" src={bannerImage} alt="banner" />
        </div>
      </Container>
    </div>
  );
}

function ProfitCalculator() {
  const { t } = useTranslation();
  const [level, setLevel] = useState(0);
  const [activePlayers, setActivePlayers] = useState('100');
  const daily = useMemo(() => {
    const count = Number(activePlayers);
    switch (level) {
      case 0: {
        return 80 * count * 0.5;
      }
      case 1: {
        return 80 * count * 0.6;
      }
      case 2: {
        return 80 * count * 0.7;
      }
      default: {
        return 0 as never;
      }
    }
  }, [level, activePlayers]);

  return (
    <div className="relative px-4 bg-secondary pt-15 s1366:pt-20 mb-15 s1366:mb-30" id="/partner/calculator">
      <div className="absolute z-0 top-50 s1366:top-64 -left-60 -right-60">
        <CalculatorBackground className="object-cover w-full" />
      </div>

      <h2 className="text-center mb-15 s1366:mb-24 text-32 s1366:text-44 font-700">{t('Profit Calculator')}</h2>

      <div className="relative z-10 flex flex-col gap-5 s1366:flex-row s1366:items-center s1366:justify-center s1366:gap-50 s1920:gap-72">
        <div className="order-2 gap-10 s768:flex s1366:block">
          <div className="flex-1 mb-7 s768:mb-0 s1366:mb-9">
            <label className="block mb-2.5 text-16 s1366:text-20 font-500" htmlFor="Profit Calculator">
              {t('Enter number of daily active players')}
            </label>
            <AmountInput
              className="flex w-full h-15 s1366:w-100 px-5 bg-[#1C242E] rounded-full"
              id="Profit Calculator"
              value={activePlayers}
              onChange={(value) => {
                const count = value.replace(/\..*/g, '');
                if (count === '') {
                  setActivePlayers('');
                } else {
                  setActivePlayers(Math.min(Number(count), 500000).toString());
                }
              }}
            />
          </div>

          <div className="flex-1">
            <div className="mb-2.5 text-16 s1366:text-20 font-500">
              {t('Select your partner program revenue share')}
            </div>
            <Tabs selectedIndex={level} onChange={setLevel}>
              <Tabs.Header className="w-full rounded-full s1366:w-min text-16 s1366:text-20">
                <Tabs.Item className="flex-1 py-1 text-center px-7" selectedClassName="rounded-full">
                  <div>50%</div>
                  <div className="text-12 s1366:text-14">{t('Gold')}</div>
                </Tabs.Item>
                <Tabs.Item className="flex-1 py-1 text-center px-7" selectedClassName="rounded-full">
                  <div>60%</div>
                  <div className="text-12 s1366:text-14">{t('Diamond')}</div>
                </Tabs.Item>
                <Tabs.Item className="flex-1 py-1 text-center px-7" selectedClassName="rounded-full">
                  <div>70%</div>
                  <div className="text-12 s1366:text-14">{t('Platinum')}</div>
                </Tabs.Item>
              </Tabs.Header>
            </Tabs>
          </div>
        </div>

        <div className="order-1 s1366:order-3 text-30 s1024:text-[48px] s1366:text-[60px]">
          <div className="flex items-center gap-10 pb-5 mb-4 border-b s1366:gap-4 s1366:pb-0 border-white/20">
            <div className="flex items-center flex-1 w-80 s1366:w-100 s1366:flex-none">
              $
              <AnimateNumber value={daily} immediate={false} precision={0} />
            </div>
            <div className="flex-1 text-12 s1366:text-16 text-[#E5E5E5]">
              {t('Your')} <br /> {t('Daily Earning')}
            </div>
          </div>

          <div className="flex items-center gap-10 pb-5 border-b s1366:gap-4 s1366:pb-0 border-white/20">
            <div className="flex items-center flex-1 w-80 s1366:w-100 s1366:flex-none">
              $
              <AnimateNumber value={daily * 30} immediate={false} precision={0} />
            </div>
            <div className="flex-1 text-12 s1366:text-16 text-[#E5E5E5]">
              {t('Your')} <br /> {t('Monthly Earnings')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Advantage() {
  const { t } = useTranslation();
  const items = useMemo(() => {
    return [
      {
        icon: <Icons.Partnership />,
        title: t('Partnership With A Trusted Pioneer'),
        desc: t('Benefit from our many years of experience and internationally renowned reputation.'),
      },
      {
        icon: <Icons.Support />,
        title: t('Expert Support'),
        desc: t(
          'Experienced product and technical experts provide you with professional support and will continue to optimize product functions free of charge to provide you with better products.'
        ),
      },
      {
        icon: <Icons.Wallet />,
        title: t('No Hidden Fees'),
        desc: t('The cooperation method is open and transparent, and there is no need to worry about any hidden fees.'),
      },
      {
        icon: <Icons.Chart />,
        title: t('API'),
        desc: t(
          `Leverage Detrade's technology to launch your own trading app. Deliver an enhanced trading experience to your clients and earn from every trade executed on your app.`
        ),
      },
    ];
  }, [t]);

  return (
    <div className="px-4 mb-20 bg-secondary" id="/partner/advantage">
      <h2 className="relative z-10 text-center mb-15 s1366:mb-21 text-32 s1366:text-44 font-700">
        {t('Our Advantage')}
      </h2>

      <Container className="grid grid-cols-1 gap-6 mx-auto s1024:grid-cols-2 s1366:grid-cols-4 s1024:px-10">
        {items.map((it, index) => {
          return (
            <div className="relative z-10 col-span-1 py-5 px-6 bg-[#1C242E] rounded-4" key={index}>
              <div className="flex-center mb-2.5">{it.icon}</div>
              <h3 className="mb-5 text-center text-20 font-500">{it.title}</h3>
              <div className="text-14 font-400 text-secondary">{it.desc}</div>
            </div>
          );
        })}
      </Container>
    </div>
  );
}

function BestFor() {
  const { t } = useTranslation();
  const words = useMemo(() => {
    return [
      'Affiliate Firms',
      'Media Buyers',
      'Influencers',
      'Media',
      'Exchanges',
      'Igaming Operators',
      'FX Operators',
    ];
  }, []);

  return (
    <div className="bg-secondary pb-15 s1366:pb-36">
      <h2 className="relative z-10 text-center mb-15 s1366:mb-21 text-32 s1366:text-44 font-700">{t('Best For')}</h2>

      <Container className="justify-center gap-10 mx-4 s1366:flex s1366:mx-auto s1366:bg-transparent">
        <div className="relative s1366:w-[818px] pb-8 mb-5 s768:pb-0 s1366:mb-0 bg-[#1C242E] rounded-6 overflow-hidden">
          <div className="relative h-64 pt-5 overflow-hidden s1366:h-96 px-18 s768:px-9 s1366:px-10 s1366:pt-11 mb-7 s768:mb-0 rounded-6">
            <img className="absolute w-100 bottom-0 right-0 s1366:w-[572px] max-w-none" src={BestFormBg} alt="bg" />
            <img className="float-right w-full s1366:w-72 s768:hidden s1366:block" src={BestFormPicture} alt="banner" />
          </div>

          <div className="s768:absolute top-10 left-10 s1366:px-7">
            <h2 className="text-38 mb-2.5 s1366:text-[58px] font-500 whitespace-nowrap text-[#E5E5E5]">
              {t('Traffic Owners')}
            </h2>
            <div className="text-12 font-400 mb-7 s1366:text-16">
              {t('If you have the traffic, it can be monetized.')}
            </div>
            <div className="flex flex-wrap gap-2.5 s1366:w-100">
              {words.map((it, index) => (
                <div className="px-2.5 py-2 s1366:bg-white/10 rounded font-500 text-10 s1366:text-14" key={index}>
                  {it}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative s1366:w-[472px] px-6 s1366:px-9 py-10 bg-[#1C242E] rounded-6 overflow-hidden">
          <img className="absolute w-100 bottom-0 right-0 s1366:w-[572px] max-w-none" src={BestFormBg} alt="bg" />

          <Icons.ChartBlue />

          <h2 className="mt-16 s1366:mt-22 mb-2.5 text-38 text-[#E5E5E5]">{t('Entrepreneurs')}</h2>
          <div>
            {t('If you want to focus on sales and earnings rather than product management or technology development.')}
          </div>
        </div>
      </Container>
    </div>
  );
}

function PartnerProgram() {
  const { t } = useTranslation();
  const items = useMemo(() => {
    return [
      {
        title: t('Gold Partner'),
        revenue: '50%',
        fee: '$10,000',
        icon: PartnerIcon1,
        styles: 'text-[#FFE442] bg-[#FFE442]/10',
      },
      {
        title: t('Diamond Partner'),
        revenue: '60%',
        fee: '$25,000',
        icon: PartnerIcon2,
        styles: 'text-[#3B8AFF] bg-[#3B8AFF1A]/10',
      },
      {
        title: t('Platinum Partner'),
        revenue: '70%',
        fee: '$50,000',
        icon: PartnerIcon3,
        styles: 'text-secondary bg-white/10',
      },
      {
        title: t('Enterprise Partner'),
        revenue: '',
        fee: '',
        icon: '',
        styles: 'text-white bg-brand',
      },
    ];
  }, [t]);
  return (
    <div id="/partner/program" className="pt-12 pb-8 s1024:pb-20 bg-primary">
      <div className="flex-center mb-2.5">
        <div className="px-4 py-2.5 rounded text-14 font-500 bg-[#1C242E]">{t('Own your branded platform')}</div>
      </div>

      <h2 className="relative z-10 text-center mb-15 s1366:mb-21 text-32 s1366:text-44 font-700">
        {t('Partner Program')}
      </h2>

      <div className="max-w-[1140px] mx-auto grid grid-cols-1 s768:grid-cols-2 s1366:grid-cols-4 gap-5 px-6 mb-8 s1366:mb-18">
        {items.map((it, index) => {
          return (
            <div
              className={cn(
                'col-span-1 bg-[#0D1116] rounded-2 p-5 flex flex-col items-center',
                !it.revenue && 'h-60 s768:h-auto'
              )}
              key={index}
            >
              <div className={cn(it.styles, 'px-3 py-2 mb-7 text-14 rounded font-500')}>{it.title}</div>
              {it.revenue ? (
                <>
                  <img className="mb-10 w-15" src={it.icon} alt=" " />
                  <div className="text-38 s1366:text-[40px] font-700">{it.revenue}</div>
                  <div className="mb-5 text-14 font-400 text-secondary">{t('Revenue Share')}</div>
                  <div className="text-38 s1366:text-[40px] font-700">{it.fee}</div>
                  <div className="text-14 font-400 text-secondary">{t('Entry fee')}</div>
                </>
              ) : (
                <div className="w-40 text-center s1366:flex-1 flex-center h-80 text-14 text-secondary">
                  {t('Custom revenue share and fee option.')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-center">
        <Link to="/partner/contact/us">
          <Button size="lg" className="rounded-full">
            {t('Contact us')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Security() {
  const { t } = useTranslation();
  const items = useMemo(() => {
    const css = 'shrink-0 w-12 h-12 s768:w-15 s768:h-15';
    return [
      {
        icon: <Icons.Security1 className={css} />,
        text: t(
          'All game play formulas are open and transparent, which deters fraud and prevents risks to partners and players.'
        ),
      },
      {
        icon: <Icons.Security2 className={css} />,
        text: t(`The settlement formula is open and transparent and can be calculated in real time.`),
      },
      {
        icon: <Icons.Security3 className={css} />,
        text: t('Detrade has completed the code review and the result is in TOP-10%.'),
      },
    ];
  }, [t]);
  return (
    <div id="/partner/security" className="bg-primary">
      <h2 className="relative z-10 text-center mb-9 s1366:mb-21 text-32 s1366:text-44 font-700">
        {t('Transparency & Security')}
      </h2>
      <div className="max-w-[1140px] mx-auto s768:flex items-center s768:gap-10 s1366:gap-30 px-4 s768:px-0">
        <Image className="mb-12 rounded h-50 s768:h-80 s1024:flex-1 s768:mb-0" src={SecurityBg} alt=" " />
        <div className="flex-grow py-4 space-y-10 shrink-0 s1024:flex-1 s1366:flex-none s768:px-5 s768:w-100">
          {items.map((it, index) => {
            return (
              <div className="flex items-center gap-4 text-secondary text-12 s768:text-14 font-400" key={index}>
                {it.icon}
                <div>{it.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const questions = useMemo(() => {
    return [
      {
        title: t('Can Partner upgrade his partnership level in the future?'),
        content: t('Yes, contact us at any time to upgrade your package.'),
        value: '1',
      },
      {
        title: t('How will players deposit and withdraw their funds?'),
        content: t(
          'Players can perform recharge and withdrawal operations through the recharge and withdrawal portals provided by the platform.'
        ),
        value: '2',
      },
      {
        title: t('Can non-crypto users play Detrade games?'),
        content: t(
          'Yes, those who are not familiar with cryptocurrencies can Log In through social networks and fund them with bank cards.'
        ),
        value: '3',
      },
      {
        title: t("How does Playnance assist Partners in their platforms' promotion?"),
        content: t(
          'We provide a step-by-step guide on attracting players to your platform, along with marketing materials that have proven effective.'
        ),
        value: '4',
      },
      {
        title: t('Are there any geographical restrictions?'),
        content: t(
          'Unnecessary. Detrade is a technology provider and you can purchase our solutions from any country.'
        ),
        value: '5',
      },
      {
        title: t('What operational expenses could Partner have?'),
        content: t(
          'White label owners have zero costs in developing the platform. All they need is to focus on sales and marketing.'
        ),
        value: '6',
      },
    ];
  }, [t]);

  return (
    <div className="py-12 bg-secondary s768:py-25">
      <div className="max-w-[1140px] s768:bg-[#1C242E] mx-auto px-4 s768:px-0 s768:flex rounded-6 mb-12 overflow-hidden">
        <div className="flex-1 pb-6 mb-6 text-center basis-0 s768:text-left s768:px-12 s768:py-10 s768:mb-0">
          <h2 className="relative z-10 mb-6 text-32 s1366:text-44 font-700">{t('FAQ')}</h2>
          <div className="mb-6 text-16 text-secondary font-400">
            {t(`Didn't find an answer to our question?`)}
            <br />
            {t(`Drop us a line here`)}
          </div>
          <Link to="/partner/contact/us">
            <Button size="lg" className="rounded-full">
              {t(`Ask a question`)}
            </Button>
          </Link>
        </div>
        <Image className="flex-1 object-cover basis-0 h-50 s768:h-72 s1366:h-80 s768:rounded-6" src={FaqBg} alt=" " />
      </div>

      <div className="max-w-[1140px] mx-auto space-y-4 px-4">
        <Accordion items={questions} defaultValue="1" type="single" />
      </div>
    </div>
  );
}

function Container(props: BaseProps) {
  const { className, children } = props;
  return (
    <div className={cn('mx-auto', className)} style={{ maxWidth: 1600 }}>
      {children}
    </div>
  );
}
