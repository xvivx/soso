/**
 * 账户类型切换动画
 */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { setAccountTypeTransition, useAccountTypeTransition } from '@store/system';
import { AccountType, useAccountType } from '@store/wallet';
import { Button, Image, Modal } from '@components';
import Logo from '@pages/components/Logo';
import rewardBox from './assets/rewardBox.png';

const AccountTypeTransition = () => {
  const accountType = useAccountType();
  const { visible, shownDemoModal } = useAccountTypeTransition();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleAnimationComplete = useCallback(() => {
    dispatch(setAccountTypeTransition({ visible: false }));
    // 动画完成后检查是否需要打开弹窗
    if (accountType === AccountType.DEMO && !shownDemoModal) {
      // 首次使用Demo模式需要做弹窗提示
      dispatch(setAccountTypeTransition({ shownDemoModal: true }));
      Modal.open({
        title: ' ', // hack - 这里需要关闭按钮但不需要title
        children: <DemoTrading />,
        size: 'sm',
        closable: false,
      });
    }
  }, [accountType, shownDemoModal, dispatch]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-max bg-layer3 flex-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            onAnimationComplete={handleAnimationComplete}
            className="text-16 font-700 text-center"
          >
            <div className="text-16 s768:text-32 mb-19">{t('Welcome To')}</div>
            {accountType === AccountType.DEMO && (
              <div className="text-30 s768:text-[72px] text-brand">{t('Demo Trading')}</div>
            )}
            {accountType === AccountType.REAL && <Logo className="w-26 h-7 scale-150 s768:scale-[3] mx-auto" />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountTypeTransition;

function DemoTrading() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 text-center">
      <Image src={rewardBox} className="w-36 h-30 mx-auto" />
      <div className="text-16">{t('Welcome To Demo Trading ')}</div>
      <Button
        onClick={() => {
          Modal.close();
        }}
        size="lg"
      >
        {t('Trade with $10,000 in virtual funds')}
      </Button>
    </div>
  );
}
