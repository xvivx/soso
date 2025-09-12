## API document

### SDK entry

```sh
# prod
entry = https://detrade.com
```

### Simple Example

#### Use script tag

```ts
// step 1: load script
const script = document.createElement('script');
script.async = true;
script.type = 'module';
script.src = `${entry}/trading.js`;
document.body.appendChild(script);
// step 2: create app
const app = new Trading({ container: 'The element that you want to render' });
// step 3: render or update
app.render({
  accessCode: 'Your access code from backend',
});
// last: unmount app if you need
app.unmount();
```

#### Or use import

```ts
import Trading from 'https://detrade.com/trading.js';

const app = new Trading({ container: 'The element that you want to render' });
app.render({
  accessCode: 'Your access code from backend',
});
// unmount app if you need
app.unmount();
```

### Typescript

```ts
type TradeAppOptions = {
  // app container
  container: HTMLElement;
  // access code
  accessCode?: string;
  // game type
  type?: 'trading' | 'contract' | 'up-down' | 'spread';
  // i18n, default: 'en'
  lang?:
    | 'en'
    | 'en-IN'
    | 'vi'
    | 'id'
    | 'ja'
    | 'ko'
    | 'fr'
    | 'es-ES'
    | 'fil'
    | 'ar'
    | 'hi'
    | 'tr'
    | 'fa'
    | 'pt-PT'
    | 'ru'
    | 'de'
    | 'th'
    | 'fi'
    | 'pl'
    | 'it'
    | 'my'
    | 'nl'
    | 'ur-PK'
    | 'uk'
    | 'ms'
    | 'bn-IN'
    | 'mr'
    | 'ta'
    | 'te'
    | 'zh-CN'
    | 'zh-TW';
  // theme, default: 'darken'
  theme?: 'darken' | 'lighten';
  // login function
  onLogin?: () => void;
  // register function
  onRegister?: () => void;
  // recharge function
  onRecharge?: () => void;
  // refresh session function
  onSessionRefresh?: () => void;
  // refresh token function
  onTokenExpired?: () => void;
  // game loaded callback
  onLoad?: () => void;
};

declare global {
  interface Trading {
    new (options: TradeAppOptions): Trading;

    render: (options: Omit<TradeAppOptions, 'container'>) => Promise<void>;
    unmount: () => Promise<void>;
  }
  interface Window {
    Trading: Trading;
  }
}
```
