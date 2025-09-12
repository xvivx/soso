import pako from 'pako';
import { message } from '@components';
import { appendQueryParams } from '@utils';
import { generateUUID } from '@utils/others';

export enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export type WebSocketMessage<T> = {
  cmd: string;
  status: number;
  error: string;
  resp: T;
};

export type StateListener = (state: ReadyState) => void;
export type MessageListener = (message: WebSocketMessage<any>) => void;

export default function createWebsocket(baseUrl: string, usePako?: boolean) {
  let ws: WebSocket | null = null;
  const timers: Record<'ping', NodeJS.Timeout | undefined> = { ping: undefined };
  function destroy() {
    try {
      if (!ws) return;

      ws.onopen = () => null;
      ws.onclose = () => null;
      ws.onmessage = () => null;
      ws.readyState === ReadyState.OPEN && ws.close();
      ws = null;
    } finally {
      clearInterval(timers.ping);
    }
  }

  function create(params: { token: string; [key: string]: string | number }) {
    const url = appendQueryParams(baseUrl, params);
    if (!ws || ws.url !== url || ws.readyState === ReadyState.CLOSING || ws.readyState === ReadyState.CLOSED) {
      destroy();
      listeners.state.forEach((listener) => listener(ReadyState.CONNECTING));

      // 心跳检查
      clearInterval(timers.ping);
      timers.ping = setInterval(() => {
        if (!ws || ws.readyState !== ReadyState.OPEN) {
          document.visibilityState === 'visible' && create(params);
          return;
        }

        ws.send(formatReqParams({ cmd: 'ping', token: params.token }));
      }, 5 * 1000);

      ws = new WebSocket(url);
      ws.onopen = () => {
        listeners.state.forEach((listener) => listener(ReadyState.OPEN));
      };

      ws.onmessage = (event) => {
        const blob: Blob = event.data;
        if (!blob) return;

        blob.arrayBuffer().then((buffer) => {
          if (usePako) {
            buffer = pako.inflate(buffer);
          } else {
            buffer = new Uint8Array(buffer);
          }
          const decoder = new TextDecoder();
          const wsRes = JSON.parse(decoder.decode(buffer)) as WebSocketMessage<any>;
          if (wsRes.resp) {
            window.requestAnimationFrame(() => {
              listeners.message.forEach((listener) => listener(wsRes));
            });
          } else if (wsRes.error) {
            // 捕捉socket层面报错
            if (wsRes.status === 408) {
              // 长时间不活跃, 因为有心跳, 按逻辑讲不可能发生
              destroy();
              // 程序在前台才重建
              document.visibilityState === 'visible' && create(params);
              return;
            }
            message.error(wsRes.error || 'Server error: ' + wsRes.status);
          }
        });
      };

      ws.onclose = () => {
        listeners.state.forEach((listener) => listener(ReadyState.CLOSED));
      };
    }

    return destroy;
  }

  function formatReqParams(data: { token: string; cmd: string; req?: string }) {
    const encoder = new TextEncoder();
    const params = {
      ...data,
      cid: window.btoa(navigator.userAgent),
      reqId: generateUUID(),
    };

    const encodeJson = encoder.encode(JSON.stringify(params));

    if (usePako) {
      return pako.deflate(encodeJson);
    }

    return encodeJson;
  }

  function send(token: string, cmd: string, req?: string) {
    if (ws?.readyState === ReadyState.OPEN && ws.readyState === ReadyState.OPEN) {
      ws.send(formatReqParams({ cmd, token, req }));
    }
  }

  const listeners: { state: StateListener[]; message: MessageListener[] } = {
    state: [],
    message: [],
  };

  function addEvent(type: 'state-change', listener: StateListener): void;
  function addEvent(type: 'message-change', listener: MessageListener): void;
  function addEvent(type: 'state-change' | 'message-change', listener: StateListener | MessageListener) {
    if (type === 'state-change') {
      ws && (listener as StateListener)(ws.readyState);
      listeners.state.push(listener as StateListener);
      return () => {
        listeners.state = listeners.state.filter((item) => item !== listener);
      };
    } else {
      listeners.message.push(listener as MessageListener);
      return () => {
        listeners.message = listeners.message.filter((item) => item !== listener);
      };
    }
  }

  function getInstance() {
    return ws;
  }

  return { create, send, addEvent, getInstance };
}
