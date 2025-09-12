import React from 'react';

const PageIndicator: React.FC<{
  currentPage: number;
  totalPages: number;
}> = ({ currentPage, totalPages }) => (
  <div className="absolute left-1/2 -translate-x-1/2 flex justify-center bottom-8 space-x-2 z-20">
    {Array.from({ length: totalPages }, (_, index) => (
      <button
        key={index}
        className={`transition-colors duration-300 rounded-full
          ${index === currentPage ? 'w-4.5 h-1 bg-white/20' : 'w-1 h-1 bg-white/10'}`}
        aria-label={`Go to page ${index + 1}`}
      />
    ))}
  </div>
);

export default React.memo(PageIndicator);
