## USING YARN (Recommend)

- yarn install
- yarn start

## 开发注意事项

- 所有功能都要有 `mock` 数据, `mock` 也是项目资产, 务必要重视, 避免功能开发完了别人无法完全查看。
- 禁止覆盖标准组件的样式, 一般是字体大小、颜色、背景色, 发现和设计稿不一样正确的做法是和设计沟通, 可能是组件做错了也可能
  是设计做错了。className仅仅是用来设置margin和定位等非组件内部样式的, 只有极个别组件在一些场景下需要设置背景色比如
  `Tabs` 组件。
- 禁止页面大面积loading, 推荐按需loading, 也禁止页面抖动, 常见的抖动出现在:

  ```tsx
  /* 不推荐: 会抖动 */
  someVar === someValue && <div>...</div>

  /* 推荐 */
  <Accordion.Collapse defaultOpen={someVar === someValue} content={<div>...</div>} />
  ```

  这时候应该用折叠组件包裹, 包裹的时候要注意把padding和margin也包进去, 保证折叠部分可以从0开始过渡, 图片也容易出现抖动,
  一般推荐指定宽高比。

- 禁止使用 `any`, 除非你有充分的理由, 不然不要写, 被发现还是要改掉。
- `tailwind` 尺寸20以上用4的倍数, 40以上用8的倍数, 比如设计稿是82, 你应该用80, 19应该用20, 禁止w-[19px]等。
- 组件名使用首字母大写, 路由用-连接。
- 禁止书写压缩代码, 强烈建议写文档注释。
- `/playground` 页面可以帮助你开发一些复杂的模块。
- 出于复用或者性能考虑才使用 const renderxxx = () => xxx 或者 const xxx = <xxx />, 否则应该正常按jsx书写保持dom结构的可
  读性。
- `Table` 表格出现在弹窗中时如果不加以干预体验较差, 如果当前的表格可能是某个弹窗中唯一的表格那么应该有
  `.detrade-modal-table` 这个类, 系统会对这个类做体验优化
- 希望每个人写之前都做足够的思考, 如何做到低耦合、高内聚, 性能固然重要, 我们也重视可维护性。

## SDK(供外部平台对接使用) 调试

```shell
- cd sdk
- yarn
- yarn dev
```

同时启动本项目 `yarn start`

## 外部平台模拟器

```shell
cd simulator
yarn
yarn start
```

启动模拟器项目(端口 3000)，加载 trade 项目(端口 8084), 其中玩法一二是加载的图表是 public 下打包过的 chart-iframe 提供的,
如果要调试 iframe 修改 ChartSDKIframe.tsx 中的 entry, 并启动 iframe 项目:

```shell
yarn start:chart
```
