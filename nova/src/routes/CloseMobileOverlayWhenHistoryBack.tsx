import useHistoryPopActionCallbackEffect from '@hooks/useHistoryPopActionCallbackEffect';
import { useOverlayContext } from '@components/FunctionRender';

function CloseMobileOverlayWhenHistoryBack() {
  const [visible, closeAllOverlay] = useOverlayContext();
  useHistoryPopActionCallbackEffect(visible, closeAllOverlay);
  return null;
}

export default CloseMobileOverlayWhenHistoryBack;
