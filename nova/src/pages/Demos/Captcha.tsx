import { Button } from '@components';
import Captcha from '@components/Captcha';

export default function Ca() {
  return (
    <div>
      <h3 className="mb-4">谷歌验证, 自动触发</h3>
      <Button onClick={() => Captcha.verify()}>Google ReCaptcha</Button>
    </div>
  );
}
