import { mock } from 'mockjs';

// 聊天消息mock数据模板
const chatMessageItem = {
  'id|+1': 1, // 自增ID
  'userId': '@integer(10000, 99999)', // 用户ID
  'nickName': '@cname', // 中文昵称
  'avatar': '@image(100x100, @color)',
  'content': '@cparagraph(1, 3)', // 消息内容
  'contentType': '@pick(["TEXT", "IMAGE", "LINK", "RICH_TEXT"])', // 内容类型
  'room': 'en', // 房间号
  'time': '@now', // 当前时间
  'type': '@pick(["live", "private"])', // 消息类型
};

// 生成初始聊天消息列表
const chatList = mock({
  'data|10-50': [chatMessageItem],
}).data;

const apis: MockSchema[] = [
  {
    url: '/api/message/chat/room/en/send',
    type: 'post',
    response(options) {
      const { content, contentType, type } = JSON.parse(options.body);
      // 创建新消息
      const newMessage = mock({
        ...chatMessageItem,
        content,
        contentType,
        type: type || 'live',
        time: new Date().getTime(),
      });

      // 添加到消息列表
      chatList.unshift(newMessage);

      return mock({
        code: 0,
        data: newMessage,
      });
    },
  },
  {
    url: '/api/message/chat/room/en/get',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: chatList,
      });
    },
  },
];

export default apis;
