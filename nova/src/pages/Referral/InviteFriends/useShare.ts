/**
 * 社交媒体平台类型
 */
export type ISocialPlatform = 'facebook' | 'telegram' | 'twitter';

/**
 * 社交媒体分享配置
 */
const SHARE_CONFIG = {
  facebook: {
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
    urlParam: 'u', // Facebook 使用 u 作为 URL 参数
  },
  telegram: {
    baseUrl: 'https://t.me/share',
    urlParam: 'url',
  },
  twitter: {
    baseUrl: 'https://x.com/share',
    urlParam: 'url',
  },
} as const;

/**
 * 分享链接到社交媒体平台
 * @param {ISocialPlatform} platform - 社交媒体平台类型
 * @param {string} url - 要分享的URL
 */
export const shareToSocial = (platform: ISocialPlatform, url: string): void => {
  const { baseUrl, urlParam } = SHARE_CONFIG[platform];
  const encodedUrl = encodeURIComponent(url);
  window.open(`${baseUrl}?${urlParam}=${encodedUrl}`, '_blank');
};

/**
 * React Hook 方式使用社交媒体分享功能
 * @returns {{ shareToSocial: (platform: ISocialPlatform, url: string) => void }}
 */
export const useShare = () => {
  return { shareToSocial };
};
