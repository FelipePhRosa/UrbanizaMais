import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_CLIENTE_ID?.trim();
const application = <App />;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clientId ? <GoogleOAuthProvider clientId={clientId}>{application}</GoogleOAuthProvider> : application}
  </StrictMode>,
);
