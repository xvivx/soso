import { ContentType } from '@/type';

/** 消息类型 */
export enum MessageType {
  COIN_LISTING = 'COIN_LISTING', // 上新币|下线币
  DEPOSIT = 'DEPOSIT', // 充值
  WITHDRAW = 'WITHDRAW', // 提现
  OTHER = 'OTHER', // 其他
}

/** 通知状态 */
export enum Status {
  Open = 1,
  Close = 0,
}

/** 通知类型 */
export enum NotificationType {
  System = 'SYSTEM',
  Activity = 'ACTIVITY',
  Announcements = 'ANNOUNCEMENTS',
  InboxMessage = 'INBOX_MESSAGE',
  Marquee = 'MARQUEE', // 首页通知栏
}

/** 通知数据类型 */
export interface NotificationInfo {
  contentType: ContentType;
  notificationType: NotificationType;
  id: number;
  population: string;
  title: string;
  content: string;
  imageUrl: string;
  messageType: MessageType;
  startTime: number;
  endTime: number;
  type: string;
  status: Status;
  jumpUrl: string;
}
