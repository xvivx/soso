/* eslint max-lines: "off" */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useTheme } from '@store/system';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Accordion, AnimateNumber, Button, Image, ScrollList, SvgIcon, Tabs } from '@components';
import { cn } from '@utils';
import Video from '@pages/components/Video';
import { AnimatedSection, FlipText, WordRevealAnimation } from './AnimatedSection';
import * as Assets from './assets';
import { useHorizontalScroll } from './useHorizontalScroll';

/** 部分容器最大宽度1600 */
const styles = { maxWidth: 1600, marginLeft: 'auto', marginRight: 'auto' };
/**  部分容器通用样式 */
const classNames = {
  cancelMobilePaddingX: '-mx-4 s768:mx-0',
  containerPaddingX: 'px-0 s768:px-8 s1024:px-15 s1440:px-30 s1920:px-0',
};
/** 跳转游戏路由 */
const gameRouter = '/trade-center';

/** future路由 */

const futureRouter = '/trade-center/futures';

function HomePage() {
  const { mobile } = useMediaQuery();
  const sections = [
    { name: 'Partners', Component: Partners },
    { name: 'Market', Component: Market },
    { name: 'Products', Component: Products },
    { name: 'Users', Component: Users },
    { name: 'ChooseUs', Component: ChooseUs },
    { name: 'FAQ', Component: FAQ },
    { name: 'PlayNow', Component: PlayNow },
  ];

  return (
    <div className={cn('relative space-y-6 s1920:space-y-22', mobile && 'p-4')}>
      {/* 第一个模块不需要上移淡入动画 */}
      <Introduction />
      {sections.map((section, index) => {
        return (
          <AnimatedSection key={section.name} index={index}>
            {(inView) => <section.Component inView={inView} />}
          </AnimatedSection>
        );
      })}
    </div>
  );
}

export default HomePage;

function HeaderShadow() {
  const { mobile } = useMediaQuery();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: mobile ? '-175px' : '-490px',
        width: mobile ? '100%' : '60%',
        height: mobile ? '296px' : '779px',
        borderRadius: '100%',
        background: 'radial-gradient(50% 50% at 50% 50%, rgb(44 217 125 / 20%) 0%, rgba(0, 0, 0, 0.00) 100%)',
        zIndex: 0,
      }}
    />
  );
}

function Introduction() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    margin: '-50px 0px', // 提前触发检测
    amount: 0.1, // 至少10%元素可见时触发
  });

  const cryptoImages = [
    { key: 'usdt', src: Assets.usdt },
    { key: 'btc', src: Assets.btc },
    { key: 'eth', src: Assets.eth },
    { key: 'sql', src: Assets.sql },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 每隔3秒切换图片
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cryptoImages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [cryptoImages.length]);

  return (
    <div
      className={cn(
        classNames.containerPaddingX,
        'pb-8 s768:py-8 s1440:py-15 relative flex flex-col s768:flex-row justify-between gap-3'
      )}
      style={styles}
    >
      <HeaderShadow />
      <div className="order-1 s768:order-none flex flex-col items-center s768:items-start flex-1 s768:max-w-[50%] relative z-10">
        <div className="text-38 s1024:text-[59px] s1920:text-[87px] text-success text-center s768:text-left leading-tight font-700">
          <div className="flex-center s768:justify-start gap-4">
            <WordRevealAnimation text={t('Crypto')} />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: 'easeOut',
              }}
            >
              <Image src={cryptoImages[currentImageIndex].src} className="size-9 s1024:size-14 s1920:size-20" />
            </motion.div>
          </div>
          <WordRevealAnimation
            text={t('Binary Options Exchange')}
            initialDelay={0.5}
            className="justify-center s768:justify-normal"
          />
        </div>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: 'easeIn', delay: 1.5 }}
        >
          <div className="text-16 s1920:text-24 text-secondary font-600 mt-3 mb-8 s768:my-10">
            {t('Professional, Secure, Trustworthy')}
          </div>
          <div className="flex flex-col w-60 s1024:w-[340px] s1920:w-[500px] mx-auto">
            <Button
              size="free"
              className="h-12 s1024:h-15 s1920:h-22 text-18 s1920:text-24 mb-5 rounded-3 hover:scale-105"
              onClick={() => {
                navigate(gameRouter);
              }}
            >
              {t('Go trading')}
            </Button>
            <Button
              size="free"
              theme="ghost"
              className="relative h-12 s1024:h-15 s1920:h-22 text-18 s1920:text-24 
              rounded-3 overflow-hidden group hover:text-black"
              onClick={() => null}
            >
              <PseudoElement />
              {/* 内容 */}
              <span className="relative z-10 flex items-center gap-2 s768:gap-4">
                <SvgIcon name="playVideo" className="size-5 s768:size-8" />
                {t('Watch play demo')}
              </span>
            </Button>
          </div>
        </motion.div>
      </div>

      <div
        className="relative overflow-hidden mx-auto s768:mx-0
      min-h-64 w-72 s768:w-100 s1024:w-[487px] s1440:w-[552px] s1920:w-[831px]"
      >
        <Image src={Assets.banner} />
        <motion.svg
          className="absolute right-0 top-0 w-50 s768:w-72 s1024:w-96 s1440:w-[480px] s1920:w-[600px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 206 195"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{
            scale: {
              type: 'spring',
              visualDuration: 0.6, // 强制动画视觉时长
              damping: 6, // 阻尼（值越小，弹跳越多）
              stiffness: 100, // 刚度（值越小，动画越慢）
              bounce: 0.7, // 弹性幅度
            },
          }}
        >
          <circle opacity="0.7" cx="197.878" cy="85.3098" r="4.44258" fill="#24EE89" />
          <circle opacity="0.6" cx="15.0559" cy="176.915" r="4.44258" fill="#24EE89" />
          <circle opacity="0.5" cx="183.052" cy="184.032" r="4.44258" fill="#24EE89" />
          <circle opacity="0.3" cx="133.599" cy="191.525" r="3.17327" fill="#24EE89" />
          <circle opacity="0.4" cx="202.356" cy="23.4106" r="2.85594" fill="#24EE89" />
          <circle opacity="0.3" cx="3.31493" cy="20.4731" r="2.85594" fill="#24EE89" />
          <circle opacity="0.7" cx="3.95474" cy="85.1305" r="1.90396" fill="#24EE89" />
          <circle opacity="0.4" cx="154.37" cy="2.37995" r="2.37995" fill="#24EE89" />
          <circle opacity="0.4" cx="19.5928" cy="64.8214" r="2.37995" fill="#24EE89" />
        </motion.svg>
      </div>
    </div>
  );
}

function Partners() {
  const { t } = useTranslation();
  const images = [
    Assets.binance,
    Assets.okx,
    Assets.huobi,
    Assets.coinbase,
    Assets.mexc,
    Assets.bitGet,
    Assets.bybit,
    Assets.kucoin,
    Assets.gateIo,
  ];
  const { mobile } = useMediaQuery();
  // pc端需要复制一份图片数组以实现无缝滚动
  const list = mobile ? images : [...images, ...images];
  // 计算滚动距离
  const { ref } = useHorizontalScroll(images, 80);

  return (
    <div className={cn(classNames.containerPaddingX, 'pt-11 pb-22 s768:py-11 s1920:py-15')} style={styles}>
      <div className="text-24 s1920:text-44 font-700 text-center mb-8">{t('Trusted by')}</div>
      <div
        className="overflow-hidden"
        style={{
          maskImage: !mobile ? 'linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)' : 'none',
        }}
      >
        <div
          ref={ref}
          className={cn(
            !mobile && 'horizontal-scrolling',
            'grid grid-cols-2 justify-items-start s768:inline-flex items-center gap-5 s768:gap-x-20'
          )}
        >
          {list.map((image, index) => (
            <Image src={image} key={index} className="s768:w-40 h-7 [&>img]:object-contain" alt="partner logo" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StarIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28" fill="none" {...props}>
      <path
        d="M6.90625 12.2305L8.98385 11.3702C11.5232 10.3188 13.5407 8.30139 14.5924 5.7621L15.4533 3.68346L16.4766 5.99411C17.5392 8.39355 19.4727 10.3004 21.8868 11.3295L24.0003 12.2305L20.5707 14.2994C18.9733 15.263 17.6658 16.64 16.7861 18.285L15.4533 20.7775L14.3253 18.5221C13.4277 16.7272 12.0282 15.2316 10.2967 14.217L6.90625 12.2305Z"
        fill="currentColor"
      />
      <path
        d="M0 22.6348C2.32549 21.6719 4.17336 19.8238 5.13643 17.4983L5.19229 17.6245C6.19017 19.8777 8.00592 21.6684 10.2729 22.6348L9.18563 23.2906C7.58831 24.2542 6.28079 25.6312 5.4011 27.2763L5.13643 27.7712L5.00745 27.5133C4.10984 25.7184 2.71026 24.2228 0.978772 23.2083L0 22.6348Z"
        fill="currentColor"
      />
      <path
        d="M3.45312 3.66016C5.00676 3.01685 6.2413 1.78215 6.88472 0.228563L6.92204 0.312828C7.58871 1.81821 8.8018 3.01451 10.3163 3.66016L9.91102 3.90465C8.63372 4.67519 7.58816 5.77631 6.88472 7.09175C6.2288 5.78015 5.20608 4.68728 3.94081 3.94591L3.45312 3.66016Z"
        fill="currentColor"
      />
    </svg>
  );
}
function Market({ inView }: { inView?: boolean }) {
  const { t } = useTranslation();
  const { gt1024 } = useMediaQuery();
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        classNames.cancelMobilePaddingX,
        'px-4 s768:px-0 py-28 s768:py-12 s1440:py-19 s1920:py-28',
        'flex-center flex-col bg-no-repeat bg-cover text-center relative overflow-hidden bg-black/40 light:bg-success/10'
      )}
      style={{
        background:
          'radial-gradient(147.88% 100% at 52.63% 100%, rgba(44, 217, 125, 0.05) 0%, rgba(0, 0, 0, 0.00) 28.89%), radial-gradient(41.47% 100% at 51.61% 0%, rgba(44, 217, 125, 0.06) 0%, rgba(9, 44, 26, 0.00) 74.87%)',
      }}
    >
      <Image
        src={Assets.marketStar}
        className="absolute z-0
        top-0 left-0 right-0 
        s768:left-25 s768:right-25 
        s1024:left-1/3 s1024:right-1/3
        s1920:left-1/4 s1920:w-[1000px]"
      />
      {/* < 1024 圆圈 */}
      {!gt1024 && (
        <motion.div
          className="abs-center"
          initial={{ x: '-100%', opacity: 0 }}
          animate={inView ? { x: '-50%', y: '-50%', opacity: 1 } : { x: '-100%', opacity: 0 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            delay: 0.6,
          }}
          style={{ width: 384, height: 384 }}
        >
          <Image src={Assets.marketBgCircle_mobile} />
        </motion.div>
      )}
      {/* > 1024 圆圈 */}
      {gt1024 && inView && (
        <>
          {/* 左上角划入的图片 */}
          <motion.div
            initial={{
              transform: 'translate3d(-100%, -100%, 0) scale(1.5)',
              opacity: 0,
            }}
            animate={{
              transform: 'translate3d(0, 0, 0) scale(1)',
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
              delay: 0.3,
            }}
            className="absolute -left-17 -top-25 size-[372px]
          s1440:-left-15 s1440:-top-40 s1440:size-[500px]
          s1920:-top-80 s1920:-left-60 s1920:size-[800px]"
          >
            <Image src={Assets.marketCircleLeft} className="size-[372px] s1440:size-[500px] s1920:size-[800px]" />
          </motion.div>
          {/* 右下角划入的图片 */}
          <motion.div
            initial={{
              transform: 'translate3d(100%, 100%, 0) scale(1.5)',
              opacity: 0,
            }}
            animate={{
              transform: 'translate3d(0, 0, 0) scale(1)',
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
              delay: 0.6,
            }}
            className="absolute -right-44 -bottom-22 size-[372px]
          s1024:-right-30 s1024:-bottom-20
          s1440:-right-36 s1440:-bottom-50 s1440:size-[500px]
          s1920:-right-64 s1920:-bottom-64 s1920:size-[800px]"
          >
            <Image src={Assets.marketCircleRight} className="size-[372px] s1440:size-[500px] s1920:size-[800px]" />
          </motion.div>
        </>
      )}
      <div className="text-32 s1920:text-[66px] font-700 text-primary mb-4 relative z-10">
        {t('20+ exchange market data')}
      </div>
      <div className="text-16 s1920:text-24 max-w-[444px] s1920:max-w-[1118px] mb-8 text-secondary">
        {t(
          'Ensuring authentic, manipulation-free pricing with transparent and verifiable algorithms for guaranteed fairness.'
        )}
      </div>
      <div
        className="relative flex-center mx-auto bg-no-repeat bg-cover
        w-[357px] h-[115px] s1920:w-[666px] s1920:h-[148px]"
      >
        <Image src={gt1024 ? Assets.getStartBg : Assets.getStartBg_mobile} className="absolute inset-0" />
        <Button
          size="free"
          theme="ghost"
          className="
            relative group overflow-hidden
            w-[281px] h-[50px]
            s1024:w-[279px] s1024:h-[67px] s1024:top-[-1px]
            s1920:w-[358px] s1920:h-22 s1920:left-0 s1920:top-[-1px] s1920:text-24
            border border-brand"
          onClick={() => {
            navigate(gameRouter);
          }}
        >
          <PseudoElement />
          <div className="relative z-10 flex items-center gap-4 s1920:gap-7 text-success group-hover:text-black">
            <StarIcon />
            {t('Go trading')}
          </div>
        </Button>
      </div>
    </div>
  );
}

type TabConfig = {
  title: string;
  content: string;
  iconName: 'highLow' | 'spread' | 'contract' | 'arrowRotate';
  img: string;
  video: string;
};

function Products() {
  const { t } = useTranslation();
  const tabs: TabConfig[] = [
    {
      title: t('High Low'),
      content: t('High Low Guess if the price ends higher or lower than the target.'),
      iconName: 'highLow' as const,
      img: Assets.trade,
      video: 'https://currency-trade.s3.ap-east-1.amazonaws.com/video/High+Low.mp4',
    },
    {
      title: t('Spread'),
      content: t(`Win if the price breaks out — above the high or below the low.`),
      iconName: 'spread' as const,
      img: Assets.spread,
      video: 'https://currency-trade.s3.ap-east-1.amazonaws.com/video/Spread.mp4',
    },
    {
      title: t('Futures'),
      content: t('Boost your trade with up to 1000x leverage — big risk, bigger reward.'),
      iconName: 'contract' as const,
      img: Assets.contract,
      video: 'https://currency-trade.s3.ap-east-1.amazonaws.com/video/Futures.mp4',
    },
    {
      title: t('Up Down'),
      content: t('Quick tap: will the price go up or down next?'),
      iconName: 'arrowRotate' as const,
      img: Assets.updown,
      video: 'https://currency-trade.s3.ap-east-1.amazonaws.com/video/Up+Down.mp4',
    },
  ];
  const [selectedIndex, setSelectIndex] = useState(0);
  const { gt1024 } = useMediaQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  // 添加鼠标悬停暂停功能
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  /**
   * > 1024 屏幕时, 自动切换tab
   */
  useEffect(() => {
    if (!gt1024) return;
    if (isPaused) return;
    if (isVideoPlaying) return;

    const timer = setInterval(() => {
      setSelectIndex((prev) => (prev + 1) % tabs.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [tabs.length, gt1024, isPaused, isVideoPlaying]);

  return (
    <div ref={containerRef} className={cn(classNames.containerPaddingX, 'py-8')} style={styles}>
      <div className="text-28 s1920:text-44 font-700 leading-snug mb-4 text-center">
        {t('2s CFD and 5-60s Options')}
      </div>
      <div className="text-12 s1920:text-24 font-600 text-tertiary text-center mb-8 s1920:mb-22">
        {t('Faster trades. Simpler decisions. Real-time interaction with fellow traders in the community.')}
      </div>
      {/* < 1024 为展开收缩组件 */}
      {!gt1024 && (
        <Accordion type="single">
          {tabs.map((item) => {
            return (
              <Accordion.Item key={item.title} value={item.title}>
                <Accordion.Title className="bg-inherit border border-thirdly px-6 py-3 text-24">
                  <div className="leading-normal flex items-center gap-6">
                    <SvgIcon name={item.iconName} className="size-8" />
                    <div>
                      <div className="text-16 font-700 mb-2">{item.title}</div>
                      <div className="text-12 font-500">{item.content}</div>
                    </div>
                  </div>
                </Accordion.Title>
                <Accordion.Content className="relative py-0 text-16 flex justify-center">
                  <Video
                    src={item.video}
                    poster={item.img}
                    onStart={() => setIsVideoPlaying(true)}
                    onEnd={() => setIsVideoPlaying(false)}
                    className="h-50 s768:h-100 aspect-video rounded-3"
                  />
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
      {/* > 1024 为tab */}
      {gt1024 && (
        <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <Tabs
            selectedIndex={selectedIndex}
            onChange={setSelectIndex}
            tabs={tabs}
            direction="vertical"
            className="justify-between items-stretch space-y-0"
          >
            <Tabs.Header className="p-0 bg-inherit space-y-3 s1920:space-y-8 w-[307px] s1440:w-[413px] s1920:w-[490px]">
              {tabs.map((tab, index) => (
                <Tabs.Item
                  key={tab.title}
                  className={cn(
                    'flex justify-start items-center gap-6 border border-thirdly px-6 py-3 rounded-3',
                    selectedIndex === index && 'text-brand border-brand'
                  )}
                  selectedClassName="menu-item-matched bg-transparent"
                >
                  {selectedIndex === index && (
                    <SvgIcon
                      name={tab.iconName}
                      className="shrink-0 !text-brand size-8 s1920:size-16 transition-none"
                    />
                  )}
                  <div className="leading-normal">
                    <div className="text-16 s1920:text-24 font-700 mb-2">{tab.title}</div>
                    <div className="text-12 s1920:text-14 font-500">{tab.content}</div>
                  </div>
                </Tabs.Item>
              ))}
            </Tabs.Header>

            <AnimatePresence>
              {tabs.map((tab, index) => (
                <Tabs.Panel key={tab.title} className="flex-1">
                  <motion.div
                    key={tab.title}
                    transition={{ duration: 1 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedIndex === index ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    className="relative flex justify-center"
                  >
                    <Video
                      src={tab.video}
                      poster={tab.img}
                      onStart={() => setIsVideoPlaying(true)}
                      onEnd={() => setIsVideoPlaying(false)}
                      className="h-100 s1440:h-[441px] s1920:h-[570px] aspect-video rounded-3"
                    />
                  </motion.div>
                </Tabs.Panel>
              ))}
            </AnimatePresence>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function Users({ inView }: { inView: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        classNames.cancelMobilePaddingX,
        'relative py-19 s1920:py-17 px-4 text-center bg-no-repeat bg-cover leading-snug'
      )}
      style={{
        background:
          'radial-gradient(41.47% 100% at 51.61% 0%, rgba(44, 217, 125, 0.15) 0%, rgba(9, 44, 26, 0.00) 74.87%)',
      }}
    >
      <Image
        src={Assets.userStar}
        className="absolute z-0
        top-0 left-0 right-0 
        s768:left-25 s768:right-25 
        s1024:left-1/3 s1024:right-1/3
        s1920:left-1/4 s1920:w-[1000px]"
      />
      <div className="text-28 s1920:text-44 font-700 mb-5 s1920:mb-11 relative z-10">
        {t('Trusted by millions of users.')}
      </div>
      <div className="flex-center gap-5 s1920:gap-18">
        <Image className="w-5 s1920:w-13" src={Assets.subtractLefts} />
        <div
          className="text-[40px] s768:text-44 s1920:text-[92px] flex items-center"
          style={{
            background: 'linear-gradient(91deg, #24EE89 34.96%, #9FE871 69.06%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {inView && <AnimateNumber value={30000000} precision={0} immediate duration={1.5} />}
          {!inView && <span>0</span>}
          <span>+</span>
        </div>
        <Image className="w-5 s1920:w-13 -scale-x-100" src={Assets.subtractLefts} />
      </div>
    </div>
  );
}

function ChooseStarIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="81" viewBox="0 0 70 81" fill="none" {...props}>
      <g opacity="0.9">
        <path
          d="M34.1342 30.2C36.713 29.1322 38.7947 27.1443 39.9837 24.6336L40.2102 24.124L45.0971 12.3221L50.4356 24.3753C51.5148 26.8122 53.4231 28.7804 55.8121 29.9355L56.2969 30.1551L68.1078 35.1905L54.873 43.1758C53.2508 44.1545 51.9041 45.5263 50.957 47.1623L50.7733 47.4937L45.0964 58.1079L39.9174 47.7513C39.0058 45.9284 37.6163 44.3902 35.9006 43.2994L35.5532 43.0874L22.0768 35.1919L34.1342 30.2Z"
          stroke="#24EE89"
          strokeWidth="1.72676"
        />
        <path
          d="M6.95713 63.4518C9.53629 62.3839 11.6191 60.3965 12.808 57.8854L13.0338 57.3765L15.0067 52.6097L17.2295 57.6279C18.3088 60.0649 20.218 62.033 22.6074 63.188L23.0908 63.4076L28.0709 65.5303L21.6676 69.3939C20.0454 70.3725 18.6994 71.745 17.7522 73.381L17.5679 73.7118L15.0067 78.5006L12.741 73.97C11.8295 72.1472 10.4398 70.6089 8.72421 69.5182L8.37618 69.3055L1.93419 65.5317L6.95713 63.4518Z"
          stroke="#24EE89"
          strokeWidth="1.72676"
        />
        <path
          d="M13.5139 9.56831C16.0931 8.50036 18.1752 6.51236 19.3641 4.00123L19.5899 3.49231L20.1064 2.24244L20.7728 3.74435C21.8521 6.18121 23.7608 8.14885 26.15 9.30384L26.634 9.52412L28.1974 10.1912L25.2102 11.9935C23.5877 12.9722 22.2413 14.345 21.2941 15.9813L21.1105 16.3114L20.1064 18.1882L19.2971 16.5696C18.3855 14.7467 16.996 13.2085 15.2803 12.1178L14.9329 11.9058L12.0065 10.1919L13.5139 9.56831Z"
          stroke="#24EE89"
          strokeWidth="1.72676"
        />
      </g>
    </svg>
  );
}

function Features({ name, label }: { name: keyof typeof Assets; label: string | string[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    // 这里多包一层避免因动画导致鼠标位置相对于元素发生变化，从而触发 onMouseEnter 和 onMouseLeave 事件反复执行
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        /**
         * 点击x1000跳转到future玩法
         */
        if (name === 'featureLeverage' || name === 'featureLeverage_dark') {
          navigate(futureRouter);
        }
      }}
    >
      <motion.div
        className="relative overflow-hidden
          w-56 h-[387px]
          s768:w-56 s768:h-96
          s1024:w-64 s1024:h-[456px] 
          s1440:w-80 s1440:h-[547px] 
          s1920:w-[367px] s1920:h-[654px] s1920:pt-11 s1920:pl-10 s1920:pr-7
          shrink-0 whitespace-normal border border-success/20 px-6 pt-6"
        style={{
          borderRadius: 32,
          background:
            'radial-gradient(95.44% 136.52% at 98.09% 0.92%, rgba(36, 238, 137, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.3), 
           0 25px 50px -12px rgba(255, 255, 255, 0.15)`
            : 'none',
        }}
        initial={false}
        animate={{
          rotateY: isHovered ? 10 : 0,
          rotateX: isHovered ? -5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <div className="relative">
          {/* 文字 */}
          <motion.div
            className="text-22 s1024:text-27 s1440:text-32 s1920:text-38 leading-tight break-words w-4/5 s1920:w-64"
            animate={{
              y: isHovered ? -5 : 0,
              textShadow: isHovered ? `0 0 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.7)` : 'none',
            }}
            transition={{ duration: 0.5 }}
          >
            {typeof label === 'string'
              ? label
              : label.map((item) => {
                  return <div key={item}>{item}</div>;
                })}
          </motion.div>
          {/* 右上角星星 */}
          <motion.div
            animate={{
              scale: isHovered ? [1, 1.1, 1] : 1,
              rotate: isHovered ? [0, 10, 0] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute top-2 right-0"
          >
            <ChooseStarIcon className="size-9 s1920:size-14" />
          </motion.div>
        </div>
        {(name === 'featureAirdrop' || name === 'featureAirdrop_dark') && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="rounded-[60px] border border-brand text-brand flex items-center mx-auto
              w-34 h-10 text-12 mt-12 overflow-hidden group relative
              s768:w-40 s768:h-9 s768:text-13
              s1024:w-44 s1024:h-12 s1024:text-16 s1024:mt-17
              s1440:w-56 s1440:h-14 s1440:text-18
              s1920:w-56 s1920:h-16"
              theme="ghost"
              size="free"
              onClick={() => navigate(gameRouter)}
            >
              <PseudoElement />
              <div className="relative z-10 flex items-center gap-4 s1920:gap-7 text-success group-hover:text-black">
                <StarIcon className="size-3 s1440:size-4 s1920:size-6" />
                {t('Go trading')}
              </div>
            </Button>
          </motion.div>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Image src={Assets[name]} className="w-32 s1024:w-36 s1920:w-56" />
        </div>
      </motion.div>
    </div>
  );
}

function ChooseUs({ inView }: { inView?: boolean }) {
  const { t } = useTranslation();
  const { mobile, gt1920 } = useMediaQuery();
  const theme = useTheme();
  const category = [
    {
      label: t('24h Trade Vol'),
      value: 300,
      suffix: 'M+',
    },
    {
      label: t('Experience'),
      value: 5,
      suffix: 'years',
    },
    {
      label: t('Crypto Pairs'),
      value: 50,
      suffix: '+',
    },
  ];
  const feature = useMemo(() => {
    const baseKeys = ['featureLeverage', 'featureAirdrop', 'featureFee'];
    const labels = [
      t('Leverage 1000x Maximum'),
      [t('Airdrops'), t('Prize Pools'), t('Trade to Win')],
      t('Zero Trading Fees'),
    ];

    return baseKeys.map((baseKey, index) => ({
      key: (theme === 'lighten' ? baseKey : `${baseKey}_dark`) as keyof typeof Assets,
      label: labels[index],
    }));
  }, [theme, t]);

  return (
    <div className={cn(classNames.containerPaddingX, 'pt-11 pb-6')} style={styles}>
      <div className="text-28 s1920:text-44 font-700 text-center mb-6 s1920:mb-14">{t('Why you must choose us?')}</div>
      <div className="flex-center gap-5 s768:gap-12 s1920:gap-36 mb-14">
        {category.map((item) => {
          return (
            <div key={item.label} className="text-center">
              <FlipText className="h-15 s1920:h-32" flipHeight={gt1920 ? 128 : 60}>
                <div className="text-28 s1920:text-[60px] text-brand">
                  {inView ? (
                    <AnimateNumber as="span" value={item.value} precision={0} immediate duration={1.5} />
                  ) : (
                    <span>0</span>
                  )}
                  {item.suffix}
                </div>
                <div className="text-12 s1920:text-24 text-tertiary">{item.label}</div>
              </FlipText>
            </div>
          );
        })}
      </div>
      {mobile ? (
        <ScrollList size="lg" className="gap-x-5 bg-inherit [&>.detrade-button]:shadow-none">
          {feature.map((item) => {
            return <Features key={item.key} name={item.key} label={item.label} />;
          })}
        </ScrollList>
      ) : (
        <div className="flex-center gap-x-5 s1024:gap-x-9 s1920:gap-x-15">
          {feature.map((item) => {
            return <Features key={item.key} name={item.key} label={item.label} />;
          })}
        </div>
      )}
    </div>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const accordions = [
    {
      title: t('Which currency pairs can be traded on Detrade?'),
      content: t(
        'The platform provides BTC, ETH and other mainstream currency trading pairs, and will continue to update popular currency trading pairs.'
      ),
    },
    {
      title: t('Can I use a live account and a demo account at the same time?'),
      content: t('Yes, you can use both.'),
    },
    {
      title: t('What currencies can be deposited and withdrawn?'),
      content: t(
        'You can deposit and withdraw most of the mainstream digital currencies on the market, and the platform will also gradually launch the deposit and withdrawal functions of legal currencies.'
      ),
    },
  ];
  return (
    <div className={cn(classNames.containerPaddingX, 'py-10 s1920:py-21')} style={styles}>
      <div className="text-28 s1920:text-44 font-700 text-center mb-4">{t('Frequently asked questions')}</div>
      <div className="text-12 s1920:text-24 font-600 text-tertiary mx-auto text-center mb-10" style={{ maxWidth: 800 }}>
        {t(
          `Haven't found what you're looking for? Check out of some questions here, or see our Help Center for more info.`
        )}
      </div>
      <Accordion type="single" className="space-y-0">
        {accordions.map((item) => {
          return (
            <Accordion.Item key={item.title} value={item.title} className="border-b border-b-thirdly">
              <Accordion.Title className="bg-inherit px-0 py-4 text-16 s1920:text-24 s1920:pt-8 s1920:pb-6">
                {item.title}
              </Accordion.Title>
              <Accordion.Content className="pt-2 pb-4 text-12 s1920:text-16 s1920:pt-0 s1920:pb-8">
                {item.content}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}

function PlayNow() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        classNames.cancelMobilePaddingX,
        'relative py-19 px-4 h-72 s768:h-64 s1920:h-80 text-center bg-no-repeat bg-cover'
      )}
      style={{
        background:
          'radial-gradient(41.47% 100% at 51.61% 0%, rgba(44, 217, 125, 0.15) 0%, rgba(9, 44, 26, 0.00) 74.87%)',
      }}
    >
      <Image
        src={Assets.userStar}
        className="absolute 
        top-0 left-0 right-0 
        s768:left-25 s768:right-25 
        s1024:left-1/3 s1024:right-1/3
        s1920:left-1/4 s1920:w-[1000px]"
      />
      <div className="relative z-10 text-28 s1920:text-44 font-700 mb-8">{t('Trade like a rhythm master')}</div>
      <Button
        onClick={() => navigate(gameRouter)}
        size="free"
        className="rounded-2
        w-60 h-12 text-18 hover:scale-105
        s1920:w-[346px] s1920:h-15 s1920:text-24"
      >
        {t('Go trading')}
      </Button>
    </div>
  );
}

/**
 * 使用伪元素实现背景填充动画
 *
 * 父级需要设置overflow-hidden group relative
 */
function PseudoElement() {
  return (
    <span
      className="absolute inset-0 z-0 w-0 bg-gradient-to-r from-[#24ee89] to-[#9fe871] from-0% to-100%
     transition-all duration-300 ease-out group-hover:w-full"
    />
  );
}
