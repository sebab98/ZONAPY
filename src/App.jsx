import './App.css';  // Tus estilos custom (grad-bg, etc.).
import React, { useContext } from 'react';  // React basics.
import { AuthContext } from './context/AuthContext';  // Auth.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Routing tools.
import Home from './Home';  // Importa tu nuevo Home.
import Login from './pages/Login';  // Importa páginas.
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';  // Importa dashboard.

function App() {
  const { currentUser } = useContext(AuthContext);  // Check si logueado.

  return (
    <Router>  // Activa routing para toda la app.
      <Routes>  // Define las "rutas" (URLs).
        <Route path="/" element={<Home />} />  // / muestra Home (tu contenido original).
        <Route path="/login" element={<Login />} />  // /login muestra form login.
        <Route path="/register" element={<Register />} />  // /register muestra form register.
        <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />  // /dashboard: Si logueado, muestra; si no, redirige a login.
        {/* Si tienes más páginas, añade aquí, e.g., <Route path="/profile/:id" element={<Profile />} /> */}
      </Routes>
    </Router>
  );
}

export default App;