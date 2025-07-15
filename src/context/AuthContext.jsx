import React, { createContext, useState, useEffect } from 'react';  // Herramientas React para estado y contexto.
import { jwtDecode } from 'jwt-decode';  // Fix: Named import con llaves.

export const AuthContext = createContext();  // Crea un "contenedor" para compartir info de user.

export const AuthProvider = ({ children }) => {  // Componente que envuelve tu app.
  const [currentUser, setCurrentUser] = useState(null);  // Estado: User logueado (con token, id, role).
  const [loading, setLoading] = useState(true);  // Muestra "cargando" al inicio.

  useEffect(() => {  // Ejecuta al cargar: Check si hay token guardado.
    const token = localStorage.getItem('token');  // Busca token en "almacenamiento local" del browser.
    if (token) {
      const decoded = jwtDecode(token);  // Decode para obtener id/role.
      setCurrentUser({ token, id: decoded.id, role: decoded.role });
    }
    setLoading(false);  // Termina loading.
  }, []);

  const signup = async (email, password, role) => {  // Función para registro.
    const response = await fetch('http://localhost:3000/register', {  // Envía a back.
      method: 'POST',  // Tipo de envío: Crear nuevo.
      headers: { 'Content-Type': 'application/json' },  // Dice que envía JSON.
      body: JSON.stringify({ email, password, role })  // Convierte datos a string JSON.
    });
    if (!response.ok) {  // Si error.
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registro falló');
    }
  };

  const login = async (email, password) => {  // Función para login.
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login falló');
    localStorage.setItem('token', data.token);  // Guarda token en browser.
    const decoded = jwtDecode(data.token);  // Decode para id/role.
    setCurrentUser({ token: data.token, id: decoded.id, role: decoded.role });  // Actualiza estado.
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