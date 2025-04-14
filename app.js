// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Import database connection
const connectDB = require('./Config/db');

// Import custom modules
const requestLogger = require('./Middlewares/requestLogger');

// Import routes
const authRoutes = require('./Routes/authRoutes');

// Load env
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(requestLogger); //Ghi log request/response
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Routes
app.use('/api/auth', authRoutes);

  
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
