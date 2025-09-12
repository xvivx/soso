import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useMediaQuery } from '@hooks/useResponsive';
import { Input } from '@components';
import { cn, request } from '@utils';

export default function AddressInput(props: {
  value: string;
  chain: string;
  onChange: (value: string, error: string) => void;
  className?: string;
}) {
  const { value, onChange, chain, className } = props;
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const { mutate: validateAddress, isValidating: loading } = useSWR(
    ['crypto-withdraw-address-validate', chain],
    () => {
      const address = value.trim();
      if (!address || !chain) return true;
      return request.post<boolean>('/api/account/payment/v2/checkAddress', { address, chain });
    },
    {
      onSuccess(valid) {
        onChange(value, valid ? '' : t('Address valid'));
      },
      fallbackData: true,
      revalidateOnMount: false,
      revalidateOnFocus: false,
      dedupingInterval: 0,
    }
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineHeight = 21; // 行高 14 * 1.5
  const minHeight = 40;
  const maxHeight = 48;
  const [textareaStyle, setTextareaStyle] = useState<React.CSSProperties>({ height: minHeight, overflowY: 'hidden' });
  const lastStepRef = useRef(0);
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea || !mobile) return; // 只在移动端调整高度

    // 计算内容所需高度
    const offsetHeight = textarea.offsetHeight;
    const singleLine = offsetHeight === minHeight;

    const contentHeight = textarea.scrollHeight - (singleLine ? 20 : 6); // 减去padding
    const step = singleLine ? Math.ceil(contentHeight / lineHeight) : Math.floor(contentHeight / lineHeight);
    const inputValue = textarea.value;
    if (!inputValue || step <= 1) {
      setTextareaStyle({ height: minHeight, paddingTop: 8, paddingBottom: 12 });
      return;
    }

    const newHeight = minHeight + (step - 1) * lineHeight;
    setTextareaStyle({
      height: Math.min(newHeight, maxHeight),
      paddingTop: 3,
      paddingBottom: 3,
    });
    lastStepRef.current = step;
  };

  const handleChange = (value: string) => {
    const cleanedValue = cleanInputValue(value);
    onChange(cleanedValue, '');
    adjustHeight();
  };

  // 拦截Enter键（禁止手动换行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 拦截Enter（主键盘）和NumpadEnter（小键盘）
    const isEnter = e.key === 'Enter' || e.key === 'NumpadEnter';
    // 拦截Shift+Enter、Ctrl+Enter、Alt+Enter等组合键
    const isModifierEnter = (e.shiftKey || e.ctrlKey || e.altKey) && isEnter;
    if (isEnter || isModifierEnter) {
      e.preventDefault(); // 阻止默认换行行为
      e.stopPropagation(); // 阻止事件冒泡（避免父组件处理）
      textareaRef.current?.blur(); //触发失焦校验
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pastedText = e.clipboardData.getData('text') || '';
    const cleanedText = cleanInputValue(pastedText);
    if (!cleanedText) return;

    const currentValue = textarea.value;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;

    const newValue = currentValue.slice(0, start) + cleanedText + currentValue.slice(end);

    textarea.value = newValue; // 先更新DOM
    adjustHeight(); // 同步更新高度

    onChange(newValue, '');

    const newCursorPos = start + cleanedText.length;
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
  };

  return (
    <Input.Textarea
      className={cn(
        'font-500 w-full resize-none overflow-hidden pt-2 pb-3 s768:pt-3 s768:pb-3 min-h-10 max-h-12 s768:h-12 s768:text-16',
        loading && 'opacity-50',
        className
      )}
      style={mobile ? textareaStyle : undefined}
      ref={textareaRef}
      required
      value={value}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder={t('Enter withdraw address')}
      onBlur={() => {
        validateAddress();
        adjustHeight();
      }}
      maxLength={128}
    />
  );
}

// 工具函数：清洗输入内容（移除换行和空格）
function cleanInputValue(value: string): string {
  return value
    .replace(/[\n\r]/g, '') // 移除所有换行符
    .replace(/\s+/g, ''); // 移除所有空格（含全角/半角）
}
