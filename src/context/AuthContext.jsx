import React, { createContext, useState, useEffect } from 'react';  // Herramientas React para estado y contexto.
import { jwtDecode } from 'jwt-decode';  // Fix: Named import con llaves.

export const AuthContext = createContext();  // Crea un "contenedor" para compartir info de user.

export const AuthProvider = ({ children }) => {  // Componente que envuelve tu app.
  const [currentUser, setCurrentUser] = useState(null);  // Estado: User logueado (con token, id, role).
  const [loading, setLoading] = useState(true);  // Muestra "cargando" al inicio.

  useEffect(() => {  // Ejecuta al cargar: Check si hay token guardado.
    const token = localStorage.getItem('token');  // Busca token en "almacenamiento local" del browser.
    if (token) {
      try {
        const decoded = jwtDecode(token);  // Decode para obtener id/role.
        setCurrentUser({ token, id: decoded.id, role: decoded.role });
      } catch (error) {
        console.error('Token inválido:', error);
        localStorage.removeItem('token');  // Limpia si token malo.
      }
    }
    setLoading(false);  // Termina loading.
  }, []);

  const signup = async (email, password, role) => {  // Función para registro.
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/register`, {  // Envía a back.
        method: 'POST',  // Tipo de envío: Crear nuevo.
        headers: { 'Content-Type': 'application/json' },  // Dice que envía JSON.
        body: JSON.stringify({ email, password, role })  // Convierte datos a string JSON.
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registro falló');
      }
    } catch (error) {
      throw new Error('Error en signup: ' + error.message);  // Para que Login/Register lo atrapen.
    }
  };

  const login = async (email, password) => {  // Función para login.
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login falló');
      localStorage.setItem('token', data.token);  // Guarda token en browser.
      const decoded = jwtDecode(data.token);  // Decode para id/role.
      setCurrentUser({ token: data.token, id: decoded.id, role: decoded.role });  // Actualiza estado.
    } catch (error) {
      throw new Error('Error en login: ' + error.message);  // Para que Login lo atrape.
    }
  };

  const logout = () => {  // Función para logout.
    localStorage.removeItem('token');  // Borra token.
    setCurrentUser(null);  // Limpia user.
  };

  return (  // Provee funciones a la app.
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {!loading && children}  // Muestra app si no loading.
    </AuthContext.Provider>
  );
};