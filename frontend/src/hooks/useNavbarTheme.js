import { useState, useEffect } from 'react';

export const useNavbarTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('navbarAnimation') || 'farmer-dynamic');

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };
    window.addEventListener('navbarThemeChange', handleThemeChange);
    return () => window.removeEventListener('navbarThemeChange', handleThemeChange);
  }, []);

  const changeTheme = (newTheme) => {
    localStorage.setItem('navbarAnimation', newTheme);
    window.dispatchEvent(new CustomEvent('navbarThemeChange', { detail: newTheme }));
  };

  return { theme, changeTheme };
};
