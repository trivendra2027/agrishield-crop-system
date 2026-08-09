import { useState, useEffect } from 'react';

export const useColorTheme = () => {
  const [colorTheme, setColorTheme] = useState(
    localStorage.getItem('colorTheme') || 'agrishield-default'
  );

  useEffect(() => {
    // Sync to html tag attribute data-theme
    document.documentElement.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        setColorTheme(e.detail);
      }
    };
    window.addEventListener('colorThemeChange', handleThemeChange);
    return () => window.removeEventListener('colorThemeChange', handleThemeChange);
  }, []);

  const changeColorTheme = (newTheme) => {
    localStorage.setItem('colorTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('colorThemeChange', { detail: newTheme }));
  };

  return { colorTheme, changeColorTheme };
};
