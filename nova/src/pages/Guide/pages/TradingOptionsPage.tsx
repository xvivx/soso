import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@hooks/useResponsive';
import { Accordion, Button, Image, SvgIcon, Tabs } from '@components';
import { cn } from '@utils';
import * as Assets from '../../Landing/assets';
import AnimatedButton from '../components/AnimatedButton';
import VideoPlayer from '../components/VideoPlayer';

const TradingOptionsPage: React.FC<{ nextPage: () => void }> = ({ nextPage }) => {
  const { t } = useTranslation();
  const { gt1024 } = useMediaQuery();
  const tabs = [
    {
      title: t('High Low'),
      content: t('Guess if the price ends higher or lower than the target.'),
      iconName: 'highLow' as const,
      img: Assets.trade,
    },
    {
      title: t('High Low Spread'),
      content: t(`Win if the price breaks out — above the high or below the low.`),
      iconName: 'spread' as const,
      img: Assets.spread,
    },
    {
      title: t('1000x leverage'),
      content: t('Boost your trade with up to 1000× leverage — big risk, bigger reward.'),
      iconName: 'contract' as const,
      img: Assets.contract,
    },
    {
      title: t('Up Down'),
      content: t('Quick tap: will the price go up or down next?'),
      iconName: 'arrowRotate' as const,
      img: Assets.updown,
    },
  ];
  const [selectedIndex, setSelectIndex] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string>(tabs[0].title);
  const { mobile } = useMediaQuery();
  return (
    <>
      <motion.div
        className={cn('flex flex-col mt-16 relative z-10 flex-1 w-full', mobile && 'overflow-auto')}
        style={{ maxHeight: 680 }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {!gt1024 && (
          <Accordion
            type="single"
            value={expandedItem}
            onValueChange={(value) => {
              setExpandedItem(value);
              const index = tabs.findIndex((tab) => tab.title === value);
              if (index !== -1) {
                setSelectIndex(index);
              }
            }}
          >
            {tabs.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <Accordion.Item key={item.title} value={item.title} className="rounded-3">
                  <Accordion.Title
                    className={`bg-inherit border border-thirdly px-6 py-3 text-24 transition-all duration-300 ${isSelected ? 'text-brand border-brand' : ''}`}
                  >
                    <div className="leading-normal flex items-center gap-6">
                      <SvgIcon
                        name={item.iconName}
                        className={`size-8 transition-colors duration-300 ${isSelected ? 'text-brand' : ''}`}
                      />
                      <div>
                        <div
                          className={`text-16 font-700 mb-2 transition-colors duration-300 ${isSelected ? 'text-brand' : ''}`}
                        >
                          {item.title}
                        </div>
                        <div
                          className={`text-12 font-500 transition-colors duration-300 ${isSelected ? 'text-brand/80' : ''}`}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </Accordion.Title>
                  <Accordion.Content className="relative py-4 text-16">
                    <Image src={item.img} className="h-50 s768:h-100" />
                    <div className="abs-center">
                      <Button
                        theme="transparent"
                        className="size-12"
                        icon={<SvgIcon name="playVideo" className="size-full" />}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion>
        )}
        {gt1024 && (
          <div className="flex gap-8 h-full justify-center items-center" style={{ maxHeight: 680 }}>
            <Tabs
              selectedIndex={selectedIndex}
              onChange={setSelectIndex}
              tabs={tabs}
              direction="vertical"
              className="justify-between w-2/5 items-stretch space-y-0 h-full"
            >
              <Tabs.Header className="p-0 bg-inherit space-y-5 s1920:space-y-8 grid  grid-cols-1 w-full ">
                {tabs.map((tab, index) => (
                  <Tabs.Item
                    key={tab.title}
                    className={`border border-thirdly rounded-3 ${selectedIndex === index ? 'text-brand border-brand' : ''}`}
                    selectedClassName="menu-item-matched bg-transparent"
                  >
                    <div className="max-h-30 flex items-center justify-start gap-6 px-6 py-3">
                      {selectedIndex === index && (
                        <SvgIcon
                          name={tab.iconName}
                          className="shrink-0 !text-brand size-8 s1920:size-14 transition-none"
                        />
                      )}
                      <div className="leading-normal">
                        <div className="text-16 s1920:text-24 font-700 mb-2">{tab.title}</div>
                        <div className="text-12 s1920:text-16 font-500">{tab.content}</div>
                      </div>
                    </div>
                  </Tabs.Item>
                ))}
              </Tabs.Header>
            </Tabs>
            <VideoPlayer />
          </div>
        )}
      </motion.div>
      <motion.div
        className="flex-shrink-0 mt-4 s1024:mt-8 s1440:mt-16 pb-16 s1024:mb-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <AnimatedButton onClick={nextPage} className="mx-auto">
          {t('Next')} <span className="ml-2">↓</span>
        </AnimatedButton>
      </motion.div>
    </>
  );
};

export default React.memo(TradingOptionsPage);
