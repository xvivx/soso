/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_DEPLOY_ENV: string;
  readonly VITE_TRADE_API_URL: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    VERSION: string;
    mode: 'dev' | 'test' | 'prod';
    TailwindMergeClassGroups: {
      [key: string]: string[];
    };
  }
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}
