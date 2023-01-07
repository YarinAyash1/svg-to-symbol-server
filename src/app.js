const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

// Use Morgan to log HTTP requests
app.use(morgan('dev'));

// Use Helmet to secure the app with various HTTP headers
app.use(helmet());

// Enable CORS for the app
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Hello world',
    });
});

// Mount the API router
app.use('/api/v1', api);

// Use the custom middlewares for 404 and error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;