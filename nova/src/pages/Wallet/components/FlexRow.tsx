import { ReactNode } from 'react';

export default function FlexRow(props: { label: ReactNode; children: ReactNode }) {
  const { label, children } = props;
  return (
    <div className="flex items-center justify-between gap-2 text-primary">
      <div className="text-secondary">{label}</div>
      <div>{children}</div>
    </div>
  );
}
