import eslintConfigPrettier from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  extends: [...tseslint.configs.recommended, eslintConfigPrettier, eslintPluginPrettierRecommended],
  files: ['src/**/*.{ts,tsx,js,jsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: {
    react: react,
    'react-hooks': reactHooks,
    prettier: eslintPluginPrettier,
    import: eslintImport,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...react.configs.recommended.rules,
    eqeqeq: ['error', 'always'],
    // 限制近千行的大文件，请尽可能拆分成多个易于维护的适当体积的文件
    'max-lines': ['warn', { max: 500, skipComments: true, skipBlankLines: true }],
    'arrow-body-style': 0,
    'import/no-duplicates': 1,
    'import/no-useless-path-segments': 1,
    'no-extra-boolean-cast': 1,
    '@typescript-eslint/no-unused-expressions': 0,
    '@typescript-eslint/no-unsafe-function-type': 0,
    'object-curly-spacing': [1, 'always'],
    // 使用any类型
    '@typescript-eslint/no-explicit-any': 'off',
    // 将any类型赋值给参数
    '@typescript-eslint/no-unsafe-argument': 'off',
    // 调用any类型
    '@typescript-eslint/no-unsafe-call': 'off',
    // if promise
    '@typescript-eslint/no-misused-promises': ['error', { 'checksVoidReturn': false }],
    // 空语句
    'no-empty': ['error', { 'allowEmptyCatch': true }],
    'prettier/prettier': 1,
    'no-debugger': 1,
    'no-console': ['warn', { 'allow': ['warn', 'error'] }],
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'args': 'all',
        'argsIgnorePattern': '^_',
        'caughtErrors': 'all',
        'caughtErrorsIgnorePattern': '^(_|error)',
        'destructuredArrayIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': false,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        'paths': [
          { name: 'classnames', message: '使用utils中的cn方法代替' },
          { name: 'lodash', message: '使用lodash-es替代' },
          { name: '@/components', message: '使用@components替代' },
          { name: '@/store', message: '使用@store替代' },
          { name: '@/utils', message: '使用@utils' },
        ],
        patterns: [
          {
            group: ['**/useDevice', '**/useDevice.ts', '**/useDevice.tsx'],
            message: '请使用import { useMediaQuery } from "@hooks/useResponsive"',
          },
          {
            group: ['react-router', 'react-router-dom'],
            importNames: ['useHistory'],
            message: '请使用import useNavigate from "@hooks/useNavigate"',
          },
          { group: ['@/components/*'], message: '使用@components/xx替代' },
          { group: ['@/store/*'], message: '使用@store/xx替代' },
          { group: ['@/utils/*'], message: '使用@utils/xx替代' },
          { group: ['@/hooks/*'], message: '使用@hooks/xx替代' },
          { group: ['@/pages/*'], message: '使用@pages/xx替代' },
          { group: ['@/mock/*'], message: '使用@mock/xx替代' },
        ],
      },
    ],
    'no-restricted-syntax': [
      'warn',
      {
        selector: `CallExpression:matches([callee.property.name='toLocaleString'], [callee.property.name='toLocaleDateString'], [callee.property.name='toLocaleTimeString'])`,
        message: '不要自己格式化, 请使用统一工具import { formatter } from "@utils"',
      },
    ],
  },
});
