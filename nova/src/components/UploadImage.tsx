import { FC, useState } from 'react';
import { cn } from '@utils';

export interface UploadImageProps {
  /** 自定义类名 */
  className?: string;
  /** 文件变化回调 */
  onChange?: (file?: File) => void;
}
/**
 * @description 图片上传组件
 */
const UploadImage: FC<UploadImageProps> = ({ className, onChange }) => {
  const [localeValue, setLocaleValue] = useState('');

  return (
    <label
      className={cn(
        'flex-center bg-layer7 mx-auto p-3 aspect-square rounded-full cursor-pointer overflow-hidden',
        className
      )}
    >
      <input
        className="w-0 h-0 overflow-hidden opacity-0"
        type="file"
        onChange={(e) => {
          const file = e.target.files![0];
          onChange?.(file);
          setLocaleValue(window.URL.createObjectURL(file));
        }}
        accept="image/*"
      />

      {localeValue ? (
        <img className="block object-cover w-full h-full rounded-full" src={localeValue} alt="cover" />
      ) : (
        <div className="w-full h-full rounded-full flex-center bg-layer3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M38.3707 14.3971H33.5609C33.0705 14.3971 32.6128 14.1519 32.3431 13.7433L30.2835 10.6538C30.0138 10.2452 29.5561 10 29.0657 10H18.927C18.4366 10 17.9789 10.2452 17.7092 10.6538L15.6537 13.7433C15.384 14.1519 14.9263 14.3971 14.4359 14.3971H9.63419C7.46424 14.3971 5.70703 16.1584 5.70703 18.3243V34.0697C5.70703 36.2397 7.46833 37.9969 9.63419 37.9969H38.3707C40.5407 37.9969 42.2979 36.2356 42.2979 34.0697V18.3243C42.2979 16.1584 40.5407 14.3971 38.3707 14.3971ZM24.0025 35.1036C19.3642 35.1036 15.5842 31.3317 15.5842 26.6853C15.5842 22.0471 19.3602 18.2671 24.0025 18.2671C28.6407 18.2671 32.4207 22.043 32.4207 26.6853C32.4207 31.3276 28.6407 35.1036 24.0025 35.1036ZM35.9638 18.2303C35.9638 18.876 35.4407 19.395 34.795 19.399H34.7746C34.1289 19.399 33.6058 18.876 33.6058 18.2303V18.2099C33.6058 17.5642 34.1289 17.0411 34.7746 17.0411H34.795C35.4407 17.0411 35.9638 17.5642 35.9638 18.2099V18.2303ZM9.00781 11.7734H12.935V13.2119H9.00781V11.7734ZM17.4141 26.6891C17.4141 23.052 20.3645 20.1016 24.0016 20.1016C27.6427 20.1016 30.5891 23.052 30.5891 26.6891C30.5891 30.3302 27.6427 33.2766 24.0016 33.2766C20.3645 33.2766 17.4141 30.3302 17.4141 26.6891Z"
              fill="#697072"
            />
          </svg>
        </div>
      )}
    </label>
  );
};

export default UploadImage;
