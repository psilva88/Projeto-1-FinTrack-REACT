const express = require('express');
const router = express.Router();

const { registrar, login, perfil } = require('../controllers/authController');
const autenticar = require('../middlewares/auth');

// Rotas públicas
router.post('/register', registrar);
router.post('/login', login);

// Rota protegida — exige token
router.get('/perfil', autenticar, perfil);

module.exports = router;
