import { mock } from 'mockjs';

const messageItem = {
  'id|+1': 1, // 自增ID
  'userId': '@guid',
  'population': null,
  'notificationType': '@pick(["ANNOUNCEMENTS", "PROMOTIONS", "SYSTEM"])', // 通知类型
  'contentType': '@pick(["RICH_TEXT", "LINK", "IMAGE", "TEXT])', // 内容类型
  'title': '@ctitle(5, 15)', // 中文标题
  'content': '@cparagraph(1, 100)', // 中文内容
  'imageUrl': '@pick([null, "@image(200x100)"])', // 可能为null或随机图片
  'messageType': '@pick(["COIN_LISTING", "DEPOSIT", "WITHDRAW", "OTHER"])', // 消息类型
  'startTime': '@now', // 当前时间
  'endTime': '@pick([null, "@datetime"])', // 可能为null或随机时间
  'type': 'live', // 类型
  'status|0-1': 1,
};

const messageList = mock({
  'data|1-30': [messageItem],
}).data;

const apis: MockSchema[] = [
  {
    url: '/api/message/notification/messages/',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          ...messageItem,
        },
      });
    },
  },
  {
    url: '/api/message/notification/messages/count',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'unreadMessageCount|0-10': 0,
        },
      });
    },
  },
  {
    url: '/api/message/notification/messages',
    type: 'get',
    response({ url }) {
      const params = new URLSearchParams(url.split('?')[1]);
      const page = Number(params.get('page')) - 1;
      const pageSize = Number(params.get('pageSize'));

      return mock({
        code: 0,
        data: {
          items: messageList.slice(page * pageSize, page * pageSize + pageSize),
          total: messageList.length,
        },
      });
    },
  },
];

export default apis;
