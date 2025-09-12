import { type BinaryOrderInfo } from '@store/binary/types';
import { ContractOrderInfo } from '@store/contract';
import { formatter } from '@utils';
import i18n from '@/i18n';
import { Direction } from '@/type';

const HIGH_COLOR = '#2ECC71';
const LOW_COLOR = '#FF5449';

export interface Markers {
  id: string;
  direction: Direction;
  amount: number;
  currency: string;
  startTime: number;
  startPrice: number;
  endTime?: number;
  endPrice?: number;
  privateHide?: boolean;
  profit?: number;
  roi?: number;
  avatar?: string;
  nickName?: string;
}

const privateAvatar = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" style="width: 16px;height: 16px;margin-right: 3px;">
      <rect y="0.929688" width="24" height="24" rx="8" fill="none" />
      <path
        d="M12 5.92969C10.3453 5.92969 9 7.27637 9 8.93285C9 10.5577 10.2695 11.8728 11.9242 11.9297C11.9747 11.9234 12.0253 11.9234 12.0632 11.9297C12.0758 11.9297 12.0821 11.9297 12.0947 11.9297C12.1011 11.9297 12.1011 11.9297 12.1074 11.9297C13.7242 11.8728 14.9937 10.5577 15 8.93285C15 7.27637 13.6547 5.92969 12 5.92969Z"
        fill="currentColor"
      />
      <path
        d="M15.608 13.835C13.6264 12.6279 10.3949 12.6279 8.39915 13.835C7.49716 14.3867 7 15.133 7 15.9313C7 16.7296 7.49716 17.4694 8.39205 18.0146C9.38637 18.6247 10.6932 18.9297 12 18.9297C13.3068 18.9297 14.6136 18.6247 15.608 18.0146C16.5028 17.4629 17 16.7231 17 15.9183C16.9929 15.1201 16.5028 14.3802 15.608 13.835Z"
        fill="currentColor"
      />
    </svg>`;

export function buildBinaryActiveMarker(order: BinaryOrderInfo) {
  if (order.direction === Direction.BuyRise) {
    return `<div style="margin-bottom: 30px;">
                    <div style="padding: 5px;background: transparent; border-radius: 20px;display: flex;align-items: center;font-size: 14px;border: 1px solid ${HIGH_COLOR};color: ${HIGH_COLOR};backdrop-filter: blur(8px);-webkit-backdrop-filter: blur(8px);">
                        ${formatter.amount(order.amount, order.currency).toText(true)} ${order.currency}
                    </div>
                    <div style="height: 8px;width: 1px;border-right: 1px solid ${HIGH_COLOR};margin: 0 auto -4px"></div>
                    <svg style="margin: 0 auto" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <g clip-path="url(#clip0_911_30121)">
                        <circle cx="12" cy="12" r="12" fill="${HIGH_COLOR}"/>
                        <path d="M12 4.80005L6 10.9738L7.36702 12.3805L12 7.61328L16.633 12.3805L18 10.9738L12 4.80005ZM12 10.4196L6 16.5933L7.36702 18L12 13.2329L16.633 18L18 16.5933L12 10.4196Z" fill="white"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_911_30121">
                        <rect width="24" height="24" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </div>`;
  }
  if (order.direction === Direction.BuyFall) {
    return `<div style="margin-bottom: -32px;">
                    <svg style="margin: 0 auto" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <g clip-path="url(#clip0_911_30111)">
                        <circle cx="12" cy="12" r="12" fill="${LOW_COLOR}"/>
                        <path d="M12 19.2002L6 13.0265L7.36702 11.6198L12 16.387L16.633 11.6198L18 13.0265L12 19.2002ZM12 13.5807L6 7.4069L7.36702 6.0002L12 10.7674L16.633 6.0002L18 7.4069L12 13.5807Z" fill="white"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_911_30111">
                            <rect width="24" height="24" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                    <div style="height: 8px;width: 1px;border-right: 1px solid ${LOW_COLOR};margin: -8px auto 0"></div>
                    <div style="padding: 5px;background: transparent; border-radius: 20px;display: flex;align-items: center;font-size: 14px;border: 1px solid ${LOW_COLOR};color: ${LOW_COLOR};backdrop-filter: blur(8px);-webkit-backdrop-filter: blur(8px);">
                        ${formatter.amount(order.amount, order.currency).toText(true)} ${order.currency}
                    </div>
                </div>`;
  }
  return '';
}

export function buildBinaryClosedMarker(order: BinaryOrderInfo) {
  let color = null;
  const { profit } = order;

  if (+profit > 0) {
    color = HIGH_COLOR;
  } else {
    color = LOW_COLOR;
  }

  if (order.direction === Direction.BuyRise) {
    return `<div style="margin-bottom: 70px;width: fit-content;position: relative;background: ${color};padding: 8px;border-radius: 8px">
                    <div>${i18n.t('Profit')}</div>
                    <div>
                        ${formatter.amount(order.profit, order.currency).toText(true)} ${order.currency}
                    </div>
                    <div class="triangle" style="border-top-color: ${color}"></div>
                    <svg class="marker_arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <g clip-path="url(#clip0_911_30121)">
                        <circle cx="12" cy="12" r="12" fill="${HIGH_COLOR}"/>
                        <path d="M12 4.80005L6 10.9738L7.36702 12.3805L12 7.61328L16.633 12.3805L18 10.9738L12 4.80005ZM12 10.4196L6 16.5933L7.36702 18L12 13.2329L16.633 18L18 16.5933L12 10.4196Z" fill="white"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_911_30121">
                        <rect width="24" height="24" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </div>`;
  }
  if (order.direction === Direction.BuyFall) {
    return `<div style="margin-bottom: 70px;width: fit-content;position: relative;background: ${color};padding: 8px;border-radius: 8px">
                    <div>${i18n.t('Profit')}</div>
                    <div>
                        ${formatter.amount(order.profit, order.currency).toText(true)} ${order.currency}
                    </div>
                    <div class="triangle" style="border-top-color: ${color}"></div>
                    <svg class="marker_arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <g clip-path="url(#clip0_911_30111)">
                        <circle cx="12" cy="12" r="12" fill="${LOW_COLOR}"/>
                        <path d="M12 19.2002L6 13.0265L7.36702 11.6198L12 16.387L16.633 11.6198L18 13.0265L12 19.2002ZM12 13.5807L6 7.4069L7.36702 6.0002L12 10.7674L16.633 6.0002L18 7.4069L12 13.5807Z" fill="white"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_911_30111">
                            <rect width="24" height="24" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </div>`;
  }
  return '';
}

export function buildBinaryPublicMarker(order: BinaryOrderInfo) {
  if (order.direction === Direction.BuyRise) {
    return `<div>
                    <div style="display: flex;align-items: center;margin-bottom: 4px">
                        ${order.privateHide ? privateAvatar : `<img style="width: 16px;height: 16px;margin-right: 3px;border-radius: 4px;" src=${order.avatar} alt="Image" />`}
                        <span style="max-width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${order.privateHide ? '***' : order.nickName}</span>
                    </div>
                    <div style="display: flex;align-items: center;margin-bottom: 4px">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none">
                            <path fillRule="evenodd" clip-rule="evenodd" d="M8.5 16C12.9183 16 16.5 12.4183 16.5 8C16.5 3.58172 12.9183 0 8.5 0C4.08172 0 0.5 3.58172 0.5 8C0.5 12.4183 4.08172 16 8.5 16ZM4.49996 7.31583L8.49997 3.2L12.5 7.31583L11.5886 8.25363L8.49997 5.07549L5.41131 8.25363L4.49996 7.31583ZM4.49996 11.0622L8.49997 6.94635L12.5 11.0622L11.5886 12L8.49997 8.82189L5.41131 12L4.49996 11.0622Z" fill="#12A594"/>
                        </svg>
                        <span style="margin-left: 3px">${formatter.amount(order.amount, order.currency).toText(true)} ${order.currency}</span>
                    </div>
                    <div style="color: ${+order.profit > 0 ? HIGH_COLOR : LOW_COLOR}">${order.profit}</div>
                </div>`;
  }
  if (order.direction === Direction.BuyFall) {
    return `<div>
                    <div style="display: flex;align-items: center;margin-bottom: 4px">
                        ${order.privateHide ? privateAvatar : `<img style="width: 16px;height: 16px;margin-right: 3px;border-radius: 4px;" src=${order.avatar} alt="Image" />`}
                        <span style="max-width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${order.privateHide ? '***' : order.nickName}</span>
                    </div>
                    <div style="display: flex;align-items: center;margin-bottom: 4px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none">
                            <path fillRule="evenodd" clip-rule="evenodd" d="M8.5 0C12.9183 0 16.5 3.58172 16.5 8C16.5 12.4183 12.9183 16 8.5 16C4.08172 16 0.5 12.4183 0.5 8C0.5 3.58172 4.08172 0 8.5 0ZM4.49996 8.68417L8.49997 12.8L12.5 8.68417L11.5886 7.74637L8.49997 10.9245L5.41131 7.74637L4.49996 8.68417ZM4.49996 4.9378L8.49997 9.05365L12.5 4.9378L11.5886 4L8.49997 7.17811L5.41131 4L4.49996 4.9378Z" fill="#E5484D"/>
                        </svg>
                        <span style="margin-left: 3px">${formatter.amount(order.amount, order.currency).toText(true)} ${order.currency}</span>
                    </div>
                    <div style="color: ${+order.profit > 0 ? HIGH_COLOR : LOW_COLOR}">${formatter.amount(order.profit, order.currency).toText(true)} ${order.currency}</div>
                </div>`;
  }
  return '';
}

export function buildContractActiveMarker(order: ContractOrderInfo) {
  const icon =
    order.direction === Direction.BuyRise
      ? '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#2ECC71" size="8" class="css-1pzuxf4"><path d="M8 5.551L4 2.643 0 5.551V2.908L4 0l4 2.908V5.55zM8 10L4 7.092 0 10V7.357l4-2.908 4 2.908V10z" fill="currentColor" fillRule="evenodd"></path></svg>'
      : '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#FF5449" size="8" class="css-1pzuxf4"><path d="M8 4.449L4 7.357 0 4.449v2.643L4 10l4-2.908V4.45zM8 0L4 2.908 0 0v2.643l4 2.908 4-2.908V0z" fill="currentColor" fillRule="evenodd"></path></svg>';
  return `<div>
                <div style="display: flex;align-items: center;padding: 0 7px;border-radius: 4px;background: #333849;border: 1px solid #b1b6c6;font-size: 12px;font-weight: 700">
                    ${icon}
                    <span style="margin-left: 3px">${formatter.amount(order.amount, order.currency).toText(true)} ${order.currency}</span>
                </div>
            </div>`;
}

export function buildContractClosedMarker(order: ContractOrderInfo) {
  const icon =
    order.direction === Direction.BuyRise
      ? '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#2ECC71" size="8" class="css-1pzuxf4"><path d="M8 5.551L4 2.643 0 5.551V2.908L4 0l4 2.908V5.55zM8 10L4 7.092 0 10V7.357l4-2.908 4 2.908V10z" fill="currentColor" fillRule="evenodd"></path></svg>'
      : '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#FF5449" size="8" class="css-1pzuxf4" style="margin-left: 8px;"><path d="M8 4.449L4 7.357 0 4.449v2.643L4 10l4-2.908V4.45zM8 0L4 2.908 0 0v2.643l4 2.908 4-2.908V0z" fill="currentColor" fillRule="evenodd"></path></svg>';
  return `<div style="background: #27282D;padding: 4px;border-radius: 10px;">
                <div style="display: flex;align-items: center;margin-bottom: 4px">
                    ${order.privateHide ? privateAvatar : `<img style="width: 16px;height: 16px;margin-right: 3px;border-radius: 4px;" src=${order.avatar} alt="Image" />`}
                    <span style="max-width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;margin-right: 3px">${order.privateHide ? '***' : order.nickName}</span>
                    ${icon}
                </div>
                <div style="margin-bottom: 4px">
                     <div>P&L <span style="color: ${
                       +order.profit > 0 ? HIGH_COLOR : LOW_COLOR
                     }">${formatter.amount(order.profit, order.currency).toText(true)} ${order.currency}</span></div>
                     <div>ROI <span style="color: ${
                       +order.profit > 0 ? HIGH_COLOR : LOW_COLOR
                     }">${formatter.percent(order.roi / 100, true)}</span></div>
                </div>
            </div>`;
}

export function buildContractPublicMarker(order: ContractOrderInfo) {
  const icon =
    order.direction === Direction.BuyRise
      ? '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#2ECC71" size="8" class="css-1pzuxf4"><path d="M8 5.551L4 2.643 0 5.551V2.908L4 0l4 2.908V5.55zM8 10L4 7.092 0 10V7.357l4-2.908 4 2.908V10z" fill="currentColor" fillRule="evenodd"></path></svg>'
      : '<svg width="8" height="10" viewBox="0 0 8 10" xmlns="http://www.w3.org/2000/svg" color="#FF5449" size="8" class="css-1pzuxf4" style="margin-left: 8px;"><path d="M8 4.449L4 7.357 0 4.449v2.643L4 10l4-2.908V4.45zM8 0L4 2.908 0 0v2.643l4 2.908 4-2.908V0z" fill="currentColor" fillRule="evenodd"></path></svg>';
  return `<div>
                <div style="display: flex;align-items: center;margin-bottom: 4px">
                    ${order.privateHide ? privateAvatar : `<img style="width: 16px;height: 16px;margin-right: 3px;border-radius: 4px;" src=${order.avatar} alt="Image" />`}
                    <span style="max-width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;margin-right: 3px">${order.privateHide ? '***' : order.nickName}</span>
                    ${icon}
                </div>
                <div style="margin-bottom: 4px">
                     <div>P&L <span style="color: ${
                       +order.profit > 0 ? HIGH_COLOR : LOW_COLOR
                     }">${formatter.amount(order.profit, order.currency).toText(true)} ${order.currency}</span></div>
                     <div>ROI <span style="color: ${
                       +order.profit > 0 ? HIGH_COLOR : LOW_COLOR
                     }">${formatter.percent(order.roi / 100, true)}</span></div>
                </div>
            </div>`;
}
