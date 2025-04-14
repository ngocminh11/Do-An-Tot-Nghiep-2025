const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./Config/db');
const requestLogger = require('./Middlewares/requestLogger');

// Load env
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(requestLogger); // 👈 Ghi log request/response
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.get('/test', (req, res) => {
    res.status(200).send({ message: 'Hello, world!' });
  });
  
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
