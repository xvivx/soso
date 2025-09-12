import autoprefixer from 'autoprefixer';
import nesting from 'postcss-nested';
import postcssPrefixSelector from 'postcss-prefix-selector';
import tailwindcss from 'tailwindcss';

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    nesting(),
    tailwindcss(),
    autoprefixer(),
    process.env.REACT_APP_SDK &&
      postcssPrefixSelector({
        // 加上前缀防止冲突
        prefix: '.detrade',
        transform(prefix, selector, prefixed) {
          if (selector === 'html') return prefix;
          if (selector.startsWith('.detrade') && selector !== '.detrade-button') return selector;
          return prefixed;
        },
      }),
  ],
};
