/**
 * @file RegexValidator.ts
 * @description 正则表达式验证工具类
 */

/**
 * @class RegexValidator
 * @description 常用正则表达式验证工具类
 */
class RegexValidator {
  /**
   * @description 邮箱验证正则
   * @private
   * @description 基础邮箱格式验证:
   * 1. 包含@符号
   * 2. @前后都要有内容
   * 3. 域名部分要有.并且后面至少有内容
   */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * @description 验证邮箱格式
   * @param {string} email - 待验证的邮箱地址
   * @returns {boolean} 验证结果
   */
  static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }
}

export default RegexValidator;
