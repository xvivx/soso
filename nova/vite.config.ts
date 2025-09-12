import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import InjectSdkCssPlugin from './InjectSdkCssPlugin';
import { version } from './package.json';
import tailwindConfig from './tailwind.config';

const sdkPublicPath = {
  dev: 'https://devwww.exchange2currency.com/',
  test: 'https://testwww.exchange2currency.com/',
  prod: 'https://detrade.com/',
};

const sdk = Boolean(process.env.REACT_APP_SDK);
export default defineConfig(({ mode }) => {
  return {
    root: '.',
    base: sdk ? sdkPublicPath[mode] : '/',
    envDir: './envs',
    envPrefix: 'REACT_APP',
    build: {
      target: ['es2015'],
      assetsInlineLimit: 5 * 1024,
      copyPublicDir: !sdk,
      outDir: 'build',
      emptyOutDir: false,
      rollupOptions: {
        preserveEntrySignatures: sdk ? 'exports-only' : false,
        input: sdk ? './src/trading.tsx' : './index.html',
        output: {
          entryFileNames: sdk ? 'trading.js' : '[hash].js',
          chunkFileNames: '[hash].js',
          assetFileNames: 'assets/[hash][extname]',
          manualChunks: {
            vender: ['react', 'react-dom', 'react-i18next', 'i18next', 'framer-motion'].concat(
              sdk ? [] : ['react-router-dom']
            ),
            libs: ['swr', 'redux', 'react-redux', 'redux-persist', '@reduxjs/toolkit'],
            components: ['src/components/index.ts'],
            utils: ['src/utils/index.ts', 'lodash-es'],
            icons: ['src/components/SvgIcon/index.tsx'],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-popover',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              'input-otp',
            ],
          },
        },
      },
    },
    server: {
      port: 8084,
    },
    define: {
      'process.env.mode': JSON.stringify(mode),
      'process.env.VERSION': JSON.stringify(version),
      'process.env.TailwindMergeClassGroups': JSON.stringify({
        'font-size': Object.keys(tailwindConfig.theme.fontSize).map((val) => `text-${val}`),
        rounded: Object.keys(tailwindConfig.theme.borderRadius).map((val) => `rounded-${val}`),
      }),
    },
    plugins: [
      sdk && InjectSdkCssPlugin(),
      checker({
        typescript: { buildMode: true },
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint --ext .ts,.tsx ./src --max-warnings=0',
        },
      }),
      react(),
      tsconfigPaths(),
      svgr({
        include: 'src/components/SvgIcon/*/**.svg',
        svgrOptions: {
          icon: true,
          svgo: true,
        },
      }),
      Boolean(process.env.USE_STATS) &&
        visualizer({
          open: true,
          filename: 'build/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
      mode === 'prod' && {
        name: 'insert-robots',
        transformIndexHtml(html) {
          return html.replace('<!-- ROBOTS-META -->', '<meta name="robots" content="index,follow" />');
        },
      },
    ],
  };
});
