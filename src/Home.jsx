import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos Bootstrap.
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap'; // Componentes UI.
import { useState, useCallback, useEffect, useContext } from 'react'; // Hooks.
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // Mapa.
import { AuthContext } from './context/AuthContext'; // Para token/currentUser.

function Home() {
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [quizData, setQuizData] = useState({ seguro: 'Todos', modality: 'Todas', specialty: 'Todas' });
  const [bookingDate, setBookingDate] = useState('');  // Estado para date.
  const [bookingTime, setBookingTime] = useState('');  // Estado para time.
  const { currentUser } = useContext(AuthContext);  // Para token.

  // Nuevos estados para modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  // Fetch therapists del backend con filtros.
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const params = new URLSearchParams({
          seguro: quizData.seguro,
          modality: quizData.modality,
          specialty: quizData.specialty
        });

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/therapists?${params.toString()}`);
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

  // Nueva: Abre modal con terapeuta seleccionado
  const handleOpen = (therapist) => {
    if (!currentUser || currentUser.role !== 'client') {
      alert('Debes loguearte como cliente para reservar.');
      return;
    }
    setSelectedTherapist(therapist);
    setShowModal(true);
    setBookingDate('');  // Limpia form al abrir
    setBookingTime('');
  };

  // Nueva: Cierra modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedTherapist(null);
  };

  // Handle submit de booking form (dinámico con selectedTherapist.id)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`  // Token para auth.
        },
        body: JSON.stringify({
          therapist_id: selectedTherapist.id,  // Dinámico!
          date: bookingDate,
          time: bookingTime
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Error en booking: ' + (errorData.error || response.statusText));
      }
      alert('Booking creado exitosamente!');
      handleClose();  // Cierra modal al éxito
    } catch (error) {
      alert('Error: ' + error.message);
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
  <Container className="py-5">
    {/* Header */}
    <Row className="text-center mb-5">
      <Col xs={12}>
        <img src="/logo.png" alt="ZONAPY Logo" className="logo" />
        <h1>Encuentra el mejor terapeuta local</h1>
        <p>Reserva una consulta gratuita hoy en todo Paraguay.</p>
        <Button href="#quiz" variant="success" size="lg" className="cta-button">
          Comienza el matching
        </Button>
      </Col>
    </Row>

    {/* 3 Pasos */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Proceso en 3 pasos</h2>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <h3>1. Dinos lo que te importa</h3>
        <p>Completa nuestro quiz de matching.</p>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <h3>2. Reserva Consulta Gratuita</h3>
        <p>Ve profiles y videos introductorios.</p>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <h3>3. Empieza Terapia</h3>
        <p>Conecta con tu terapeuta ideal.</p>
      </Col>
    </Row>

    {/* Quiz */}
    <Row id="quiz" className="quiz-section mb-5">
      <Col xs={12}>
        <h2>Dinos sobre ti</h2>
        <p>Te mostraremos terapeutas en todo Paraguay que podrían encajar contigo.</p>
      </Col>
      <Col xs={12}>
        <Form onSubmit={handleQuizSubmit}>
          <Row>
            <Col xs={12} sm={4} className="mb-3">
              <Form.Group controlId="formSeguro">
                <Form.Label>Seguro Médico</Form.Label>
                <Form.Select
                  name="seguro"
                  value={quizData.seguro}
                  onChange={(e) => setQuizData({ ...quizData, seguro: e.target.value })}
                >
                  <option value="Todos">Todos</option>
                  <option value="IPS">IPS</option>
                  <option value="Privado">Privado</option>
                  <option value="Sin seguro">Sin seguro</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4} className="mb-3">
              <Form.Group controlId="formModality">
                <Form.Label>Modalidad</Form.Label>
                <Form.Select
                  name="modality"
                  value={quizData.modality}
                  onChange={(e) => setQuizData({ ...quizData, modality: e.target.value })}
                >
                  <option value="Todas">Todas</option>
                  <option value="Online">Online</option>
                  <option value="Presencial">Presencial</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4} className="mb-3">
              <Form.Group controlId="formSpecialty">
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="specialty"
                  value={quizData.specialty}
                  onChange={(e) => setQuizData({ ...quizData, specialty: e.target.value })}
                >
                  <option value="Todas">Todas</option>
                  <option value="Ansiedad">Ansiedad</option>
                  <option value="Depresión">Depresión</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Parejas">Parejas</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit" className="mt-3">
            Buscar
          </Button>
        </Form>
      </Col>
    </Row>

    {/* Directory */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Terapeutas Vetted</h2>
      </Col>
      {filteredTherapists.length === 0 ? (
        <Col xs={12}>
          <p>No se encontraron terapeutas.</p>
        </Col>
      ) : (
        filteredTherapists.map((therapist) => (
          <Col xs={12} sm={6} md={4} key={therapist.id} className="mb-4">
            <Card className="therapist-card">
              <Card.Body>
                <Card.Title>{therapist.name}</Card.Title>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="green">
                  <circle cx="10" cy="10" r="10" />
                </svg>
                Vetted
                <Card.Text>
                  Especialidad: {therapist.specialty} <br />
                  Modalidad: {therapist.modality} <br />
                  Seguro: {therapist.seguro} <br />
                  Precio: {therapist.price}
                </Card.Text>
                <Button
                  variant="success"
                  className="cta-button"
                  onClick={() => handleOpen(therapist)}
                >
                  Reservar Consulta Gratuita
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))
      )}
    </Row>

    {/* Map */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Terapeutas en Todo Paraguay</h2>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={6}
            onLoad={loadMap}
          >
            {filteredTherapists.map((therapist) => (
              <Marker key={therapist.id} position={therapist.location} />
            ))}
          </GoogleMap>
        </LoadScript>
      </Col>
    </Row>

    {/* Testimonials */}
    <Row className="mb-5 grad-bg">
      <Col xs={12}>
        <h2>Testimonios</h2>
        <p>5K+ terapeutas vetted, 350K clientes conectados, 5M+ seekers de terapia.</p>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <p>"Excelente match" - Cliente 1</p>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <p>"Cambió mi vida" - Cliente 2</p>
      </Col>
      <Col xs={12} md={4} className="mb-3">
        <p>"Profesionales calificados" - Cliente 3</p>
      </Col>
    </Row>

    {/* Press */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Prensa</h2>
      </Col>
      <Col xs={12} md={3} className="mb-3">
        <img src="/press1.png" alt="Press Logo 1" className="mb-4" />
      </Col>
      <Col xs={12} md={3} className="mb-3">
        <img src="/press2.png" alt="Press Logo 2" className="mb-4" />
      </Col>
      <Col xs={12} md={3} className="mb-3">
        <img src="/press3.png" alt="Press Logo 3" className="mb-4" />
      </Col>
      <Col xs={12} md={3} className="mb-3">
        <img src="/press4.png" alt="Press Logo 4" className="mb-4" />
      </Col>
    </Row>

    {/* Seguros */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Seguros Médicos Aceptados</h2>
        <p>
          Nuestros terapeutas trabajan con seguros médicos locales como IPS y Privados, o sin
          seguro para accesibilidad en todo Paraguay.
        </p>
      </Col>
    </Row>

    {/* FAQs */}
    <Row className="mb-5">
      <Col xs={12}>
        <h2>Preguntas Frecuentes</h2>
        <ul>
          <li>
            ¿Cómo ZONAPY conecta clientes y terapeutas? Con matching personalizado y consultas
            gratuitas en todo Paraguay.
          </li>
          <li>¿Cómo elegir el terapeuta correcto? Usa nuestro quiz y ve videos introductorios.</li>
          <li>¿Qué hace que nuestros terapeutas sean vetted? Proceso de entrevista intensivo.</li>
          <li>¿Cómo ZONAPY ahorra costos? Consultas gratuitas y seguros aceptados.</li>
        </ul>
      </Col>
    </Row>

    {/* Footer */}
    <Row className="footer text-center">
      <Col xs={12}>
        <p>© 2025 ZONAPY – Terapia en Paraguay. Todos los derechos reservados.</p>
      </Col>
    </Row>

    {/* Modal de booking */}
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Programa tu Sesión con {selectedTherapist?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleBookingSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hora</Form.Label>
            <Form.Control
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="success" type="submit" className="cta-button">
            Reservar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  </Container>
);
}

export default Home;