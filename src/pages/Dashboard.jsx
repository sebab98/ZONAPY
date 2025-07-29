import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Form, Button, Table, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [therapistData, setTherapistData] = useState({
    name: '',
    specialty: '',
    modality: '',
    seguro: '',
    price: '',
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unapprovedTherapists, setUnapprovedTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);
const handleChange = (e) => {
  setTherapistData({ ...therapistData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault(); // Evita recarga de página
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/therapists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(therapistData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error actualizando profile');
    toast.success('Profile actualizado exitosamente!'); // Usa toast si ya lo tienes, o alert si no
  } catch (error) {
    toast.error('Error: ' + error.message);
  }
};

  useEffect(() => {
  const fetchData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (currentUser.role === 'client') {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setBookings(data);
      } else if (currentUser.role === 'therapist') {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/therapists?id=${currentUser.id}`,
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTherapistData(data[0] || {});
      } else if (currentUser.role === 'admin') {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/therapists?verified=0`,
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUnapprovedTherapists(data);
      }
      setLoading(false);
    } catch (error) {
      alert('Error cargando datos: ' + error.message); // Usaremos toast luego
      setLoading(false);
    }
  };
  fetchData();
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
  <Container className="py-5">
    <ToastContainer /> {/* Agrega esto al inicio */}
    <h2>Dashboard</h2>
    {loading ? (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    ) : (
      <>
        {currentUser.role === 'therapist' && (
          <div>
            <h3>Editar Perfil</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={therapistData.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="specialty"
                  value={therapistData.specialty}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="Ansiedad">Ansiedad</option>
                  <option value="Depresión">Depresión</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Parejas">Parejas</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Modalidad</Form.Label>
                <Form.Select
                  name="modality"
                  value={therapistData.modality}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="Online">Online</option>
                  <option value="Presencial">Presencial</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Seguro</Form.Label>
                <Form.Select
                  name="seguro"
                  value={therapistData.seguro}
                  onChange={handleChange}
                >
                  <option value="">Selecciona</option>
                  <option value="IPS">IPS</option>
                  <option value="Privado">Privado</option>
                  <option value="Sin seguro">Sin seguro</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  value={therapistData.price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button variant="success" type="submit">
                Guardar
              </Button>
            </Form>
            <Button
              variant="success"
              className="mt-3"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/subscribe`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || 'Error en suscripción');
                  toast.success('¡Suscripción actualizada a premium!');
                } catch (error) {
                  toast.error('Error: ' + error.message);
                }
              }}
            >
              Suscribirse a Premium
            </Button>
          </div>
        )}
        {currentUser.role === 'client' && (
          <div>
            <h3>Mis Reservas</h3>
            {bookings.length === 0 ? (
              <p>No tienes reservas.</p>
            ) : (
              <ul>
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    {booking.date} a las {booking.time} con terapeuta ID {booking.therapist_id}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {currentUser.role === 'admin' && (
          <div>
            <h3>Aprobar Terapeutas</h3>
            {unapprovedTherapists.length === 0 ? (
              <p>No hay terapeutas pendientes de aprobación.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {unapprovedTherapists.map((therapist) => (
                    <tr key={therapist.id}>
                      <td>{therapist.id}</td>
                      <td>{therapist.name}</td>
                      <td>
                        <Button
                          variant="primary"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(
                                `${import.meta.env.VITE_BACKEND_URL}/approve`,
                                {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ therapist_id: therapist.id }),
                                }
                              );
                              if (!response.ok) {
                                const text = await response.text();
                                throw new Error(text || 'Error en la aprobación');
                              }
                              const data = await response.json();
                              toast.success('Terapeuta aprobado exitosamente!');
                              const updatedTherapists = unapprovedTherapists.filter(
                                (t) => t.id !== therapist.id
                              );
                              setUnapprovedTherapists(updatedTherapists);
                            } catch (error) {
                              toast.error('Error: ' + error.message);
                            }
                          }}
                        >
                          Aprobar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        )}
      </>
    )}
  </Container>
);
};

export default Dashboard;