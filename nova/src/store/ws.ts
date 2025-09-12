import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import useDocumentVisible from '@hooks/useDocumentVisible';
import useMemoCallback from '@hooks/useMemoCallback';
// eslint-disable-next-line no-restricted-imports
import useDevice from '@components/FunctionRender/useDevice';
import createWebsocket, { ReadyState, WebSocketMessage } from '@utils/ws';

export { ReadyState } from '@utils/ws';

const { create, send, addEvent, getInstance } = createWebsocket(import.meta.env.REACT_APP_TRADE_WS, true);

export function useTradingWebsocket() {
  const documentVisible = useDocumentVisible();
  const token = useSelector((state) => state.user.token);
  const accountType = useSelector((state) => state.account.type);
  const { mobile } = useDevice();
  const wsParams = useMemo(() => {
    return {
      token: token || 'temporary',
      device: mobile ? 'web-phone' : 'web-pc',
      type: accountType,
      cid: window.btoa(navigator.userAgent),
    };
  }, [token, accountType, mobile]);

  useEffect(() => {
    if (!documentVisible || !wsParams.token) return;
    return create(wsParams);
  }, [wsParams, documentVisible]);
}

export function useOnMessage(listener: (message: WebSocketMessage<any>) => void) {
  const memo = useMemoCallback(listener);
  useEffect(() => {
    return addEvent('message-change', memo);
  }, [memo]);
}

function useSendMessage() {
  const token = useSelector((state) => state.user.token);
  const state = useReadyStateChange();
  return useCallback(
    (cmd: string, req?: string) => {
      if (state !== ReadyState.OPEN) return;
      send(token, cmd, req);
    },
    [token, state]
  );
}

function useReadyStateChange() {
  const [readyState, setReadyState] = useState(() => {
    const ws = getInstance();
    return ws ? ws.readyState : ReadyState.CONNECTING;
  });

  useEffect(() => {
    return addEvent('state-change', setReadyState);
  }, []);

  return readyState;
}

export function useWebsocket() {
  const readyState = useReadyStateChange();
  const sendMessage = useSendMessage();
  return { readyState, useOnMessage, sendMessage };
}
