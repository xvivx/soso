import { ReactNode } from 'react';
import { cn, formatter } from '@utils';

function Description({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-12 text-secondary">
      <div>{label}</div>
      <div className="flex items-center gap-1 text-primary overflow-hidden">{children}</div>
    </div>
  );
}

export type DescriptionItem =
  | {
      label: string;
      value: string | number;
      type: 'amount';
      currency: string;
      ceil?: boolean;
    }
  | {
      label: string;
      value: string | number;
      type: 'text';
      hidden?: boolean;
    }
  | {
      label: string;
      value: string | number;
      type: 'time';
    };

interface TransactionDetailsProps {
  title: string;
  descriptions: Array<DescriptionItem>;
  /** 是否加载中（控制透明度） */
  isValidating?: boolean;
}

/**
 * 通用交易详情组件
 * 支持动态传入标题、详情列表，自带金额格式化和加载态
 */
const TransactionDetails = ({ title, descriptions, isValidating = false }: TransactionDetailsProps) => {
  const formatValue = (value: string | number, item: DescriptionItem) => {
    switch (item.type) {
      case 'text':
        return String(value);
      case 'time':
        return formatter.time(value, 'duration');
      case 'amount': {
        const amountInstance = formatter.amount(value, item.currency);
        if (item.ceil) return amountInstance.ceil().toText();
        return amountInstance.toText();
      }
      default:
        return String(value);
    }
  };

  return (
    <div
      className={cn(
        'space-y-2 font-600',
        isValidating && 'opacity-50' // 加载态：半透明
      )}
    >
      <div className="text-primary text-14 font-700">{descriptions.length > 0 ? title : ''}</div>

      {/* 动态渲染详情列表 */}
      {descriptions.map((item, index) => (
        <Description key={`${item.value}-${index}`} label={item.label}>
          <span className="truncate">{`${item.type === 'time' ? '≈' : ''}${formatValue(item.value, item)}`}</span>
        </Description>
      ))}
    </div>
  );
};

export default TransactionDetails;
