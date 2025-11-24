import { useState, useEffect } from 'react';

export const useHashLocation = () => {
  const [location, setLocation] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setLocation(window.location.hash.replace('#', '') || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return [location, navigate] as const;
};