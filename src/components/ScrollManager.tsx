import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        const element = document.getElementById(location.hash.slice(1));

        if (element) {
          element.scrollIntoView({ block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.hash, location.pathname, location.search]);

  return null;
};
