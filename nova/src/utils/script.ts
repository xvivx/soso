import { memoize } from 'lodash-es';

export const loadScript = memoize<<T>(url: string, exp?: string, id?: string) => Promise<T>>(
  (url: string, exp?: string, id?: string) => {
    return new Promise((resolve, reject) => {
      const head = document.head || document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.async = true;
      script.src = url;
      if (id) {
        script.id = id;
      }

      head.appendChild(script);

      script.onload = () => {
        const res = exp ? window[exp as keyof Window] : null;
        head.removeChild(script);
        resolve(res);
      };
      script.onerror = () => {
        head.removeChild(script);

        loadScript.cache.delete(`${url}:${exp}`);
        reject(new Error(`Load Script Error: ${url}`));
      };
    });
  },
  (url, exp) => `${url}:${exp}`
);
