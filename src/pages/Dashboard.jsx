import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [modality, setModality] = useState('');
  const [seguro, setSeguro] = useState('');
  const [price, setPrice] = useState('');

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
    } else if (currentUser?.role === 'therapist') {
      // Fetch current therapist profile (opcional, si quieres prellenar)
      const fetchTherapistProfile = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/therapists?id=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const therapist = data[0]; // Asume retorna array con 1 terapeuta
            setName(therapist.name || '');
            setSpecialty(therapist.specialty || '');
            setModality(therapist.modality || '');
            setSeguro(therapist.seguro || '');
            setPrice(therapist.price || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchTherapistProfile();
    }
  }, [currentUser]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/therapists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ name, specialty, modality, seguro, price })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating profile');
      }
      alert('Profile actualizado exitosamente!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
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
          <h3>Edita tu Profile (Therapeuta)</h3>
          <Form onSubmit={handleEditProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Especialidad</Form.Label>
              <Form.Control type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Modalidad</Form.Label>
              <Form.Control as="select" value={modality} onChange={(e) => setModality(e.target.value)} required>
                <option value="">Selecciona</option>
                <option value="Online">Online</option>
                <option value="Presencial">Presencial</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Seguro</Form.Label>
              <Form.Control as="select" value={seguro} onChange={(e) => setSeguro(e.target.value)} required>
                <option value="">Selecciona</option>
                <option value="IPS">IPS</option>
                <option value="Privado">Privado</option>
                <option value="Sin seguro">Sin seguro</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio (ej. Gs. 200.000)</Form.Label>
              <Form.Control type="text" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Form.Group>
            <Button type="submit">Guardar Cambios</Button>
          </Form>
        </>
      )}
    </Container>
  );
};

export default Dashboard;