const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authController');
const errorHandler = require('./middlewares/errorHandler');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();



const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes );

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
