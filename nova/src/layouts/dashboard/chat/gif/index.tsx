import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, Image, Loading, ScrollArea } from '@components';
import { cn } from '@utils';
import { assetsList } from './config';
import copyRight from './copyright.png';

interface Props {
  open: boolean;
  onChange: (value: string) => void;
}

/** h-50的高度默认只加载9条 */
const maxDefaultLoaded = 9;
function Gif({ open, onChange }: Props) {
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const isLoading = imagesLoaded < maxDefaultLoaded;
  const { t } = useTranslation();

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  // 处理图片加载错误
  const handleImageError = (url: string) => {
    // 将失败图片URL加入错误集合
    setErrorImages((prev) => new Set(prev).add(url));
    // 仍然计数，避免无限等待
    handleImageLoad();
  };

  return (
    <Accordion.Collapse defaultOpen={open}>
      <ScrollArea className="w-full h-50 mt-2" type="hover" enableY>
        {isLoading && <Loading />}
        <div className={cn(isLoading ? 'opacity-0' : 'opacity-100', 'transition-opacity pr-2')}>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {assetsList.map((asset) => {
              // 如果图片加载失败，显示占位内容
              if (errorImages.has(asset.url)) {
                return (
                  <div
                    key={asset.key}
                    className="flex-center h-20 cursor-pointer text-12"
                    onClick={() => onChange(asset.key)}
                  >
                    {t('Loading Failed')}
                  </div>
                );
              }

              return (
                <Image
                  key={asset.key}
                  src={asset.url}
                  className="cursor-pointer h-20"
                  onLoad={handleImageLoad}
                  onError={() => handleImageError(asset.url)}
                  onClick={() => onChange(asset.key)}
                />
              );
            })}
          </div>
          <Image src={copyRight} className="w-36" />
        </div>
      </ScrollArea>
    </Accordion.Collapse>
  );
}

export default memo(Gif);
