import { useMemo } from 'react';
import { detradePortal } from '@utils/others';

export default function usePortalRootElement() {
  return useMemo(() => (import.meta.env.REACT_APP_SDK ? detradePortal.root : document.body)!, []);
}
