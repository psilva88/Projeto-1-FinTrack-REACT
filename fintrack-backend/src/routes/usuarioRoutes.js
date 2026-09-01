const express = require('express');
const router = express.Router();

const controller = require('../controllers/usuarioController');
const autenticar = require('../middlewares/auth');
const somenteAdmin = require('../middlewares/admin');

router.use(autenticar);

router.get('/', somenteAdmin, controller.listar);
router.delete('/:id', somenteAdmin, controller.remover);

router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);

module.exports = router;
