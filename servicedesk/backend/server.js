require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const userRoutes = require('./src/routes/userRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const slaRoutes = require('./src/routes/slaRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5181',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

const path = require('path');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'ServiceDesk API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/sla', slaRoutes);
app.use('/api/v1/settings', settingsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

const http = require('http');
const { initSocket } = require('./src/config/socket');

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  await dbConnection();
  server.listen(PORT, () => {
    console.log(`ServiceDesk API with WebSockets running on port ${PORT}`);
  });
};

startServer();

