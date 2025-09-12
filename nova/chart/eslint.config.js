import eslintConfigPrettier from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  extends: [...tseslint.configs.recommended, eslintConfigPrettier, eslintPluginPrettierRecommended],
  files: ['src/**/*.{ts,js}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: {
    prettier: eslintPluginPrettier,
    import: eslintImport,
  },
  rules: {
    ...eslintPluginPrettierRecommended.rules,
    '@typescript-eslint/no-unused-expressions': 'off',
  },
});
