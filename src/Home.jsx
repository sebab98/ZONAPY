import 'bootstrap/dist/css/bootstrap.min.css';  // Estilos Bootstrap.
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';  // Componentes.
import { useState, useCallback, useEffect, useContext } from 'react';  // Hooks (añadí useContext).
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';  // Mapa.
import { AuthContext } from './context/AuthContext';  // Para token/currentUser.

function Home() {
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [quizData, setQuizData] = useState({ seguro: 'Todos', modality: 'Todas', specialty: 'Todas' });
  const [bookingDate, setBookingDate] = useState('');  // Estado para date.
  const [bookingTime, setBookingTime] = useState('');  // Estado para time.
  const { currentUser } = useContext(AuthContext);  // Para token.

  // Fetch therapists del backend con filtros (reemplaza hardcode).
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const params = new URLSearchParams({
          seguro: quizData.seguro,
          modality: quizData.modality,
          specialty: quizData.specialty
        });

        const response = await fetch(`http://localhost:3000/therapists?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Error en fetch: ' + response.statusText);
        }
        const data = await response.json();
        setFilteredTherapists(data.map(t => ({
          ...t,
          location: { lat: t.location_lat, lng: t.location_lng }
        })));
      } catch (error) {
        console.error('Error fetching therapists:', error);
        alert('Error cargando terapeutas: ' + error.message);
      }
    };

    fetchTherapists();
  }, [quizData]);

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const seguro = e.target.seguro.value;
    const modality = e.target.modality.value;
    const specialty = e.target.specialty.value;

    setQuizData({ seguro, modality, specialty });
  };

  // Nueva: Handle submit de booking form.
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Debes loguearte primero para reservar.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`  // Token para auth.
        },
        body: JSON.stringify({
          therapist_id: 1,  // Hardcode por ahora (Jorge).
          date: bookingDate,
          time: bookingTime
        })
      });
      if (!response.ok) {
        throw new Error('Error en booking: ' + (await response.json()).error);
      }
      alert('Booking creado exitosamente!');
      setBookingDate('');  // Limpia form.
      setBookingTime('');
    } catch (error) {
      alert('Error: ' + error.message);  // Manejo de errores comunes (ej. no token, DB error).
    }
  };

  const mapContainerStyle = {
    height: "400px",
    width: "100%"
  };

  const center = {
    lat: -25.2637,
    lng: -57.5759
  };

  const loadMap = useCallback((map) => {
    // Optional: Add logic if needed
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="text-center py-5 grad-bg">
        <img src="/logo.png" alt="ZONAPY Logo" className="logo" />
        <h1>Encuentra el mejor terapeuta local</h1>
        <p>Reserva una consulta gratuita hoy en todo Paraguay.</p>
        <Button href="#quiz" variant="success" size="lg" className="cta-button">Comienza el matching</Button>
      </header>

      {/* 3 Pasos */}
      <Container className="py-5">
        <h2>Proceso en 3 pasos</h2>
        <Row>
          <Col md={4}>
            <h3>1. Dinos lo que te importa</h3>
            <p>Completa nuestro quiz de matching.</p>
          </Col>
          <Col md={4}>
            <h3>2. Reserva Consulta Gratuita</h3>
            <p>Ve profiles y videos introductorios.</p>
          </Col>
          <Col md={4}>
            <h3>3. Empieza Terapia</h3>
            <p>Conecta con tu terapeuta ideal.</p>
          </Col>
        </Row>
      </Container>

      {/* Quiz */}
      <section id="quiz" className="container quiz-section py-5">
        <h2>Dinos sobre ti</h2>
        <p>Te mostraremos terapeutas en todo Paraguay que podrían encajar contigo.</p>
        <Form onSubmit={handleQuizSubmit}>
          <Row>
            <Col md={4}>
              <Form.Label>Seguro Médico</Form.Label>
              <Form.Select name="seguro">
                <option>Todos</option>
                <option>IPS</option>
                <option>Privado</option>
                <option>Sin seguro</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Modalidad</Form.Label>
              <Form.Select name="modality">
                <option>Todas</option>
                <option>Online</option>
                <option>Presencial</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Especialidad</Form.Label>
              <Form.Select name="specialty">
                <option>Todas</option>
                <option>Ansiedad</option>
                <option>Depresión</option>
                <option>Trauma</option>
              </Form.Select>
            </Col>
          </Row>
          <Button type="submit" variant="success" className="cta-button mt-3">Encontrar coincidencias</Button>
        </Form>
      </section>

      {/* Directory */}
      <section id="therapist-directory" className="container py-5">
        <h2>Terapeutas Vetted</h2>
        <Row>
          {filteredTherapists.map((t, index) => (
            <Col md={4} key={index}>
              <Card className="therapist-card">
                <Card.Body>
                  <Card.Title>{t.name}</Card.Title>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="green">
                    <circle cx="10" cy="10" r="10" />
                  </svg> Vetted
                  <Card.Text>Especialidad: {t.specialty}</Card.Text>
                  <Card.Text>Modalidad: {t.modality}</Card.Text>
                  <Card.Text>Seguro: {t.seguro}</Card.Text>
                  <Card.Text>Precio: {t.price}</Card.Text>
                  {/* Quité iframe video */}
                  <Button variant="success" className="cta-button">Reservar Consulta Gratuita</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Map */}
      <section className="container py-5">
        <h2>Terapeutas en Todo Paraguay</h2>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={6} onLoad={loadMap}>
            {filteredTherapists.map((t, index) => (
              <Marker key={index} position={t.location} />
            ))}
          </GoogleMap>
        </LoadScript>
      </section>

      {/* Testimonials */}
      <section className="container py-5 grad-bg">
        <h2>Testimonios</h2>
        <p>5K+ terapeutas vetted, 350K clientes conectados, 5M+ seekers de terapia.</p>
        <Row>
          <Col md={4}>
            <p>"Excelente match" - Cliente 1</p>
          </Col>
          <Col md={4}>
            <p>"Cambió mi vida" - Cliente 2</p>
          </Col>
          <Col md={4}>
            <p>"Profesionales calificados" - Cliente 3</p>
          </Col>
        </Row>
      </section>

      {/* Press */}
      <section className="container py-5">
        <h2>Prensa</h2>
        <Row>
          <Col md={3}>
            <img src="/press1.png" alt="Press Logo 1" className="mb-4" />
          </Col>
          <Col md={3}>
            <img src="/press2.png" alt="Press Logo 2" className="mb-4" />
          </Col>
          <Col md={3}>
            <img src="/press3.png" alt="Press Logo 3" className="mb-4" />
          </Col>
          <Col md={3}>
            <img src="/press4.png" alt="Press Logo 4" className="mb-4" />
          </Col>
        </Row>
      </section>

      {/* Booking Form – ahora con onSubmit y value/onChange */}
      <section id="booking-form" className="container py-5">
        <h2>Programa tu Sesión</h2>
        <Form onSubmit={handleBookingSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hora</Form.Label>
            <Form.Control type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required />
          </Form.Group>
          <Button variant="success" type="submit" className="cta-button">Reservar</Button>
        </Form>
      </section>

      {/* Seguros */}
      <section className="container py-5">
        <h2>Seguros Médicos Aceptados</h2>
        <p>Nuestros terapeutas trabajan con seguros médicos locales como IPS y Privados, o sin seguro para accesibilidad en todo Paraguay.</p>
      </section>

      {/* FAQs */}
      <section className="faq-section container py-5">
        <h2>Preguntas Frecuentes</h2>
        <ul>
          <li>¿Cómo ZONAPY conecta clientes y terapeutas? Con matching personalizado y consultas gratuitas en todo Paraguay.</li>
          <li>¿Cómo elegir el terapeuta correcto? Usa nuestro quiz y ve videos introductorios.</li>
          <li>¿Qué hace que nuestros terapeutas sean vetted? Proceso de entrevista intensivo.</li>
          <li>¿Cómo ZONAPY ahorra costos? Consultas gratuitas y seguros aceptados.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 ZONAPY – Terapia en Paraguay. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Home;