import 'mockjs';

declare module 'mockjs' {
  declare namespace mockjs {
    interface MockjsRandom {
      shuffle(arr: any[], min?: number, max?: number): any[];
    }
  }

  export = mockjs;
}
