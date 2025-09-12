import { useEffect } from 'react';
import { FallbackNs, initReactI18next, UseTranslationOptions } from 'react-i18next';
import i18n, { KeyPrefix } from 'i18next';
import { store } from '@store';
import { setLanguage } from '@store/system';
import langs from './langs';

/**
 * 目前存在这样一个问题, 翻译团队没翻译好时我们不能发布,
 * 不然未翻译的地方将会显示成我们传入的key
 * 所以先导入英语的翻译文件做为兜底, 匹配不到key的value时用英语文件中的value
 */
type CommonI18nSchema = typeof import('./langs/en/index.json');
export type ErrorI18nSchema = typeof import('./langs/en/error_code.json');

export type CommonI18nKey = keyof CommonI18nSchema;
type LocaleSchema = {
  common: () => Promise<CommonI18nSchema>;
  error: () => Promise<ErrorI18nSchema>;
};
const context = import.meta.glob<CommonI18nSchema | ErrorI18nSchema>('./langs/**/*.json', {
  import: 'default',
});
type Locales = { [key: string]: LocaleSchema };

// 本地翻译文件夹数据
const locales: Locales = Object.keys(context).reduce((curr: Locales, next: string) => {
  const lang = next.split('/')[2];
  curr[lang] = curr[lang] || {};

  if (next.endsWith('index.json')) {
    curr[lang].common = context[next] as LocaleSchema['common'];
  } else if (next.endsWith('error_code.json')) {
    curr[lang].error = context[next] as LocaleSchema['error'];
  }

  return curr;
}, {} as Locales);

export const languageArr = langs.map((locale) => ({
  label: locale.name,
  value: locale.value,
}));

export async function setLang(lang: string) {
  // langs中的value与翻译文件夹的key对应, alias与第三方的key对应
  const matched = langs.find((t) => t.value === lang || t.alias === lang);
  const locale = locales[matched ? matched.value : 'en'];
  const [common, error] = await Promise.all([locale.common(), locale.error()]);
  i18n.addResource(lang, 'common', '', common);
  i18n.addResource(lang, 'error', '', error);
  i18n.changeLanguage(lang);

  store.dispatch(setLanguage(lang));
}

i18n.use({ type: 'backend' }).use(initReactI18next);

function initialize(lang?: string) {
  lang = lang || store.getState().system.lang || 'en';

  if (!i18n.addResource) {
    i18n.init({
      lng: lang,
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: false,
      },
      resources: {},
      fallbackLng: 'en',
      defaultNS: 'common',
      returnEmptyString: false,
      backend: {
        sources: {},
      },
    });
  }

  setLang(lang);
}

export function useLanguageChanged(callback: () => void) {
  useEffect(() => {
    i18n.on('languageChanged', callback);

    return () => {
      i18n.off('languageChanged', callback);
    };
  }, [callback]);
}

/**
 * ts支持类型检查, 限制传入的字段为json中的key
 **/
Object.assign(i18n, { setLang, initialize, ts: i18n.t });
export default i18n;

// 修正i18n类型错误
declare module 'i18next' {
  export interface CustomTypeOptions {
    defaultNS: 'common';
  }
  export interface i18n {
    setLang: typeof setLang;
    initialize: typeof initialize;
    addResource(
      lng: string,
      ns: string,
      key: string,
      value: CommonI18nSchema | ErrorI18nSchema,
      options?: { keySeparator?: string; silent?: boolean }
    ): i18n;
    ts(
      key: keyof CommonI18nSchema,
      opt?: { ns?: 'common' } & { [key: string | number]: boolean | number | string }
    ): string;
    ts(
      key: keyof ErrorI18nSchema,
      opt: { ns: 'error' } & { [key: string | number]: boolean | number | string }
    ): string;
  }
}

declare module 'react-i18next' {
  export function useTranslation<Ns extends 'common', KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined>(
    ns?: Ns,
    options?: UseTranslationOptions<KPrefix>
  ): {
    t: TFunction<keyof CommonI18nSchema>;
    i18n: typeof i18n;
    ready: boolean;
  };
  export function useTranslation<Ns extends 'error', KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined>(
    ns?: Ns,
    options?: UseTranslationOptions<KPrefix>
  ): {
    t: TFunction<keyof ErrorI18nSchema>;
    i18n: typeof i18n;
    ready: boolean;
  };
}

type TFunction<T> = (key: T, opt?: { [key: string | number]: boolean | number | string }) => string;
