import express from 'express';  // Servidor web simple.
import sqlite3 from 'sqlite3';  // DB local (usa verbose para logs).
import bcrypt from 'bcrypt';  // Encripta passwords.
import jwt from 'jsonwebtoken';  // Tokens for auth.
import cors from 'cors';  // Permite requests de front.

const app = express();  // Crea app server.
app.use(express.json());  // Lee JSON en requests.
app.use(cors());  // Permite front (localhost:5173) conectar.

const db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);  // Crea/abre DB file.
const SECRET_KEY = 'tu_secreto_super_secreto';  // Cambia esto a algo único y secreto (e.g., una frase larga).

// Crea tablas si no existen.
db.serialize(() => {
  try {
    console.log('Creando tabla users...');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    console.log('Creando tabla therapists...');
    db.run(`CREATE TABLE IF NOT EXISTS therapists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      therapist_id INTEGER,
      date TEXT,
      time TEXT
    )`);

    // Datos iniciales (solo si no existen).
    console.log('Insertando datos iniciales...');
    db.run("INSERT OR IGNORE INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Jorge Gutierrez', 'Ansiedad', 'Online', 'IPS', 'Gs. 200.000', -25.2637, -57.5759, 1)");
    db.run("INSERT OR IGNORE INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Ana López', 'Depresión', 'Presencial', 'Privado', 'Gs. 180.000', -25.2805, -57.6359, 1)");
    db.run("INSERT OR IGNORE INTO therapists (name, specialty, modality, seguro, price, location_lat, location_lng, verified) VALUES ('Carlos Pérez', 'Parejas', 'Online', 'Sin seguro', 'Gs. 150.000', -25.3, -57.6, 1)");
  } catch (error) {
    console.error('Error creando tablas o datos:', error);
  }
});

// Rutas API (endpoints) – mismo que antes, con logs extra.
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    console.log('Registrando user:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role], (err) => {
      if (err) {
        console.error('Error en register:', err);
        return res.status(500).json({ error: 'Error registrando: ' + err.message });
      }
      res.json({ message: 'Registrado ok' });
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error en registro: ' + error.message });
  }
});

// Login – igual con log.
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt para:', email);
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      console.error('User no encontrado');
      return res.status(401).json({ error: 'User no encontrado' });
    }
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Password mal' });
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en login: ' + error.message });
    }
  });
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

// Get therapists – con filtros y log.
app.get('/therapists', (req, res) => {
  console.log('Fetch therapists con filtros:', req.query);
  let sql = 'SELECT * FROM therapists WHERE verified = 1';
  const params = [];
  if (req.query.seguro && req.query.seguro !== 'Todos') {
    sql += ' AND seguro = ?';
    params.push(req.query.seguro);
  }
  if (req.query.modality && req.query.modality !== 'Todas') {
    sql += ' AND modality = ?';
    params.push(req.query.modality);
  }
  if (req.query.specialty && req.query.specialty !== 'Todas') {
    sql += ' AND specialty = ?';
    params.push(req.query.specialty);
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching therapists:', err);
      return res.status(500).json({ error: 'Error fetching: ' + err.message });
    }
    res.json(rows);
  });
});

// POST /bookings (protegida con auth, guarda en DB).
app.post('/bookings', authenticate, (req, res) => {
  const { therapist_id, date, time } = req.body;
  const client_id = req.user.id;  // Del token (user logueado).
  try {
    console.log('Creando booking para client_id:', client_id);
    db.run('INSERT INTO bookings (client_id, therapist_id, date, time) VALUES (?, ?, ?, ?)', [client_id, therapist_id, date, time], (err) => {
      if (err) {
        console.error('Error en booking:', err);
        return res.status(500).json({ error: 'Error creando booking: ' + err.message });
      }
      res.json({ message: 'Booking creado ok' });
    });
  } catch (error) {
    console.error('Error en booking:', error);
    res.status(500).json({ error: 'Error en booking: ' + error.message });
  }
});

// Nueva: GET /bookings (protegida, filtra por client_id del user).
app.get('/bookings', authenticate, (req, res) => {
  const client_id = req.user.id;  // Del token.
  console.log('Fetching bookings para client_id:', client_id);
  db.all('SELECT * FROM bookings WHERE client_id = ?', [client_id], (err, rows) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Error fetching bookings: ' + err.message });
    }
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Server en puerto 3000'));  // Inicia.