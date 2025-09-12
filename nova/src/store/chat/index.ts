import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';
import { useUserInfo } from '@store/user';
import useDocumentVisible from '@hooks/useDocumentVisible';
import useMemoCallback from '@hooks/useMemoCallback';
import { request } from '@utils';
import createWebsocket, { MessageListener, ReadyState } from '@utils/ws';
import { ContentType } from '@/type';
import { setChatVisible } from '../system';

export interface ChatItem {
  avatar: string;
  content: string;
  contentType: ContentType;
  id: number;
  nickName: string;
  room: string;
  time: number;
  type: string;
  userId: number;
}

export const useChatVisible = () => {
  const visible = useSelector((state) => state.system.chat.visible);
  const dispatch = useDispatch();
  const changeVisible = useMemoCallback((visible: boolean) => {
    dispatch(setChatVisible(visible));
  });

  return [visible, changeVisible] as const;
};

const { create, send, addEvent, getInstance } = createWebsocket(import.meta.env.REACT_APP_MESSAGE_WS, false);

export function useMessageWebsocketConnect() {
  const token = useSelector((state) => state.user.token);
  const documentVisible = useDocumentVisible();

  useEffect(() => {
    if (!token || !documentVisible) return;
    return create({ token, cid: window.btoa(navigator.userAgent) });
  }, [documentVisible, token]);
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

function useOnMessage(listener: MessageListener) {
  const memo = useMemoCallback(listener);
  useEffect(() => {
    return addEvent('message-change', memo);
  }, [memo]);
}

export function useWebsocket() {
  const readyState = useReadyStateChange();
  const sendMessage = useSendMessage();
  return { readyState, useOnMessage, sendMessage };
}

/** 获取历史聊天室数据 */
export function useChatHistory() {
  return useSWR(
    ['chat-history'],
    async function fetchChatRoomEn() {
      const chats = await request.get<ChatItem[]>('/api/message/chat/room/en/get');
      return chats.reverse();
    },
    { fallbackData: [] }
  );
}

/** 获取最新chat数据 */
export function useChatList() {
  const { useOnMessage, sendMessage: sendWsMessage } = useWebsocket();
  const { data: chatHistory, mutate: mutateHistory } = useChatHistory();
  const { avatar, nickName, id } = useUserInfo().data;

  useEffect(() => {
    // 订阅聊天消息
    sendWsMessage('/chat/room/en/subscribe');
    return () => sendWsMessage('/chat/room/en/unsubscribe');
  }, [sendWsMessage]);

  useOnMessage((message) => {
    if (message.cmd !== '/chat/room/en') return;
    const chatMessage = message.resp as ChatItem;
    mutateHistory((currentData = []) => {
      // 移除相同ID的乐观更新消息（如果有）
      const filtered = currentData.filter(
        (msg) => !('isOptimistic' in msg && msg.userId === chatMessage.userId && msg.content === chatMessage.content)
      );
      return [...filtered, chatMessage];
    }, false);
  });

  const sendMessage = async (content: string, contentType: ContentType) => {
    const tempId = Date.now();
    const optimisticMessage: ChatItem & { isOptimistic: boolean } = {
      content,
      contentType,
      avatar,
      nickName,
      id: tempId,
      room: 'en',
      time: Date.now(),
      type: '0',
      userId: Number(id),
      isOptimistic: true, // 标记为乐观更新
    };

    mutateHistory((currentData = []) => [...currentData, optimisticMessage], false);

    try {
      return await request.post<ChatItem>('/api/message/chat/room/en/send', {
        content,
        type: 'live',
        contentType,
      });
    } catch (error) {
      // 出错回滚
      mutateHistory(
        (currentData = []) => currentData.filter((msg) => !(msg.id === tempId && 'isOptimistic' in msg)),
        false
      );
      throw error;
    }
  };

  return {
    chatList: chatHistory || [],
    sendMessage,
  };
}
