// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

const port = 3000;

// Define the Sequelize connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Turn off logging to avoid deprecation warning
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Set to true in production
    },
  },
});

// Define the User model
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.status(200).json(users);
});

// Get a user by ID
app.get('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.status(204).json({ message: 'User deleted' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Test the connection and sync the models
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening at http://98.81.224.24:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
