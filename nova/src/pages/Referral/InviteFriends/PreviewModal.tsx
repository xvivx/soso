import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { Button, Modal } from '@components';
import referralPosterImg from '@pages/components/AffiliateCard/imgs/kol-koc.png';
import Logo from '@pages/components/Logo';
import i18n from '@/i18n';

/**
 * @interface IPreviewModalProps
 * @description 海报预览模态框属性类型定义
 * @property {string} referralLink - 推荐链接
 */
interface IPreviewModalProps {
  referralLink: string;
}

/**
 * @constant {Object} POSTER_CONFIG - 海报配置常量
 * @property {number} CANVAS_SCALE - 画布缩放比例
 * @property {number} DOWNLOAD_QUALITY - 下载图片质量
 * @property {number} DOM_UPDATE_DELAY - DOM更新延迟时间
 * @property {Object} BACKGROUND_COLORS - 背景颜色配置
 */
const POSTER_CONFIG = {
  CANVAS_SCALE: 2,
  DOWNLOAD_QUALITY: 2.0,
  DOM_UPDATE_DELAY: 500,
  BACKGROUND_COLORS: {
    LIGHT: '#FFFFFF',
    DARK: '#1C2833',
  },
} as const;

/**
 * @function openPreviewModal
 * @description 打开预览海报模态框
 * @param {string} referralLink - 推荐链接
 */
function openPreviewModal(referralLink: string): void {
  Modal.open({
    title: i18n.t('Detrade'),
    children: <PreviewModal referralLink={referralLink} />,
    size: 'sm',
  });
}

/**
 * @component PreviewModal
 * @description 海报预览模态框组件
 */
const PreviewModal = memo(({ referralLink }: IPreviewModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme === 'darken';

  // 缓存背景色值
  const backgroundColor = useMemo(
    () => (isDark ? POSTER_CONFIG.BACKGROUND_COLORS.DARK : POSTER_CONFIG.BACKGROUND_COLORS.LIGHT),
    [isDark]
  );

  /**
   * @function preloadImages
   * @description 预加载海报背景图片
   * @returns {Promise<void>}
   */
  const preloadImages = useCallback(async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.src = referralPosterImg;
    });
  }, []);

  /**
   * @function handleDownload
   * @description 处理海报下载
   */
  const handleDownload = useMemoCallback(async (): Promise<void> => {
    try {
      // 预加载图片
      await preloadImages();

      const element = document.getElementById('poster-content');
      if (!element) {
        throw new Error('');
      }

      // 等待DOM更新
      await new Promise((resolve) => setTimeout(resolve, POSTER_CONFIG.DOM_UPDATE_DELAY));

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: POSTER_CONFIG.CANVAS_SCALE,
        backgroundColor,
        onclone: (doc: Document) => {
          const el = doc.getElementById('poster-content');
          if (el) {
            el.style.backgroundColor = backgroundColor;
          }
        },
      });

      // 下载海报
      const url = canvas.toDataURL('image/png', POSTER_CONFIG.DOWNLOAD_QUALITY);
      const link = document.createElement('a');
      link.download = `detrade-poster-${Date.now()}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <article className="space-y-4" role="dialog">
      {/* 海报内容容器 */}
      <section id="poster-content" className="overflow-hidden rounded-3" style={{ backgroundColor }}>
        {/* 主要内容区域 */}
        <header className="flex flex-col justify-between referral-gradient text-primary h-[440px]   px-7">
          {/* 背景图片区域 */}
          <div className="flex flex-col justify-start pt-5 text-primary">
            <h1 id="poster-title" className="leading-tight font-700 text-24">
              {t('Crypto - binary options')}
              <br />
              {t('trading platform')}
            </h1>
            <p className="flex flex-wrap items-center gap-1 mt-3 text-18 font-500">
              {t('Join now and get a')}
              <span className="text-brand_alt font-500 whitespace-nowrap">100 USDT</span>
              {t('voucher')}
            </p>
          </div>
          <img src={referralPosterImg} alt="poster" className="object-cover " />
        </header>

        {/* 底部信息区域 */}
        <footer className="flex items-center justify-between p-6 overflow-hidden bg-layer1 ">
          {/* Logo 区域 */}
          <div className="flex flex-col items-center gap-2">
            <Logo className="h-8" />
            <p className="text-primary text-12">www.detrade.com</p>
          </div>

          {/* QR Code 区域 */}
          <div className="p-2 bg-white rounded-2">
            <QRCodeSVG value={referralLink} size={100} />
          </div>
        </footer>
      </section>

      {/* 操作按钮 */}
      <Modal.Footer>
        <Button size="lg" className="w-full" onClick={handleDownload}>
          {t('Download')}
        </Button>
      </Modal.Footer>
    </article>
  );
});

PreviewModal.displayName = 'PreviewModal';

const PreviewPoster = { openPreviewModal };
export default PreviewPoster;
