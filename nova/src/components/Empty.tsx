import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';

interface EmptyProps extends PropsWithChildren {
  className?: string;
}

export default function Empty(props: EmptyProps) {
  const { children, className } = props;
  const { t } = useTranslation();
  return (
    <div className={cn('flex-center flex-col min-h-72 text-center', className)}>
      <svg
        className="mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 151 113"
        fill="none"
      >
        <g filter="url(#filter0_d_236_11518)">
          <rect x="16" y="8" width="91.6031" height="62.2901" rx="5.49618" className="fill-layer3" />
          <rect
            x="25.1604"
            y="23.5723"
            width="45.8015"
            height="5.49618"
            rx="2.74809"
            className="fill-layer5 light:fill-layer7"
          />
          <rect
            x="25.1604"
            y="40.9769"
            width="73.2824"
            height="5.49618"
            rx="2.74809"
            className="fill-layer5 light:fill-layer7"
          />
        </g>
        <g filter="url(#filter1_d_236_11518)">
          <rect x="44" y="36" width="91.6031" height="62.2901" rx="5.49618" className="fill-layer3" />
          <rect
            x="53.1604"
            y="51.5725"
            width="45.8015"
            height="5.49618"
            rx="2.74809"
            className="fill-layer5 light:fill-layer7"
          />
          <rect
            x="53.1604"
            y="68.9771"
            width="73.2824"
            height="5.49618"
            rx="2.74809"
            className="fill-layer5 light:fill-layer7"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_236_11518"
            x="0"
            y="0"
            width="123.603"
            height="94.29"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="8" />
            <feGaussianBlur stdDeviation="8" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_236_11518" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_236_11518" result="shape" />
          </filter>
          <filter
            id="filter1_d_236_11518"
            x="27.084"
            y="18.1679"
            width="123.603"
            height="94.29"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="-0.916031" dy="-1.83206" />
            <feGaussianBlur stdDeviation="8" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_236_11518" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_236_11518" result="shape" />
          </filter>
        </defs>
      </svg>
      <div className="text-quarterary text-13">{children || t('No data available')}</div>
    </div>
  );
}
