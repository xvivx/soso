// eslint-disable-next-line no-restricted-imports
import classnames, { type Argument } from 'classnames';
import { extendTailwindMerge } from 'tailwind-merge';

export { default as formatter } from './formatter';
export * from './axios';

const merge = extendTailwindMerge({
  override: {
    conflictingClassGroups: {
      'font-size': [],
    },
  },
  extend: {
    classGroups: Object.assign(process.env.TailwindMergeClassGroups, {
      display: ['flex-center'],
      position: ['abs-center'],
      'max-h': ['max-h-none'],
    }),
  },
});

export function cn(...inputs: Argument[]) {
  return merge(classnames(...inputs)) || undefined;
}

interface QueryParams {
  [key: string]: string | number;
}

export function appendQueryParams(url: string, params: QueryParams = {}) {
  const hasParamsRegex = /\?([\w]+=[\w]+)/;
  const alreadyHasParams = hasParamsRegex.test(url);

  const stringified = `${Object.entries(params)
    .reduce((next, [key, value]) => {
      return next + `${key}=${value}&`;
    }, '')
    .slice(0, -1)}`;

  return `${url}${alreadyHasParams ? '&' : '?'}${stringified}`;
}

export function validateEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

const ua = navigator.userAgent;
export const Systems = {
  device: {
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /(android)/i.test(ua),
  },
  browser: {
    isChrome: /Chrome/.test(ua),
  },
  PublicPath: import.meta.env.BASE_URL,
};

export function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

export function download(url: string, name: string) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.png`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
