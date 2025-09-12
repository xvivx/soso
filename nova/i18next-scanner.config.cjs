const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const typescript = require('typescript');

module.exports = {
  input: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/axios.ts'],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'ts'],
      extensions: ['.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      extensions: [],
    },
    lngs: ['en'],
    defaultLng: 'en',
    defaultValue: '',
    resource: {
      loadPath: 'src/i18n/langs/en/index.json',
      savePath: 'src/i18n/langs/en/index.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    metadata: {},
    allowDynamicKeys: false,
    removeUnusedKeys: true,
    sort: true,
  },
  transform: function customTransform(file, enc, done) {
    'use strict';
    const { parser } = this;
    const fileStr = fs.readFileSync(file.path, enc);
    let count = 0;

    // 使用typescript编译器选项来获取输出文本
    const { outputText: content } = typescript.transpileModule(fileStr, {
      compilerOptions: { target: 'esnext' },
      fileName: path.basename(file.path),
    });

    // 解析普通t函数调用
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      parser.set(
        key,
        Object.assign({}, options, {
          defaultValue: key, // 或者你可能想要提供一个更具体的默认值
          nsSeparator: false,
          keySeparator: false,
        })
      );
      ++count;
    });

    // 解析Trans组件中的翻译键
    parser.parseTransFromString(content, (key, options) => {
      if (options && options.i18nKey) {
        key = options.i18nKey;
      }

      parser.set(
        key,
        Object.assign({}, options, {
          defaultValue: key, // 或者你可能想要提供一个更具体的默认值
        })
      );
      ++count;
    });

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
    }

    done();
  },
};
