import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { AccountType, changeAccountType } from '@store/wallet';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button } from '@components';
import { cn } from '@utils';
import arrow from '../assets/arrow.png';

const AccountTypeGuidePage = React.memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedAccount, setSelectedAccount] = useState<'real' | 'demo'>('real');
  const [hoveredType, setHoveredType] = useState<'real' | 'demo' | null>(null);
  const { mobile, gt1440 } = useMediaQuery();

  const accountOptions = useMemo(
    () => [
      {
        type: 'real' as const,
        title: t('Real Account'),
        minDeposit: '10USDC',
        features: [
          t('Real Account – Real Funds!'),
          t('Withdraw your earnings 24/7'),
          t('Access over 70 popular assets with up to 90% profit potential'),
          t('Join and earn extra bonuses!'),
        ],
        buttonText: t('Deposit'),
        recommended: true,
      },
      {
        type: 'demo' as const,
        title: t('Demo Account'),
        minDeposit: t('Free'),
        features: [
          t('Risk-free trading with $10,000 in virtual funds'),
          t('Join free competitions'),
          t('Get free educational materials and 24/7 support'),
          t('Test various trading tools and strategies'),
        ],
        buttonText: t('Try'),
        recommended: false,
      },
    ],
    [t]
  );

  return (
    <>
      {/* 移动端布局 */}
      {mobile && (
        <div className="w-full">
          {/* 标题部分 */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary text-22 font-700 leading-tight mb-4 s768:pt-10">
              <Trans i18nKey="Choose Your <0> Account Type And </0>  Start Trading!">
                <div />
              </Trans>
            </h2>
          </motion.div>
          {/* 滑动切换区域 */}
          <div className="relative overflow-hidden">
            <div className="relative h-full">
              {/* 账户卡片容器 - 可滑动 */}
              <motion.div
                className="flex h-full"
                animate={{ x: selectedAccount === 'real' ? 0 : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: -400, right: 0 }}
                onDragEnd={(_, info) => {
                  const threshold = 50;
                  if (info.offset.x > threshold && selectedAccount === 'demo') {
                    setSelectedAccount('real');
                  } else if (info.offset.x < -threshold && selectedAccount === 'real') {
                    setSelectedAccount('demo');
                  }
                }}
              >
                {accountOptions.map((account) => (
                  <div key={account.type} className="w-full flex-shrink-0 px-2">
                    <motion.div
                      className="relative h-full"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: selectedAccount === account.type ? 1 : 0.7,
                        scale: selectedAccount === account.type ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* 推荐标签 */}
                      {account.recommended && selectedAccount === account.type && (
                        <div className={'absolute s1024:-top-2 s1024:left-4 left-1/2 z-10 top-0 -translate-x-1/2 '}>
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="bg-colorful12 text-primary_brand px-4 py-1 rounded-bl-5 rounded-br-5 text-12 font-600 whitespace-nowrap">
                              {t('Recommended for you')}
                            </div>
                          </motion.div>
                        </div>
                      )}
                      <div
                        className={`border rounded-6 p-6 min-h-96 text-center transition-all duration-300 ${
                          selectedAccount === account.type
                            ? 'border-success/30 shadow-lg shadow-success/20'
                            : 'border-white/10 bg-black/5'
                        }`}
                        style={{
                          background:
                            selectedAccount === account.type
                              ? 'radial-gradient(102.6% 101.17% at 98.49% -1.17%, rgba(36, 238, 137, 0.28) 0%, rgba(36, 238, 137, 0.056) 100%)'
                              : 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        {/* 头部信息 */}
                        <div className="mt-4.5 s1024:mt-0 flex-col s1024:flex-row flex justify-between items-center mb-4">
                          <h3 className="text-primary text-18 font-600">{account.title}</h3>
                          <div className="text-right flex mt-2 s1024:mt-0 s1024:block text-secondary text-12">
                            {account.type === 'real' && <p className=" mb-1">{t('Minimum Deposit')}</p>}
                            <p className="s1024:text-primary ml-2 s1024:ml-0  s1024:font-700 s1024:text-16">
                              {account.minDeposit}
                            </p>
                          </div>
                        </div>
                        {/* 特性列表 */}
                        <div className="mt-4 s1024:mt-0 mb-6">
                          {account.features.map((feature, featureIndex) => (
                            <motion.div
                              key={featureIndex}
                              className="flex items-start mb-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{
                                opacity: selectedAccount === account.type ? 1 : 0.6,
                                x: 0,
                              }}
                              transition={{
                                duration: 0.5,
                                delay: selectedAccount === account.type ? featureIndex * 0.1 : 0,
                              }}
                            >
                              <span className="text-success mr-3 flex-shrink-0 text-14">→</span>
                              <span className="text-left text-secondary text-14 leading-relaxed">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                        {/* 操作按钮 */}
                        <Button
                          onClick={() => {
                            if (account.type === 'real') {
                              navigate('#/wallet/deposit');
                            } else if (account.type === 'demo') {
                              dispatch(changeAccountType(AccountType.DEMO));
                              navigate('/trade-center');
                            }
                          }}
                          theme={selectedAccount === account.type ? 'primary' : undefined}
                          className={`s1024:w-full mx-auto w-40  h-12 text-16 font-600 rounded-3 transition-all duration-300 ${
                            selectedAccount === account.type && account.type === 'real'
                              ? 'shadow-lg shadow-success/30'
                              : selectedAccount === account.type && account.type === 'demo'
                                ? 'border border-white/30'
                                : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          {account.buttonText}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
          {/* 账户类型指示器 */}
          <div className="flex justify-center mt-6 space-x-3">
            {accountOptions.map((account) => (
              <button
                key={account.type}
                onClick={() => setSelectedAccount(account.type)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  selectedAccount === account.type ? 'bg-success scale-125' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {/* 桌面端布局 */}
      {!mobile && (
        <div className="flex items-center justify-center h-full px-5 s1024:px-8">
          <div className="flex flex-col s1440:flex-row  mx-auto items-center gap-16 w-full" style={{ maxWidth: 1400 }}>
            <motion.div
              className="flex-1 text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-primary text-26 text-center s1440:text-left s1024:text-44 font-700 leading-tight mb-8">
                <Trans i18nKey="Choose Your <br/> Account Type And </br>  Start Trading!" />
              </h2>
              {gt1440 && (
                <motion.div
                  className="relative"
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src={arrow} alt="arrow" className="w-80" />
                </motion.div>
              )}
            </motion.div>
            <div className="flex text-primary flex-row items-center gap-12 px-8">
              {accountOptions.map((account) => {
                const btnTheme = account.type === 'real' ? 'primary' : hoveredType === 'demo' ? 'primary' : undefined;
                return (
                  <motion.div
                    key={account.type}
                    className={cn(
                      'relative rounded-6 w-100 px-8 py-16 border cursor-pointer transition-all border-success/20',
                      account.type === 'demo' && 'py-13 bg-black/5'
                    )}
                    style={{
                      transformOrigin: 'center',
                      zIndex: 10,
                      background:
                        selectedAccount === account.type
                          ? 'radial-gradient(95.44% 136.52% at 98.09% 0.92%, rgba(36, 238, 137, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%)'
                          : '',
                      transformStyle: 'preserve-3d',
                    }}
                    initial={{ scale: selectedAccount === account.type ? 1.15 : 1, opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      zIndex: 10,
                      background:
                        'radial-gradient(95.44% 136.52% at 98.09% 0.92%, rgba(36, 238, 137, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%)',
                      transformStyle: 'preserve-3d',
                    }}
                    onHoverStart={() => {
                      if (account.type === 'demo') {
                        setHoveredType('demo');
                      }
                    }}
                    onHoverEnd={() => {
                      if (account.type === 'demo') {
                        setHoveredType(null);
                      }
                    }}
                  >
                    {selectedAccount === account.type && account.recommended && (
                      <div className="absolute break-words rounded-bl-5 rounded-br-5 whitespace-nowrap bg-colorful12 text-primary_brand px-7 py-2 text-14 font-500 top-0 left-1/2 transform -translate-x-1/2">
                        {t('Recommended for you')}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-20 font-500">{account.title}</h3>
                      <div className="text-right">
                        <p className="text-sm">{account.type === 'real' ? t('Minimum Deposit') : ''}</p>
                        <p className="font-bold">{account.minDeposit}</p>
                      </div>
                    </div>
                    <div className="mb-6">
                      {account.features.map((feature, index) => (
                        <div key={index} className="flex items-start mb-3">
                          <span className="mr-3 flex-shrink-0">→</span>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedAccount(account.type);
                        if (account.type === 'real') {
                          navigate('#/wallet/deposit');
                        } else if (account.type === 'demo') {
                          dispatch(changeAccountType(AccountType.DEMO));
                          navigate('/trade-center');
                        }
                      }}
                      theme={btnTheme}
                      className={`mx-auto block w-50 h-12 text-primary ${account.type === 'demo' && btnTheme !== 'primary' ? 'bg-white/20' : ''}`}
                    >
                      {account.buttonText}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default React.memo(AccountTypeGuidePage);
