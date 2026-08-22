const express = require('express');
const router = express.Router();

const controller = require('../controllers/usuarioController');
const autenticar = require('../middlewares/auth');
const somenteAdmin = require('../middlewares/admin');

router.use(autenticar);

// Listar todos e excluir: apenas administradores
router.get('/', somenteAdmin, controller.listar);
router.delete('/:id', somenteAdmin, controller.remover);

// O próprio usuário (ou um admin) pode ver e editar
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);

module.exports = router;
