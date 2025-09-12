import { Button, Popover } from '@components';

export default function PopoverDemo() {
  return (
    <div>
      <div className="text-20 font-600 mb-2">Popover(基础组件)</div>
      <p className="text-secondary mb-4">
        Popover和弹窗组件共用移动端动效, 是所有弹出类组件的基础, 比如Select, Popover, Tooltip。
      </p>

      <div className="flex gap-2 w-100 mx-auto">
        <div className="flex-1 flex flex-col gap-2 w-30">
          <Popover
            side="top"
            align="start"
            content={
              <div>
                <div>side: top</div>
                <div>align: start</div>
              </div>
            }
          >
            <Button>Top Left</Button>
          </Popover>
          <Popover
            side="left"
            align="start"
            content={
              <div>
                <div>side: left</div>
                <div>align: start</div>
              </div>
            }
          >
            <Button>Left Top</Button>
          </Popover>
          <Popover
            side="left"
            content={
              <div>
                <div>side: left</div>
              </div>
            }
          >
            <Button>Left</Button>
          </Popover>
          <Popover
            side="left"
            align="end"
            content={
              <div>
                <div>side: left</div>
                <div>align: end</div>
              </div>
            }
          >
            <Button>Left Bottom</Button>
          </Popover>
          <Popover
            side="bottom"
            align="start"
            content={
              <div>
                <div>side: bottom</div>
                <div>align: start</div>
              </div>
            }
          >
            <Button>Bottom Left</Button>
          </Popover>
        </div>
        <div className="flex-1 flex flex-col justify-between gap-2">
          <Popover side="top" content={<div>side: top</div>}>
            <Button>Top</Button>
          </Popover>
          <Popover side="bottom" content={<div>side: bottom</div>}>
            <Button>Bottom</Button>
          </Popover>
        </div>
        <div className="flex-1 flex flex-col gap-2 w-30">
          <Popover
            side="top"
            align="end"
            content={
              <div>
                <div>side: top</div>
                <div>align: end</div>
              </div>
            }
          >
            <Button>Top Right</Button>
          </Popover>
          <Popover
            side="right"
            align="start"
            content={
              <div>
                <div>side: right</div>
                <div>align: start</div>
              </div>
            }
          >
            <Button>Right Top</Button>
          </Popover>
          <Popover
            side="right"
            content={
              <div>
                <div>side: right</div>
              </div>
            }
          >
            <Button>Right</Button>
          </Popover>
          <Popover
            side="right"
            align="end"
            content={
              <div>
                <div>side: right</div>
                <div>align: end</div>
              </div>
            }
          >
            <Button>Right Bottom</Button>
          </Popover>
          <Popover
            side="bottom"
            align="end"
            content={
              <div>
                <div>side: bottom</div>
                <div>align: end</div>
              </div>
            }
          >
            <Button>Bottom Right</Button>
          </Popover>
        </div>
      </div>
    </div>
  );
}
