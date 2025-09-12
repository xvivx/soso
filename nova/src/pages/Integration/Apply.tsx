import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Checkbox, FormItem, Input, message, Radio, Select } from '@components';
import { request } from '@utils/axios';
import RegexValidator from '@utils/RegexValidator';
import i18n from '@/i18n';

/**
 * @description API接口地址配置
 */
const API = {
  PLATFORM_SAVE: '/api/tob/platform/apply',
};

const USER_OPTIONS = [
  { label: '100-500', value: 'FIVE_HUNDRED' },
  { label: '500-1000', value: 'ONE_THOUSAND' },
  { label: '1000-10000', value: 'TEN_THOUSAND' },
];

/**
 * @description 获取选项的第一个值
 */
const getFirstOptionValue = (options: Array<{ value: string }>) => {
  return options[0]?.value || '';
};

/**
 * @description 表单数据接口 - 用于UI展示
 */
interface IFormData {
  contactPerson?: string;
  email: string;
  country?: string;
  name: string;
  website: string;
  targetMarket: string[];
  activeUsers: string;
  type: string[];
  legalQualifications: string;
  remarks?: string;
}

/**
 * @description 表单错误状态接口
 * @interface IFormErrors
 */
type IFormErrors = {
  [K in keyof Omit<IFormData, 'contactPerson' | 'country' | 'remarks'>]?: string | null;
};

/**
 * @description 表单验证规则类型
 */
type IValidationRule = {
  required?: boolean;
  validator?: (value: any) => string | null;
};

/**
 * @description 表单验证规则配置
 */
const validationRules: Partial<Record<keyof IFormData, IValidationRule>> = {
  email: {
    required: true,
    validator: (value) => {
      if (!RegexValidator.isValidEmail(value?.trim())) {
        return i18n.t('Invalid email');
      }
      return null;
    },
  },
  name: { required: true },
  website: { required: true },
  activeUsers: { required: true },
  legalQualifications: { required: true },
  targetMarket: { required: true },
  type: { required: true },
};

/**
 * @component 申请表单组件
 * @description 集成申请表单，用于收集用户申请信息
 */
const IntegrationApply = () => {
  const { mobile } = useMediaQuery();
  const { t } = useTranslation();

  const MARKET_OPTIONS = useMemo(() => {
    return [
      { label: t('AS'), value: 'AS' },
      { label: t('EU'), value: 'EU' },
      { label: t('NA'), value: 'NA' },
      { label: t('SA'), value: 'SA' },
      { label: t('AF'), value: 'AF' },
      { label: t('AU'), value: 'AU' },
    ];
  }, [t]);
  const PLATFORM_TYPE_OPTIONS = useMemo(() => {
    return [
      { label: t('Exchange'), value: 'EXCHANGE' },
      { label: t('Betting'), value: 'BETTING' },
    ];
  }, [t]);
  const LEGAL_OPTIONS = useMemo(() => {
    return [
      { label: t('Yes'), value: 'HAVE' },
      { label: t('No'), value: 'NONE' },
      { label: t('Applying'), value: 'APPLYING' },
    ];
  }, [t]);
  const FIELD_LABELS = useMemo(() => {
    return {
      contactPerson: t('Name'),
      email: t('Email'),
      country: t('Country'),
      name: t('Platform Name'),
      website: t('Platform Website'),
      targetMarket: t('Target Market'),
      activeUsers: t('Daily Active Users'),
      type: t('Platform Type'),
      legalQualifications: t('Does the company have the legal qualifications to carry out relevant business?'),
      remarks: t('Remarks'),
    };
  }, [t]);
  const DEFAULT_FORM_DATA = useMemo(() => {
    return {
      contactPerson: '',
      email: '',
      country: '',
      name: '',
      website: '',
      targetMarket: [getFirstOptionValue(MARKET_OPTIONS)],
      activeUsers: getFirstOptionValue(USER_OPTIONS),
      type: [getFirstOptionValue(PLATFORM_TYPE_OPTIONS)],
      legalQualifications: getFirstOptionValue(LEGAL_OPTIONS),
      remarks: '',
    };
  }, [MARKET_OPTIONS, PLATFORM_TYPE_OPTIONS, LEGAL_OPTIONS]);
  const [formData, setFormData] = useState<IFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<IFormErrors>({});

  /**
   * @description 验证单个字段
   * @param {keyof IFormData} field - 字段名
   * @param {any} value - 字段值
   * @returns {boolean} 验证是否通过
   */
  const validateField = useCallback(
    (field: keyof IFormData, value: any) => {
      const rules = validationRules[field];
      // 如果字段没有验证规则，直接返回true
      if (!rules) return true;

      let error: string | null = null;
      const fieldLabel = FIELD_LABELS[field] || field; // 获取字段的国际化文本

      // 必填验证
      if (rules.required) {
        if (Array.isArray(value)) {
          // 数组类型字段验证
          if (value.length === 0) {
            error = t('{{field}} is required', { field: fieldLabel });
          }
        } else {
          // 字符串类型字段验证
          if (!value?.toString()?.trim()) {
            error = t('{{field}} is required', { field: fieldLabel });
          }
        }
      }

      // 自定义验证
      if (!error && rules.validator) {
        error = rules.validator(value);
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
      return !error;
    },
    [t, FIELD_LABELS]
  );

  /**
   * @description 处理表单字段变化
   */
  const handleChange = useCallback(
    (field: keyof IFormData, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (validationRules[field]) {
        validateField(field, value);
      }
    },
    [validateField]
  );

  /**
   * @description 重置表单数据
   */
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
  }, [DEFAULT_FORM_DATA]);

  /**
   * @description 处理表单提交
   */
  const handleSubmit = useCallback(async () => {
    const response = await request.post(API.PLATFORM_SAVE, formData);

    if (response) {
      resetForm();
      message.success(t('We will contact you within 3 working days, please check your email regularly'));
    }
  }, [formData, t, resetForm]);

  // 表单验证
  const isValid = useMemo(() => {
    return Object.keys(validationRules).every((field) => {
      const key = field as keyof IFormData;
      const value = formData[key];
      const rules = validationRules[key];

      if (!rules) return true;

      if (rules.required && !value?.toString()?.trim()) {
        return false;
      }

      if (rules.validator) {
        return !rules.validator(value);
      }

      return true;
    });
  }, [formData]);

  return (
    <div className="p-4 s768:p-8 bg-layer4 rounded-3">
      <div className="space-y-3 s768:space-y-4">
        {/* Name */}
        <FormItem label={FIELD_LABELS.contactPerson}>
          <Input
            value={formData.contactPerson}
            onChange={(value) => handleChange('contactPerson', value)}
            className="bg-layer3"
            size="lg"
          />
        </FormItem>

        {/* Email */}
        <FormItem label={FIELD_LABELS.email} required error={errors.email}>
          <Input
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            onBlur={() => validateField('email', formData.email)}
            className="bg-layer3"
            size="lg"
          />
        </FormItem>

        {/* Country */}
        <FormItem label={FIELD_LABELS.country}>
          <Input
            value={formData.country}
            onChange={(value) => handleChange('country', value)}
            className="bg-layer3"
            size="lg"
          />
        </FormItem>

        {/* Platform Name */}
        <FormItem label={FIELD_LABELS.name} required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(value) => handleChange('name', value)}
            onBlur={() => validateField('name', formData.name)}
            className="bg-layer3"
            size="lg"
          />
        </FormItem>

        {/* Platform Website */}
        <FormItem label={FIELD_LABELS.website} required error={errors.website}>
          <Input
            value={formData.website}
            onChange={(value) => handleChange('website', value)}
            onBlur={() => validateField('website', formData.website)}
            className="bg-layer3"
            size="lg"
          />
        </FormItem>

        {/* Target Market */}
        <FormItem label={FIELD_LABELS.targetMarket} required error={errors.targetMarket}>
          <Checkbox.Group
            className="flex flex-col gap-3 s768:flex-row s768:space-x-8 s768:gap-0"
            options={MARKET_OPTIONS}
            value={formData.targetMarket}
            onChange={(value) => handleChange('targetMarket', value)}
          />
        </FormItem>

        {/* Daily Active Users */}
        <FormItem label={FIELD_LABELS.activeUsers} required error={errors.activeUsers}>
          <Select
            options={USER_OPTIONS}
            value={formData.activeUsers}
            onChange={(value) => handleChange('activeUsers', value)}
          />
        </FormItem>

        {/* Platform Type */}
        <FormItem label={FIELD_LABELS.type} required error={errors.type}>
          <Checkbox.Group
            className="flex flex-col gap-3 s768:flex-row s768:space-x-8 s768:gap-0"
            options={PLATFORM_TYPE_OPTIONS}
            value={formData.type}
            onChange={(value) => handleChange('type', value)}
          />
        </FormItem>

        {/* Legal Qualification */}
        <FormItem label={FIELD_LABELS.legalQualifications} required error={errors.legalQualifications}>
          <Radio.Group
            className="flex flex-col gap-3 s768:flex-row s768:space-x-8 s768:gap-0"
            value={formData.legalQualifications}
            orientation={mobile ? 'vertical' : 'horizontal'}
            onValueChange={(value) => handleChange('legalQualifications', value)}
            options={LEGAL_OPTIONS}
          />
        </FormItem>

        {/* Remarks */}
        <FormItem label={FIELD_LABELS.remarks}>
          <Input.Textarea
            rows={mobile ? 6 : 5}
            maxLength={4000}
            className="w-full bg-layer3"
            value={formData.remarks}
            onChange={(value) => handleChange('remarks', value)}
          />
        </FormItem>
      </div>

      <div className="mt-3 s768:text-right s768:mt-4">
        <Button disabled={!isValid} onClick={handleSubmit} size="lg" className="w-full s768:w-auto">
          {t('Submit')}
        </Button>
      </div>
    </div>
  );
};

IntegrationApply.displayName = 'IntegrationApply';

export default IntegrationApply;
