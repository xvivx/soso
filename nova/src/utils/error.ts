// /**
//  * @description 错误级别枚举
//  */
// export enum ErrorLevel {
//   ERROR = 'error',
// }

// /**
//  * @description 自定义错误基类
//  */
// export class CustomError extends Error {
//   constructor(
//     message: string,
//     public originalError?: unknown,
//     public level: ErrorLevel = ErrorLevel.ERROR
//   ) {
//     super(message);
//     this.name = this.constructor.name;
//   }
// }

// /**
//  * @description 错误处理工具
//  */
// export const errorHandler = {
//   /**
//    * @description 警告级别错误处理（不阻断执行）
//    */
//   warn(message: string, originalError?: unknown): void {
//     if (!IS_PROD) {
//       console.warn(`警告: ${message}`, originalError);
//     } else {
//       console.error(`[生产环境错误] ${message}`, originalError);
//     }
//   },

//   /**
//    * @description 错误级别错误处理
//    *  - 开发环境：抛出错误，终止执行
//    *  - 生产环境：记录错误，不阻断执行
//    */
//   throw(message: string, originalError?: unknown): void {
//     if (!IS_PROD) {
//       throw new CustomError(message, originalError, ErrorLevel.ERROR);
//     } else {
//       console.error(`[生产环境错误] ${message}`, originalError);
//     }
//   },
// };
