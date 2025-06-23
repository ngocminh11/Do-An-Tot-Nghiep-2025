
require('dotenv').config(); // Load biến môi trường sớm nhất

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('mongo-sanitize');

// Routes
const chatRoutes = require('./Routes/chat.routes');
const adminRoutes = require('./Routes/admin.routes');
const userRoutes = require('./Routes/user.routes');
const authRoutes = require('./Routes/auth.routes');

const app = express();
const server = http.createServer(app);

//============================ SOCKET.IO ===================================
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

//========================= MIDDLEWARE SETUP ===============================

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Secure HTTP headers
app.use(helmet());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize input against NoSQL Injection
app.use((req, res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    if (req[key]) {
      req[key] = mongoSanitize(req[key]);
    }
  });
  next();
});

// XSS protection middleware
function sanitizeXSS(obj) {
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeXSS(obj[key]);
      }
    }
  }
}

app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach((key) => {
    if (req[key]) sanitizeXSS(req[key]);
  });
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable GZIP compression
app.use(compression());

//============================= RATE LIMITING ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

//============================== ROUTES ====================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/chat', chatRoutes);
app.use('/admin/', adminRoutes);
app.use('/', userRoutes);
app.use('/', authRoutes);

//============================= 404 HANDLER ================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

//=========================== ERROR HANDLING ===============================
app.use((err, req, res, next) => {
  console.error('', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

//========================= MONGODB CONNECT ================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
