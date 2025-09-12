import React from 'react';

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`fixed inset-0 flex flex-col items-center justify-center bg-layer1 overflow-hidden z-10 ${className}`}
  >
    <div className="relative w-full mx-auto overflow-hidden " style={{ maxWidth: 1920, height: 1080 }}>
      <div className="h-full flex flex-col">{children}</div>
    </div>
  </div>
);

export default PageContainer;
