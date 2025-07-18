import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (currentUser?.role === 'client') {
      const fetchBookings = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
          });
          if (!response.ok) throw new Error('Error fetching bookings');
          const data = await response.json();
          setBookings(data);
        } catch (error) {
          console.error('Error:', error);
          alert('Error cargando bookings: ' + error.message);
        }
      };
      fetchBookings();
    }
  }, [currentUser]);

  const handlePay = () => {
    alert('Pago mock exitoso! Suscripción activada.');
  };

  const handleEditProfile = (e) => {
    e.preventDefault();
    alert('Profile editado mock! (En futuro: POST /therapists)');
  };

  if (!currentUser) return <p>Cargando...</p>;

  return (
    <Container>
      <h2>Dashboard para {currentUser.role === 'client' ? 'Cliente' : 'Terapeuta'}</h2>
      {currentUser.role === 'client' ? (
        <>
          <h3>Tus Bookings</h3>
          {bookings.length === 0 ? (
            <p>No tienes bookings aún.</p>
          ) : (
            <ListGroup>
              {bookings.map((b) => (
                <ListGroup.Item key={b.id}>
                  Therapist ID: {b.therapist_id} - Fecha: {b.date} - Hora: {b.time}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </>
      ) : (
        <>
          <h3>Edita tu Profile (Therapist)</h3>
          <Form onSubmit={handleEditProfile}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Nuevo nombre" />
            </Form.Group>
            {/* Añade más fields como specialty, etc. en futuro */}
            <Button type="submit">Guardar</Button>
          </Form>
          <h3>Suscripción</h3>
          <Button onClick={handlePay}>Pagar Suscripción (Mock)</Button>
        </>
      )}
    </Container>
  );
};

export default Dashboard;