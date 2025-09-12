import React from 'react';

const AdaptiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  heightClass?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className = '', heightClass = '', style }) => (
  <div className={`${heightClass} ${className}`} style={style}>
    <img
      src={src}
      alt={alt}
      className="w-[90%] mx-auto s1024:w-full s1024:h-auto s1024:max-h-[55vh]"
      style={{
        maxWidth: 1264,
      }}
    />
  </div>
);

export default React.memo(AdaptiveImage);
