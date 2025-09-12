/**
 * 密码规则校验
 * @param password 密码字符串
 * @returns
 * hasValidLength - 是否满足位数限制; hasUpperCase - 是否有大写; hasLowerCase - 是否有小写; hasNumber - 是否有数字; hasSymbol - 是否有特殊符号
 */
export default function passwordValidate(password: string) {
  const hasValidLength = password.length >= 8 && password.length <= 32;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const strengthFactors = [hasNumber, hasUpperCase, hasLowerCase, hasSymbol].filter(Boolean).length;
  // 检查密码强度是否达到提交标准 - 中等(8-32位 + 3个要素)
  const isMediumStrength = hasValidLength && strengthFactors >= 3;

  return {
    hasValidLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSymbol,
    isMediumStrength,
  };
}
