/**
 * 密码校验规则
 */
import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem } from '@components';
import passwordValidate from '@utils/passwordValidate';

function PasswordRuleItems({ password }: { password: string }) {
  const { hasValidLength, hasUpperCase, hasLowerCase, hasNumber, hasSymbol } = passwordValidate(password);
  const { t } = useTranslation();

  return (
    <FormItem label="" className="space-y-2">
      <RuleItem value={hasValidLength}>{t('Minimum {{min}} characters', { min: 8 })}</RuleItem>
      <RuleItem value={hasNumber}>{t('At least {{exceed}} number', { exceed: 1 })}</RuleItem>
      <RuleItem value={hasUpperCase || hasLowerCase}>{t('Uppercase or lowercase letters')}</RuleItem>
      <RuleItem value={hasSymbol}>{t('Symbol for extra security')}</RuleItem>
    </FormItem>
  );
}

function RuleItem({ children, value }: { children: ReactNode; value: boolean }) {
  return (
    <div className="text-12 s768:text-14 font-500 text-secondary flex items-center gap-2">
      {value ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
          <path
            d="M0 8.60547C0 6.74553 0 5.81555 0.204445 5.05255C0.759248 2.982 2.37653 1.36472 4.44709 0.809914C5.21008 0.605469 6.14006 0.605469 8 0.605469C9.85994 0.605469 10.7899 0.605469 11.5529 0.809914C13.6235 1.36472 15.2408 2.982 15.7956 5.05255C16 5.81555 16 6.74553 16 8.60547C16 10.4654 16 11.3954 15.7956 12.1584C15.2408 14.2289 13.6235 15.8462 11.5529 16.401C10.7899 16.6055 9.85994 16.6055 8 16.6055C6.14006 16.6055 5.21008 16.6055 4.44709 16.401C2.37653 15.8462 0.759248 14.2289 0.204445 12.1584C0 11.3954 0 10.4654 0 8.60547Z"
            fill="#24EE89"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.4782 6.69338L7.58386 11.7316C7.25817 12.0669 6.73014 12.0669 6.40446 11.7316L3.52148 8.76387C3.91114 8.28619 4.57673 7.67039 4.93147 7.36896L6.99416 9.44619C6.99416 9.44619 10.1922 6.04691 10.9625 5.25391C11.3635 5.61654 12.0726 6.21476 12.4782 6.69338Z"
            fill="#232626"
          />
        </svg>
      ) : (
        <div className="size-4 rounded-1.5 border-2 border-thirdly" />
      )}
      {children}
    </div>
  );
}

export default memo(PasswordRuleItems);
