import { Switch } from '@components';

export default function SwitchDemo() {
  return (
    <div>
      <h3 className="mb-4">Switch</h3>
      <div className="flex items-center gap-2 text-secondary">
        <div>非受控</div>
        <Switch className="mr-6" defaultChecked />
        <div>受控</div>
        <Switch className="mr-6" checked />
        <div>默认选中</div>
        <Switch className="mr-6" defaultChecked />
      </div>
    </div>
  );
}
