import { createContext, useContext } from 'react';

export function useNavigateContext() {
  return useContext(Context);
}

const Context = createContext<{ isPopAction: boolean; disableAnimation: boolean }>();

export default Context;
