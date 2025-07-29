import React, { useState, useContext } from 'react';  // Para estado y contexto.
import { AuthContext } from '../context/AuthContext';  // Usa auth.
import { Form, Button, Container } from 'react-bootstrap';  // Componentes UI.
import { useNavigate } from 'react-router-dom';  // Para redirigir.

const Register = () => {
  const [email, setEmail] = useState('');  // Estado email.
  const [password, setPassword] = useState('');  // Estado password.
  const [role, setRole] = useState('client');  // Estado role (default client).
  const { signup } = useContext(AuthContext);  // Función signup.
  const navigate = useNavigate();  // Redirigir.

  const handleSubmit = async (e) => {  // Al enviar.
    e.preventDefault();
    try {
      await signup(email, password, role);  // Llama a signup del back.
      alert('Registrado exitosamente! Ahora haz login.');  // Mensaje ok.
      navigate('/login');  // Redirige a login.
    } catch (error) {
      alert('Error en registro: ' + error.message);  // Error.
    }
  };

  return (
  <Container className="py-5">
    <h2>Registro</h2>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicRole">
        <Form.Label>Rol</Form.Label>
        <Form.Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="client">Cliente</option>
          <option value="therapist">Terapeuta</option>
          <option value="admin">Administrador</option>
        </Form.Select>
      </Form.Group>
      <Button variant="success" type="submit" className="cta-button">
        Registrarse
      </Button>
    </Form>
  </Container>
);
};

export default Register;