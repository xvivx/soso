import { Fragment, memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatItem, useChatList, useChatVisible, useMessageWebsocketConnect } from '@store/chat';
import { useUserInfo } from '@store/user';
import useMemoCallback from '@hooks/useMemoCallback';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Image, Input, Modal, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { ContentType } from '@/type';
import Emoji from './emoji';
import Gif from './gif';
import { assetsList } from './gif/config';

// messageStyles.base的样式放在内层定义是为了减少dom层级
const messageStyles = {
  base: 'p-3 rounded-2 bg-layer5 w-fit',
  word: 'max-w-full break-words text-12',
  emoji: 'size-30',
};
const Message = (props: { message: ChatItem }) => {
  const { message } = props;

  const content = useMemo(() => {
    if (message.contentType === ContentType.Emoji) {
      const asset = assetsList.find((asset) => asset.key === message.content);
      return <Image src={asset?.url} className={`${messageStyles.base} ${messageStyles.emoji}`} />;
    }
    return <div className={`${messageStyles.base} ${messageStyles.word}`}>{message.content}</div>;
  }, [message]);

  return (
    <div className="flex gap-2.5">
      <Image src={message.avatar} className="size-11 border-4 border-layer2 rounded-full shrink-0" />
      <div className="flex-1 w-0 leading-4">
        <div className="flex items-center gap-2 text-12 text-tertiary mb-1">
          <div>{message.nickName}</div>
          <div>{formatter.time(message.time, 'short')}</div>
        </div>
        {content}
      </div>
    </div>
  );
};

const WORD_MAX_LENGTH = 160;
function Main() {
  const { t } = useTranslation();
  const { isTemporary } = useUserInfo().data;
  const navigate = useNavigate();
  const [visibleType, setVisibleType] = useState<'emoji' | 'gif' | null>(null);
  const [value, setValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  // 滚动是否处于消息列表的底部
  const [isAtBottom, setIsAtBottom] = useState(true);
  // 当滚动处于非底部时, 计数未读数
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const prevChatListLength = useRef(0);
  const { chatList, sendMessage } = useChatList();

  const lastWordLength = useMemo(() => {
    return WORD_MAX_LENGTH - value.length;
  }, [value.length]);

  // 自动滚动到聊天窗口底部
  const autoScrollToBottom = useMemoCallback(() => {
    const scrollableParent = findScrollableParent(containerRef.current);
    if (scrollableParent) {
      scrollableParent.scrollTo({
        top: scrollableParent.scrollHeight,
        behavior: 'instant',
      });
      setNewMessagesCount(0);
    }
  });

  // 检测滚动位置
  useEffect(() => {
    const scrollableParent = findScrollableParent(containerRef.current);
    if (!scrollableParent) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
      // 设置一个阈值判断是否在底部
      const threshold = 10;
      const atBottom = scrollHeight - (scrollTop + clientHeight) < threshold;

      setIsAtBottom(atBottom);

      // 如果在底部且有未读消息，则重置计数器
      if (atBottom && newMessagesCount > 0) {
        setNewMessagesCount(0);
      }
    };

    scrollableParent.addEventListener('scroll', handleScroll);
    return () => scrollableParent.removeEventListener('scroll', handleScroll);
  }, [newMessagesCount]);

  // 检测新消息
  useEffect(() => {
    if (chatList.length > prevChatListLength.current) {
      const newMessages = chatList.length - prevChatListLength.current;
      prevChatListLength.current = chatList.length;

      // 如果不在底部，增加新消息计数
      if (!isAtBottom) {
        setNewMessagesCount((prev) => prev + newMessages);
      }
    }
  }, [chatList.length, isAtBottom]);

  useEffect(() => {
    // 当有新消息且当前在底部时，自动滚动
    if (isAtBottom && chatList.length > 0) {
      autoScrollToBottom();
    }
  }, [chatList.length, isAtBottom, autoScrollToBottom]);

  const onSend = useMemoCallback(async function (value: string, contentType?: ContentType) {
    if (isTemporary) {
      navigate('/account/login');
      return;
    }
    if (value === '' || value.trim() === '') return;
    setValue('');
    await sendMessage(value, contentType || ContentType.Text);
    autoScrollToBottom();
  });

  return (
    <Fragment>
      {/* 最小高度保证容器出滚动条, 这样可以防止滚动穿透 */}
      <div ref={containerRef} className="min-h-screen pb-4 space-y-4">
        {chatList.map((chat) => (
          <Message message={chat} key={chat.id} />
        ))}
      </div>
      <div className="sticky bottom-0 -mb-4 p-4 -mx-4 bg-layer3 shadow-t">
        {/* 新消息提示按钮 */}
        {newMessagesCount > 0 && (
          <div
            className="w-full text-center absolute top-0 left-0"
            style={{
              transform: 'translateY(-120%)',
            }}
          >
            <Button size="sm" onClick={autoScrollToBottom}>
              <span>
                {newMessagesCount} {t('New messages')}
              </span>
              <SvgIcon.Updown className="rotate-180 text-black" />
            </Button>
          </div>
        )}
        <Input
          className="mb-3 bg-layer5 px-3"
          placeholder={t('Type Your message')}
          type="text"
          size="lg"
          maxLength={WORD_MAX_LENGTH}
          suffix={
            <div className="flex items-center">
              <Button
                theme="transparent"
                size="sm"
                icon={<GifIcon onClick={() => setVisibleType((v) => (v === 'gif' ? null : 'gif'))} />}
              />
              <Button
                theme="transparent"
                size="sm"
                icon={<EmojiIcon onClick={() => setVisibleType((v) => (v === 'emoji' ? null : 'emoji'))} />}
              />
            </div>
          }
          onChange={setValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSend(value);
            }
          }}
          value={value}
        />
        <div className="flex items-center justify-end gap-3">
          <div className="w-6 text-14 font-600 text-tertiary">{lastWordLength}</div>
          <Button
            onClick={() =>
              Modal.open({
                title: t('chat rules'),
                children: <ChatRules />,
              })
            }
            icon={<RulesIcon />}
            theme="secondary"
          />
          <Button onClick={() => onSend(value)} disabled={!value}>
            {t('Send')}
          </Button>
        </div>
        <Emoji
          open={visibleType === 'emoji'}
          onChange={(value) => {
            setValue((prev) => prev.concat(value));
          }}
        />
        <Gif
          open={visibleType === 'gif'}
          onChange={(value) => {
            onSend(value, ContentType.Emoji);
          }}
        />
      </div>
    </Fragment>
  );
}

export default memo(function Chat() {
  useMessageWebsocketConnect();

  const { mobile } = useMediaQuery();
  if (mobile) {
    return <Main />;
  }

  return (
    <MotionContainer>
      <Main />
    </MotionContainer>
  );
});

/** 手动查找最近的滚动容器 */
const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null;

  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || parent === document.body) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.body; // 默认返回body
};

function MotionContainer(props: { children: ReactNode }) {
  const { t } = useTranslation();
  const { children } = props;
  const { gt1440 } = useMediaQuery();
  const [active, changeVisible] = useChatVisible();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={cn(
            'relative overflow-x-hidden overflow-y-auto no-scrollbar bg-layer3 overscroll-none rounded-l-2',
            gt1440
              ? 'float-right h-[calc(100vh-66px)] sticky top-16 z-40 ml-0.5'
              : 'fixed z-40 top-12 s1024:top-16 right-0 bottom-0 overscroll-none shadow-l mt-0.5'
          )}
          style={{ width: 0, top: gt1440 ? 66 : undefined }}
          animate={{ width: 380 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2, damping: false }}
        >
          <div className="w-full px-4" style={{ width: 380 }}>
            <div className="sticky top-0 z-10 py-4 bg-layer3 flex items-center justify-between text-primary">
              <h3 className="text-20 font-500">{t('Chat')}</h3>
              <SvgIcon name="close" onClick={() => changeVisible(false)} />
            </div>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatRules() {
  const { t } = useTranslation();
  const rules = [
    t(`Don't spam & don't use excessive capital letters when chatting.`),
    t(`Don't harass or be offensive to other users or Detrade staff.`),
    t(`Don't share any personal information (including socials) of you or other players.`),
    t(`Don't beg or ask for loans, rains or tips.`),
    t(`Don't use alternative (alts) accounts on chat, that is strictly forbidden.`),
    t(`No suspicious behavior that can be seen as potential scams.`),
    t(`Don't engage in any forms of advertising/trading/selling/buying or offering services.`),
    t(`No discussion of streamers or Twitch or any other similar platforms.`),
    t(`Don't use URL shortening services. Always submit the full link.`),
    t(`Don't share codes, scripts or any other bot service.`),
    t(`Only use the language specified in the chat channel, potential abuse will be sanctioned.`),
    t(`No politics & no religion talk in chat, this one is strictly forbidden.`),
  ];

  return (
    <div className="text-12 text-secondary">
      {rules.map((rule, index) => (
        <div key={rule} className="mb-3">
          {index + 1}. {rule}
        </div>
      ))}
    </div>
  );
}

function RulesIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" fill="bg-layer5" />
      <path
        d="M15.3121 8.49255H8.9863C8.69153 8.49255 8.45571 8.25068 8.45571 7.95284C8.45571 7.65501 8.69349 7.41314 8.9863 7.41314H15.3121C15.6049 7.41314 15.8427 7.65501 15.8427 7.95284C15.8427 8.25068 15.6049 8.49255 15.3121 8.49255Z"
        fill="#A9AEB4"
      />
      <path
        d="M8.9863 10.7914H14.3374C14.6302 10.7914 14.868 10.5496 14.868 10.2517C14.868 9.95389 14.6302 9.71202 14.3374 9.71202L8.9863 9.71202C8.69349 9.71202 8.45571 9.95389 8.45571 10.2517C8.45571 10.5496 8.69153 10.7914 8.9863 10.7914Z"
        fill="#A9AEB4"
      />
      <path
        d="M15.8427 12.4526C15.8427 12.7504 15.6049 12.9923 15.3121 12.9923H8.9863C8.69349 12.9923 8.45571 12.7504 8.45571 12.4526C8.45571 12.1547 8.69349 11.9129 8.9863 11.9129H15.3121C15.6049 11.9129 15.8427 12.1547 15.8427 12.4526Z"
        fill="#A9AEB4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5395 4H18.4605C18.7582 4 19 4.24178 19 4.5395V15.3335C19 15.4894 18.9301 15.6393 18.8122 15.7412L15.1655 18.8723C15.0676 18.9582 14.9437 19.0041 14.8139 19.0041H6.5395C6.24178 19.0041 6 18.7624 6 18.4646V4.5395C6 4.24178 6.24178 4 6.5395 4ZM17.901 5.11897H7.09899V17.9052H14.0146V15.0478C14.0146 14.7501 14.2564 14.5083 14.5541 14.5083H17.901V5.11897ZM15.0936 15.6093V17.5095L17.2976 15.6093H15.0936Z"
        fill="#A9AEB4"
      />
    </svg>
  );
}

function GifIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.42177 2.41113C0.716461 2.41113 0.187473 3.05639 0.325795 3.748L1.13226 7.78032C1.1612 7.92501 1.1612 8.07401 1.13226 8.21871L0.325795 12.251C0.187474 12.9426 0.716462 13.5879 1.42177 13.5879H16.5779C17.2832 13.5879 17.8122 12.9426 17.6739 12.251L16.8674 8.21871C16.8385 8.07401 16.8385 7.92501 16.8674 7.78032L17.6739 3.748C17.8122 3.05639 17.2832 2.41113 16.5779 2.41113H1.42177ZM6.43739 6.68265C6.62516 6.77654 6.76859 6.91476 6.86769 7.09731H8.34638C8.20033 6.534 7.90042 6.09326 7.44665 5.7751C6.99809 5.45693 6.44521 5.29785 5.78802 5.29785C5.24557 5.29785 4.76311 5.41782 4.34063 5.65774C3.91815 5.89246 3.58694 6.22366 3.34701 6.65136C3.1123 7.07384 2.99494 7.5563 2.99494 8.09875C2.99494 8.64119 3.1123 9.12366 3.34701 9.54614C3.58694 9.96862 3.91815 10.2998 4.34063 10.5398C4.76832 10.7745 5.2534 10.8918 5.79584 10.8918C6.25483 10.8918 6.66688 10.8032 7.03199 10.6258C7.3971 10.4485 7.69701 10.2164 7.93172 9.9295C8.17165 9.64263 8.34116 9.33229 8.44026 8.99848V7.7545H5.52983V8.74029H7.22758C7.12327 9.05324 6.95636 9.29317 6.72686 9.46008C6.50258 9.62698 6.22615 9.71044 5.89755 9.71044C5.41769 9.71044 5.03955 9.56961 4.76311 9.28795C4.49189 9.00108 4.35627 8.60468 4.35627 8.09875C4.35627 7.62411 4.48667 7.24596 4.74746 6.96431C5.00825 6.67744 5.3551 6.534 5.78802 6.534C6.03838 6.534 6.25483 6.58355 6.43739 6.68265ZM10.5193 5.36035V10.8526H9.18147V5.36035H10.5193ZM15.0645 6.4322V5.36035H11.4891V10.8526H12.8269V8.63067H14.5012V7.59011H12.8269V6.4322H15.0645Z"
        fill="#B3BEC1"
      />
      <rect x="1.17578" y="0.734375" width="15.6475" height="1.11768" rx="0.558838" fill="#B3BEC1" />
      <rect x="1.17578" y="14.1465" width="15.6475" height="1.11768" rx="0.558838" fill="#B3BEC1" />
    </svg>
  );
}

function EmojiIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 1.25C5.1675 1.25 1.25 5.1675 1.25 10C1.25 14.8325 5.1675 18.75 10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.1675 14.8325 1.25 10 1.25ZM10 17.5C5.85813 17.5 2.5 14.1419 2.5 10C2.5 5.85813 5.85813 2.5 10 2.5C14.1419 2.5 17.5 5.85813 17.5 10C17.5 14.1419 14.1419 17.5 10 17.5Z"
        fill="#B3BEC1"
      />
      <path
        d="M5 7.5C5 7.83152 5.1317 8.14946 5.36612 8.38388C5.60054 8.6183 5.91848 8.75 6.25 8.75C6.58152 8.75 6.89946 8.6183 7.13388 8.38388C7.3683 8.14946 7.5 7.83152 7.5 7.5C7.5 7.16848 7.3683 6.85054 7.13388 6.61612C6.89946 6.3817 6.58152 6.25 6.25 6.25C5.91848 6.25 5.60054 6.3817 5.36612 6.61612C5.1317 6.85054 5 7.16848 5 7.5Z"
        fill="#B3BEC1"
      />
      <path
        d="M12.5 7.5C12.5 7.83152 12.6317 8.14946 12.8661 8.38388C13.1005 8.6183 13.4185 8.75 13.75 8.75C14.0815 8.75 14.3995 8.6183 14.6339 8.38388C14.8683 8.14946 15 7.83152 15 7.5C15 7.16848 14.8683 6.85054 14.6339 6.61612C14.3995 6.3817 14.0815 6.25 13.75 6.25C13.4185 6.25 13.1005 6.3817 12.8661 6.61612C12.6317 6.85054 12.5 7.16848 12.5 7.5Z"
        fill="#B3BEC1"
      />
      <path
        d="M4.375 10C4.375 13.1069 6.89312 15.625 10 15.625C13.1069 15.625 15.625 13.1069 15.625 10H4.375Z"
        fill="#B3BEC1"
      />
    </svg>
  );
}
