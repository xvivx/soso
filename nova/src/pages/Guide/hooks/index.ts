import { useCallback, useEffect, useState } from 'react';

// 引导页面状态管理Hook
export const useGuideNavigation = (totalPages = 5) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 防抖导航函数
  const navigateToPage = useCallback(
    (page: number) => {
      if (isAnimating || page < 0 || page >= totalPages || page === currentPage) {
        return;
      }

      setIsAnimating(true);
      setCurrentPage(page);

      // 动画完成后重置状态
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    },
    [currentPage, totalPages, isAnimating]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      navigateToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, navigateToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      navigateToPage(currentPage - 1);
    }
  }, [currentPage, navigateToPage]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'Space':
          event.preventDefault();
          nextPage();
          break;
        case 'ArrowUp':
          event.preventDefault();
          previousPage();
          break;
        case 'Escape':
          event.preventDefault();
          // 可以添加关闭逻辑
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, previousPage]);

  return {
    currentPage,
    nextPage,
    previousPage,
    navigateToPage,
    isAnimating,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage === totalPages - 1,
  };
};
