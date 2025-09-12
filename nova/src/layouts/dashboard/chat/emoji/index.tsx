import { memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setEmoji, useRecentEmojis } from '@store/system';
import { Accordion, Button, Empty, ScrollArea, Tabs } from '@components';
import { activities, animalsNature, foodDrink, peopleBody, smileysEmotion, travelPlaces } from './config';

interface Props {
  open: boolean;
  onChange: (value: string) => void;
}

function Emoji({ open, onChange }: Props) {
  const recentEmojis = useRecentEmojis();
  const dispatch = useDispatch();

  const tabs = useMemo(() => {
    return [
      {
        key: 'recentEmojis',
        content: recentEmojis,
        label: '🕒',
      },
      {
        key: 'smileysEmotion',
        content: smileysEmotion,
        label: '😀',
      },
      {
        key: 'peopleBody',
        content: peopleBody,
        label: '👋',
      },
      {
        key: 'animalsNature',
        content: animalsNature,
        label: '🐻',
      },
      {
        key: 'foodDrink',
        content: foodDrink,
        label: '🍎',
      },
      {
        key: 'activities',
        content: activities,
        label: '⚽',
      },
      {
        key: 'travelPlaces',
        content: travelPlaces,
        label: '✈️',
      },
      // 宽度不够, 去掉后面两个分组
      // {
      //   key: 'objects',
      //   content: objects,
      //   label: '💡',
      // },
      // {
      //   key: 'symbols',
      //   content: symbols,
      //   label: '❤️',
      // },
    ];
  }, [recentEmojis]);

  return (
    <Accordion.Collapse defaultOpen={open}>
      <Tabs direction="horizontal" className="mt-2 h-50">
        <Tabs.Header className="flex">
          {tabs.map((tab) => (
            <Tabs.Item key={tab.key} className="flex-1">
              <div>{tab.label}</div>
            </Tabs.Item>
          ))}
        </Tabs.Header>

        {tabs.map((tab) => (
          <Tabs.Panel key={tab.key}>
            <ScrollArea className="w-full h-36" type="hover" enableY>
              <div className="flex flex-wrap w-full">
                {tab.content.length > 0 ? (
                  tab.content.map((emoji) => (
                    <Button
                      key={emoji}
                      className="size-9 text-24 hover:darkness"
                      onClick={() => {
                        onChange(emoji);
                        // 保存到最近使用
                        dispatch(setEmoji(emoji));
                      }}
                      theme="transparent"
                      size="free"
                    >
                      {emoji}
                    </Button>
                  ))
                ) : (
                  <Empty />
                )}
              </div>
            </ScrollArea>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Accordion.Collapse>
  );
}

export default memo(Emoji);
