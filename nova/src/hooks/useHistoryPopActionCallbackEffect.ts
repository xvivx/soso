import { useEffect, useRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';
import { useNavigateContext } from '@/NavigateContext';
import useMemoCallback from './useMemoCallback';

/** 当传入的visible为true时push当前的url, 浏览器返回时会执行callback */
export default function useHistoryPopActionCallbackEffect(visible: boolean, callback: () => void) {
  const history = useHistory();
  const { isPopAction } = useNavigateContext();
  const hasPushedHistoryRef = useRef(false);
  const callbackRef = useMemoCallback(callback);

  useEffect(() => {
    if (isPopAction) {
      hasPushedHistoryRef.current = false;
      callbackRef();
    }
  }, [isPopAction, callbackRef]);

  useEffect(() => {
    if (!visible) {
      hasPushedHistoryRef.current && history.goBack();
      hasPushedHistoryRef.current = false;
    } else if (!hasPushedHistoryRef.current) {
      hasPushedHistoryRef.current = true;
      history.push(window.location);
    }
  }, [history, visible]);
}
