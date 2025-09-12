import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig(() => {
  return {
    root: '.',
    base: '/chart-iframe/',
    build: {
      emptyOutDir: true,
      target: ['es2015'],
      assetsInlineLimit: 10 * 1024,
      outDir: '../public/chart-iframe',
      rollupOptions: {
        output: {
          manualChunks: {
            cores: ['chartiq/js/advanced', 'chartiq/js/defaultConfiguration', 'chartiq/key'],
            comps: ['chartiq/js/componentUI', 'chartiq/js/components', 'chartiq/js/addOns'],
          },
        },
      },
    },
    server: {
      port: 8088,
    },

    plugins: [
      checker({
        typescript: { buildMode: true },
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint --ext .ts ./src',
        },
      }),
      Boolean(process.env.USE_STATS) &&
        visualizer({
          open: true,
          filename: '../build/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ],
  };
});
