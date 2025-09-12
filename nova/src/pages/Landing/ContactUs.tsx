import { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, message } from '@components';
import { request } from '@utils/axios';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [reason, setReason] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="px-4 pt-6 pb-12 s1366:pt-25">
      <h2 className="relative z-10 text-center mb-9 text-32 s1366:text-44 font-700">{t('Contact Us')}</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          await request.post('/api/user/contactUs/create', {
            name,
            email,
            telegram,
            reason,
          });

          message.success(t('Send message successfully'));
        }}
      >
        <div className="max-w-[1140px] mx-auto s768:flex gap-8 s1024:gap-12 s768:mb-6">
          <div className="mb-6 space-y-6 shrink-0 s768:basis-80 s1024:basis-100 s768:mb-0">
            <FormInput
              value={name}
              onChange={setName}
              placeholder="Name"
              id="contact-us-name-input"
              label={t('Your name')}
              autoFocus
              required
            />
            <FormInput
              value={email}
              onChange={setEmail}
              placeholder="hello@gmail.com"
              id="contact-us-email-input"
              label={t('Your email')}
              required
              type="email"
            />
            <FormInput
              value={telegram}
              onChange={setTelegram}
              placeholder="@username"
              id="contact-us-tg-input"
              label={t('Your Telegram')}
            />
          </div>

          <div className="relative flex-1 basis-0">
            <div
              className="absolute hidden -right-25 -top-50 s1366:block opacity-30"
              style={{
                width: 794,
                height: 604,
                backgroundImage: 'radial-gradient(#0063F5, #0063F533)',
                filter: 'blur(202.5px)',
              }}
            />
            <FormInput
              className="relative flex flex-col h-full mb-6 s768:mb-0"
              value={reason}
              onChange={setReason}
              placeholder="Type here..."
              id="contact-us-message-input"
              label={t('Tell us the reason for contacting us')}
              textarea
              required
            />
          </div>
        </div>

        <div className="sticky bottom-5 flex justify-center s768:justify-end s768:gap-3 max-w-[1140px] mx-auto">
          <Button size="lg" type="submit" className="rounded-full">
            {t('Send message')}
          </Button>
          {/* <Button
            size={gt1366 ? 'xl' : 'lg'}
            theme="secondary"
            className="rounded-full"
            onClick={(e) => e.preventDefault()}
          >
            Contact via Telegram
          </Button> */}
        </div>
      </form>
    </div>
  );
}

function FormInput(
  props: BaseProps & {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    id: string;
    type?: HTMLInputTypeAttribute;
    textarea?: boolean;
    autoFocus?: boolean;
    required?: boolean;
    pattern?: string;
  }
) {
  const { label, className, id, type = 'text', textarea, onChange, ...others } = props;
  return (
    <div className={className}>
      <label className="flex gap-1 mb-2.5 text-20 text-primary font-500" htmlFor={id}>
        <span>{label}</span>
        {props.required && <span className="text-down">*</span>}
      </label>

      {textarea ? (
        <textarea
          className="flex-1 w-full px-5 py-2 transition-all shadow-sm resize-none focus:ring focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 bg-white/5 rounded-2 outline outline-white/15"
          id={id}
          rows={10}
          onChange={(e) => onChange(e.target.value)}
          {...others}
        />
      ) : (
        <Input
          className="px-5 rounded-full h-15 bg-white/5 outline outline-white/15"
          id={id}
          type={type}
          onChange={onChange}
          {...others}
        />
      )}
    </div>
  );
}
