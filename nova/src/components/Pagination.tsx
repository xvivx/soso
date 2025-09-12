import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { cn } from '@utils';
import Button from './Button';
import SvgIcon from './SvgIcon';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (current: number, pageSize: number) => void;
  className?: string;
}
export default function Pagination(props: PaginationProps) {
  const { current = 1, pageSize = 10, total = 0, onChange, className } = props;
  const [pageCount, setPageCount] = useState(Math.ceil(total / pageSize));

  useEffect(() => {
    setPageCount(Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const handlePageChange = (page: number) => {
    if (onChange) {
      onChange(page, pageSize);
    }
  };

  return (
    <div className={cn('flex items-center justify-end', className)}>
      {total !== 0 && (
        <nav className="flex gap-0.5">
          <Button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            icon={<SvgIcon name="arrow" className="rotate-180 size-4 text-primary" />}
            theme="transparent"
          />
          <Button className="gap-1 cursor-default" theme="secondary">
            <Trans i18nKey="<0>{{page}}</0> <1>of {{total}}</1>" values={{ page: current, total: pageCount }}>
              <span className="text-primary" />
              <span className="text-secondary" />
            </Trans>
          </Button>
          <Button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === pageCount || pageCount === 0}
            icon={<SvgIcon name="arrow" className="size-4 text-primary" />}
            theme="transparent"
          />
        </nav>
      )}
    </div>
  );
}
