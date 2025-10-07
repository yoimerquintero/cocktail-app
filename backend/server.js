const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Datos de demo para usuarios (sin base de datos)
let users = [];
let savedCocktails = [];

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    mode: 'Demo (sin base de datos)',
    timestamp: new Date().toISOString()
  });
});

// RUTAS DE CÓCTELES

// Buscar cócteles por nombre
app.get('/api/cocktails/search', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "name" es requerido'
      });
    }

    console.log(`🔍 Buscando cócteles con nombre: ${name}`);
    const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`);
    
    res.json({
      success: true,
      data: response.data.drinks || [],
      count: response.data.drinks ? response.data.drinks.length : 0
    });
  } catch (error) {
    console.error('❌ Error buscando cócteles:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al buscar cócteles: ' + error.message
    });
  }
});

// Obtener cóctel aleatorio
app.get('/api/cocktails/random', async (req, res) => {
  try {
    console.log('🎲 Obteniendo cóctel aleatorio');
    const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
    
    res.json({
      success: true,
      data: response.data.drinks ? response.data.drinks[0] : null
    });
  } catch (error) {
    console.error('❌ Error obteniendo cóctel aleatorio:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cóctel aleatorio: ' + error.message
    });
  }
});

// Obtener cócteles guardados
app.get('/api/cocktails/saved', (req, res) => {
  res.json({
    success: true,
    data: savedCocktails,
    count: savedCocktails.length
  });
});

// Guardar cóctel
app.post('/api/cocktails/save', (req, res) => {
  try {
    const { cocktailId } = req.body;
    
    if (!cocktailId) {
      return res.status(400).json({
        success: false,
        message: 'El cocktailId es requerido'
      });
    }

    // Simular guardado
    const cocktail = {
      id: Date.now(),
      cocktailId,
      strDrink: `Cóctel ${cocktailId}`,
      strDrinkThumb: 'https://via.placeholder.com/150',
      savedAt: new Date().toISOString()
    };

    savedCocktails.push(cocktail);

    res.status(201).json({
      success: true,
      data: cocktail,
      message: 'Cóctel guardado exitosamente (demo mode)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// RUTAS DE AUTENTICACIÓN

// Registrar usuario
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }

  // Verificar si el usuario ya existe
  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Crear usuario
  const user = {
    id: Date.now(),
    name,
    email,
    token: 'demo-token-' + Date.now()
  };

  users.push(user);

  res.status(201).json({
    success: true,
    data: user,
    message: 'User registered successfully (demo mode)'
  });
});

// Login de usuario
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Simular login exitoso
  const user = {
    id: 1,
    name: 'Demo User',
    email,
    token: 'demo-token'
  };

  res.json({
    success: true,
    data: user,
    message: 'Login successful (demo mode)'
  });
});

// Obtener información del usuario actual
app.get('/api/auth/me', (req, res) => {
  // Simular usuario autenticado
  const user = {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com'
  };

  res.json({
    success: true,
    data: user
  });
});

// RUTAS DE PRODUCTOS

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Endpoint de productos - por implementar'
  });
});

// Ruta de prueba adicional
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '¡Backend funcionando correctamente!',
    routes: {
      health: '/api/health',
      cocktails: {
        search: '/api/cocktails/search?name=margarita',
        random: '/api/cocktails/random',
        saved: '/api/cocktails/saved'
      },
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        me: '/api/auth/me'
      }
    }
  });
});

// Manejo de errores para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/test',
      'GET /api/cocktails/search?name=...',
      'GET /api/cocktails/random',
      'GET /api/cocktails/saved',
      'POST /api/cocktails/save',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/products'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Test completo: http://localhost:${PORT}/api/test`);
  console.log(`🍹 Buscar margaritas: http://localhost:${PORT}/api/cocktails/search?name=margarita`);
  console.log(`🎲 Cóctel aleatorio: http://localhost:${PORT}/api/cocktails/random`);
  console.log(`💡 Frontend: http://localhost:3001`);
  console.log(`🔧 Modo: Demo (sin base de datos)`);
});