import express from 'express';  // Servidor web simple.
import pg from 'pg';  // Nueva lib para PostgreSQL.
import bcrypt from 'bcrypt';  // Encripta passwords.
import jwt from 'jsonwebtoken';  // Tokens for auth.
import cors from 'cors';  // Permite requests de front.

const app = express();  // Crea app server.
app.use(express.json());  // Lee JSON en requests.
app.use(cors({ origin: '*' }));  // Permite todo por ahora; cambia a tu dominio en prod.

const SECRET_KEY = 'tu_secreto_super_secreto';  // Usa .env en futuro.

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,  // Render setea esto auto; local usa .env.
  ssl: { rejectUnauthorized: false }  // Para conexiones seguras en cloud.
});

// Crea tablas si no existen (async para pg).
(async () => {
  const client = await pool.connect();
  try {
    console.log('Creando tabla users...');
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    console.log('Creando tabla therapists...');
    await client.query(`CREATE TABLE IF NOT EXISTS therapists (
      id SERIAL PRIMARY KEY,
      name TEXT,
      specialty TEXT,
      modality TEXT,
      seguro TEXT,
      price TEXT,
      location_lat REAL,
      location_lng REAL,
      verified INTEGER DEFAULT 0
    )`);

    console.log('Creando tabla bookings...');
    await client.query(`CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      client_id INTEGER,
      therapist_id INTEGER,
      date TEXT,
      time TEXT
    )`);

    // Chequea e inserta datos fake si tabla vacía.
    const res = await client.query('SELECT COUNT(*) as count FROM therapists');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Insertando datos iniciales...');
      await client.query("INSERT INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Jorge Gutierrez', 'Ansiedad', 'Online', 'IPS', 'Gs. 200.000', -25.2637, -57.5759, 1)");
      await client.query("INSERT INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Ana López', 'Depresión', 'Presencial', 'Privado', 'Gs. 180.000', -25.2805, -57.6359, 1)");
      await client.query("INSERT INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Carlos Pérez', 'Parejas', 'Online', 'Sin seguro', 'Gs. 150.000', -25.3, -57.6, 1)");
    } else {
      console.log('Datos iniciales ya existen, saltando insert.');
    }
  } catch (error) {
    console.error('Error creando tablas o datos:', error);
  } finally {
    client.release();
  }
})();

// Rutas (adaptadas a pg – usa $1, $2 para params).
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', [email, hashedPassword, role]);
    res.json({ message: 'Registrado ok' });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error registrando: ' + error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'User no encontrado' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Password mal' });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login: ' + error.message });
  }
});

// Middleware auth – mismo.
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Get therapists – con filtros.
app.get('/therapists', async (req, res) => {
  try {
    let sql = 'SELECT * FROM therapists WHERE verified = 1';
    const params = [];
    let paramIndex = 1;
    if (req.query.seguro && req.query.seguro !== 'Todos') {
      sql += ` AND seguro = $${paramIndex++}`;
      params.push(req.query.seguro);
    }
    if (req.query.modality && req.query.modality !== 'Todas') {
      sql += ` AND modality = $${paramIndex++}`;
      params.push(req.query.modality);
    }
    if (req.query.specialty && req.query.specialty !== 'Todas') {
      sql += ` AND specialty = $${paramIndex++}`;
      params.push(req.query.specialty);
    }
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Error fetching: ' + error.message });
  }
});

// POST /bookings.
app.post('/bookings', authenticate, async (req, res) => {
  const { therapist_id, date, time } = req.body;
  const client_id = req.user.id;
  try {
    await pool.query('INSERT INTO bookings (client_id, therapist_id, date, time) VALUES ($1, $2, $3, $4)', [client_id, therapist_id, date, time]);
    res.json({ message: 'Booking creado ok' });
  } catch (error) {
    console.error('Error en booking:', error);
    res.status(500).json({ error: 'Error creando booking: ' + error.message });
  }
});

// GET /bookings.
app.get('/bookings', authenticate, async (req, res) => {
  const client_id = req.user.id;
  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE client_id = $1', [client_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings: ' + error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server en puerto ${port}`));