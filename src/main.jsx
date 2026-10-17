import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedFontSize = localStorage.getItem('fontSize');
const fontSizePixels = { small: '14px', medium: '16px', large: '18px' };
if (fontSizePixels[savedFontSize]) {
  document.documentElement.style.fontSize = fontSizePixels[savedFontSize];
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
