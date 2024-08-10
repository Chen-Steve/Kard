import { useEffect } from 'react';

const useDOMNodeInserted = (callback: MutationCallback) => {
  useEffect(() => {
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [callback]);
};

export default useDOMNodeInserted;