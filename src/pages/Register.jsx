import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, role);
      alert('Registrado! Ahora login.');
      navigate('/login');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <Container className="py-5">
      <h2>Registro</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="client">Cliente</option>
            <option value="therapist">Terapeuta</option>
          </Form.Select>
        </Form.Group>
        <Button variant="success" type="submit">Registrarse</Button>
      </Form>
    </Container>
  );
};

export default Register;