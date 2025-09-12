import { Button, FormItem, Input } from '@components';

export default function FormItemDemo() {
  return (
    <div>
      <div>必填校验</div>
      <form name="demo1">
        <FormItem label="Hello world" required>
          <Input />
        </FormItem>
        <br />
        <Button type="submit">Submit</Button>
      </form>

      <br />

      <div>邮箱校验</div>
      <form name="demo2">
        <FormItem label="Email" required>
          <Input type="email" />
        </FormItem>
        <br />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
