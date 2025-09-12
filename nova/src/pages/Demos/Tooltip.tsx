import { Button, Tooltip } from '@components';

export default function TooltipDemo() {
  return (
    <div className="space-y-8">
      <div className="text-20 font-600 mb-2">Tooltip</div>
      <p className="text-secondary mb-4">Tooltip基于Popover实现, 拥有相同的Api</p>

      <div className="flex gap-2 w-100 mx-auto">
        <div className="flex-1 flex flex-col gap-2 w-30">
          <Tooltip
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
          </Tooltip>
          <Tooltip
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
          </Tooltip>
          <Tooltip
            side="left"
            content={
              <div>
                <div>side: left</div>
              </div>
            }
          >
            <Button>Left</Button>
          </Tooltip>
          <Tooltip
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
          </Tooltip>
          <Tooltip
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
          </Tooltip>
        </div>
        <div className="flex-1 flex flex-col justify-between gap-2">
          <Tooltip side="top" content={<div>side: top</div>}>
            <Button>Top</Button>
          </Tooltip>
          <Tooltip side="bottom" content={<div>side: bottom</div>}>
            <Button>Bottom</Button>
          </Tooltip>
        </div>
        <div className="flex-1 flex flex-col gap-2 w-30">
          <Tooltip
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
          </Tooltip>
          <Tooltip
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
          </Tooltip>
          <Tooltip
            side="right"
            content={
              <div>
                <div>side: right</div>
              </div>
            }
          >
            <Button>Right</Button>
          </Tooltip>
          <Tooltip
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
          </Tooltip>
          <Tooltip
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
          </Tooltip>
        </div>
      </div>

      <div>
        <div className="text-secondary mb-4">自定义箭头对齐的元素, 默认情况下箭头是和children的中心位置对齐的</div>
        <Tooltip side="top" align="start" content="箭头和绿色圆对齐, 还是children触发">
          <div className="inline-flex items-center gap-2 border border-brand text-12">
            <Tooltip.Anchor>
              <div className="bg-brand size-10 rounded-full" />
            </Tooltip.Anchor>
            <div>鼠标到绿色框内唤起, 注意箭头对齐位置</div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
