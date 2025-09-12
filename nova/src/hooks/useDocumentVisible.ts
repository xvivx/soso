import { useEffect, useState } from 'react';

export default function useDocumentVisible() {
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    function handleDocumentVisibleChange() {
      setDocumentVisible(document.visibilityState === 'visible');
    }

    document.addEventListener('visibilitychange', handleDocumentVisibleChange, false);

    return () => {
      document.removeEventListener('visibilitychange', handleDocumentVisibleChange);
    };
  }, []);

  return documentVisible;
}
