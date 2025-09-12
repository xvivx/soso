/**
 * 密码强度校验器
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';
import passwordValidate from '@utils/passwordValidate';

const PasswordStrengthMeter = ({ password, className }: { password: string; className?: string }) => {
  const { t } = useTranslation();

  const checkPasswordStrength = () => {
    const { hasValidLength, hasUpperCase, hasLowerCase, hasNumber, hasSymbol } = passwordValidate(password);

    let strengthFactors = 0;
    if (hasNumber) strengthFactors++;
    if (hasUpperCase) strengthFactors++;
    if (hasLowerCase) strengthFactors++;
    if (hasSymbol) strengthFactors++;

    // 5个要素(8-32位, 数字, 大写字母, 小写字母, 特殊符号)
    // 弱(3个要素)：8-32位 + 2个要素
    const isWeak = hasValidLength && strengthFactors >= 2;
    // 中(4个要素)：8-32位 + 3个要素
    const isMedium = hasValidLength && strengthFactors >= 3;
    // 强(5个要素)：8-32位 + 4个要素
    const isStrong = hasValidLength && strengthFactors >= 4;

    if (isStrong) return t('strong');
    if (isMedium) return t('medium');
    if (isWeak || password) return t('weak');
    return '';
  };

  const strength = checkPasswordStrength();

  const getProgress = () => {
    switch (strength) {
      case t('weak'):
        return 'bg-error w-1/3';
      case t('medium'):
        return 'bg-warn w-1/2';
      case t('strong'):
        return 'bg-brand w-full';
      default:
        return 'bg-inherit w-0';
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="w-full bg-layer4 rounded-1.5">
        <div className={cn('h-1 rounded-full transition-all duration-300', getProgress())}></div>
      </div>
      <span className="text-12 text-tertiary">
        {t('Password strength')}: {strength}
      </span>
    </div>
  );
};

export default memo(PasswordStrengthMeter);
