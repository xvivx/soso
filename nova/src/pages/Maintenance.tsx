import { useTranslation } from 'react-i18next';

function Maintenance() {
  const { t } = useTranslation();
  return (
    <div className="flex-center flex-col gap-8 text-center light:bg-layer2 h-screen">
      <div className="flex items-center">
        <FaceIcon className="text-secondary" />
        <EllipsisIcon className="text-secondary" />
      </div>
      <div className="text-24 font-500 text-secondary">{t('Coming soon')}</div>
      <div className="text-14 leading-6 text-secondary px-4">
        {t('The system is under maintenance and upgrade, please visit later')}
      </div>
    </div>
  );
}

export default Maintenance;

// 省略号
function EllipsisIcon(props: BaseProps) {
  return (
    <svg width="28" height="4" viewBox="0 0 28 4" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="2" cy="2" r="2" fill="currentColor" />
      <circle cx="14" cy="2" r="2" fill="currentColor" />
      <circle cx="26" cy="2" r="2" fill="currentColor" />
    </svg>
  );
}

// 笑脸
function FaceIcon(props: BaseProps) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 4C30.243 4 35.8178 6.86042 39.4856 11.3422L26.8284 24L39.4856 36.6578C35.8178 41.1396 30.243 44 24 44C12.9543 44 4 35.0456 4 24C4 12.9543 12.9543 4 24 4ZM24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40C27.4464 40 30.7096 38.9062 33.3948 36.9548L33.81 36.64L21.1718 24L33.81 11.358L33.3948 11.0452C30.8676 9.20862 27.8284 8.13166 24.6062 8.0113L24 8ZM24 10C25.6568 10 27 11.3431 27 13C27 14.6569 25.6568 16 24 16C22.3432 16 21 14.6569 21 13C21 11.3431 22.3432 10 24 10Z"
        fill="currentColor"
      />
    </svg>
  );
}
