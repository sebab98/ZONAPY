import React from 'react';  // Básico React.
import ReactDOM from 'react-dom/client';  // Para renderizar en DOM.
import App from './App.jsx';  // Tu app principal.
import './index.css';  // Tus estilos.
import { AuthProvider } from './context/AuthContext';  // Importa el provider (asegúrate que AuthContext.jsx exista en src/context/).

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  // Modo estricto (bueno para dev).
    <AuthProvider>  // Envuelve todo con auth.
      <App />
    </AuthProvider>
  </React.StrictMode>,
);