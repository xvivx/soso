/**
 * @fileoverview 客服系统适配器
 * @author cloud
 * @copyright Detrade
 * @version 1.0.0
 * @description
 * 该模块提供了客服系统的适配器模式实现，支持 Crisp 和 Intercom 两种客服系统，
 * 通过统一的接口封装，方便切换不同的客服系统实现。
 */

import { store } from '@store';
import { CrispSDK } from './crisp';

/**
 * @description 客服系统类型枚举
 * @enum {string}
 */
export enum CustomerServiceType {
  CRISP = 'crisp',
  INTERCOM = 'intercom',
}

/**
 * @description 客服系统配置接口
 * @interface CustomerServiceConfig
 */
export interface CustomerServiceConfig {
  type: CustomerServiceType;
}

/**
 * @description 获取用户信息的通用方法
 * @returns 返回用户信息对象
 */
const getUserInfo = () => {
  const { system, user } = store.getState();

  return {
    userId: user.info.id,
    email: user.info.email,
    nickname: user.info.nickName,
    created_at: new Date(user.info.createTime).getTime() / 1000,
    local: system.lang,
    // Intercom 特有字段映射
    user_id: user.info.id,
    name: user.info.nickName,
    language_override: system.lang,
  };
};

/**
 * @description 判断是否为访客的方法
 */
const isVisitor = () => {
  const state = store.getState();
  return state.user.info.isTemporary;
};

/**
 * @description 客服系统工厂类
 * @class CustomerServiceFactory
 */
export class CustomerServiceFactory {
  static create(): CrispSDK {
    return CrispSDK.createInstance({
      appId: import.meta.env.REACT_APP_CRISP_WEBSITE_ID,
      getUserInfo,
      isVisitor,
    });
  }
}

/**
 * @description 导出默认客服系统实例
 * @constant {CrispSDK}
 * @default 使用 Crisp 作为默认客服系统
 */
export const customerService = CustomerServiceFactory.create();
export type Service = typeof customerService;
