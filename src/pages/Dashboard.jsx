import React, { useState, useEffect, useContext } from 'react';  // Añadí hooks.
import { Container, ListGroup, Form, Button } from 'react-bootstrap';  // UI extras.
import { AuthContext } from '../context/AuthContext';  // Para currentUser/role/token.

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);  // Obtiene role/token/id.
  const [bookings, setBookings] = useState([]);  // Estado para bookings (client).

  // Para client: Fetch bookings al cargar.
  useEffect(() => {
    if (currentUser?.role === 'client') {
      const fetchBookings = async () => {
        try {
          const response = await fetch('http://localhost:3000/bookings', {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }  // Token para auth.
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

  // Mock para therapist pay.
  const handlePay = () => {
    alert('Pago mock exitoso! Suscripción activada.');
  };

  // Mock para edit profile (POST futuro).
  const handleEditProfile = (e) => {
    e.preventDefault();
    alert('Profile editado mock! (En futuro: POST /therapists)');
  };

  if (!currentUser) return <p>Cargando...</p>;

  return (
    <Container className="py-5">
      <h2>Dashboard para {currentUser.role === 'client' ? 'Cliente' : 'Terapeuta'}</h2>

      {currentUser.role === 'client' ? (
        <div>
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
        </div>
      ) : (
        <div>
          <h3>Edita tu Profile (Therapist)</h3>
          <Form onSubmit={handleEditProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" placeholder="Tu nombre" />
            </Form.Group>
            {/* Añade más fields como specialty, etc. en futuro */}
            <Button variant="success" type="submit">Guardar Cambios</Button>
          </Form>

          <h3>Suscripción</h3>
          <Button variant="primary" onClick={handlePay}>Pagar Suscripción (Mock)</Button>
        </div>
      )}
    </Container>
  );
};

export default Dashboard;