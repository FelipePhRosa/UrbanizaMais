import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const ThemeContext = createContext(null);

// Auth screens and landing are always light; every other route follows the saved preference.
const PUBLIC_LIGHT_PATHS = ['/', '/login', '/registro', '/redefinirsenha', '/verifyEmail'];

const readSavedPreference = () => {
  try {
    return JSON.parse(localStorage.getItem('darkMode')) === true;
  } catch {
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [darkMode, setDarkMode] = useState(readSavedPreference);

  const appliedDarkMode = darkMode && !PUBLIC_LIGHT_PATHS.includes(pathname);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', appliedDarkMode);
  }, [appliedDarkMode]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, appliedDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
