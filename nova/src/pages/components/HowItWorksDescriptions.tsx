import { ReactNode } from 'react';
import { useMediaQuery } from '@hooks/useResponsive';
import MediaImage from '@pages/components/MediaImage';

export default function Descriptions(props: { pcSrc: string; mSrc: string; alt: string; word: ReactNode }) {
  const { pcSrc, mSrc, alt, word } = props;
  const { gt1024 } = useMediaQuery();

  return (
    <div className="flex flex-col items-center">
      <MediaImage toggle={!gt1024} pcSrc={pcSrc} mSrc={mSrc} alt={alt} className="rounded-3 w-full s768:h-30" />
      <div className="mt-4 text-13 text-left text-secondary w-full">{word}</div>
    </div>
  );
}
