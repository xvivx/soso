import 'react';

declare module 'react' {
  function createContext<T>(defaultValue?: T): Context<T>;
}
