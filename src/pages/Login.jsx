import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';  // Para redirigir después de login.

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);  // Usa función login.
  const navigate = useNavigate();  // Para ir a home.

  const handleSubmit = async (e) => {
    e.preventDefault();  // Evita refresh.
    try {
      await login(email, password);  // Llama login.
      navigate('/');  // Redirige a home.
    } catch (error) {
      alert('Error: ' + error.message);  // Muestra error.
    }
  };

  return (
    <Container className="py-5">
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Button variant="success" type="submit">Login</Button>
      </Form>
    </Container>
  );
};

export default Login;