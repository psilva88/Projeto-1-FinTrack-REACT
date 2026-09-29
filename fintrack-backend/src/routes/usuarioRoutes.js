const express = require('express');
const router = express.Router();

const controller = require('../controllers/usuarioController');
const autenticar = require('../middlewares/auth');
const somenteAdmin = require('../middlewares/admin');

router.use(autenticar);

router.get('/', somenteAdmin, controller.listar);

// Precisa vir antes de '/:id' não por conflito de rota, mas para deixar
// agrupadas as rotas restritas a administradores
router.get('/:id/resumo', somenteAdmin, controller.resumoDeDados);
router.delete('/:id', somenteAdmin, controller.remover);

router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);

module.exports = router;
