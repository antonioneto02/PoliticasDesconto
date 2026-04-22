'use strict';
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./logger');
const { swaggerUi, swaggerDocument } = require('./swagger');
const politicasController = require('./controllers/politicasController');
const produtosController = require('./controllers/produtosController');
const app = express();
const PORT = process.env.PORT || 3014;

app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://192.168.0.88:3000',
    'https://192.168.0.88:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'politicas-desconto', port: PORT });
});

app.get('/api/produtos/buscar', produtosController.buscarProduto);
app.get('/api/politicas', politicasController.listar);
app.get('/api/politicas/:id', politicasController.buscarPorId);
app.post('/api/politicas', politicasController.criar);
app.put('/api/politicas/:id', politicasController.atualizar);
app.delete('/api/politicas/:id', politicasController.excluir);
app.patch('/api/politicas/:id/ativar', politicasController.ativar);
app.patch('/api/politicas/:id/inativar', politicasController.inativar);
app.post('/api/politicas/:id/replicar', politicasController.replicar);
app.post('/api/politicas/11/sincronizar', politicasController.sincronizarPolitica11);
app.get('/api/politicas/:id/produtos', produtosController.listarProdutos);
app.post('/api/politicas/:id/produtos', produtosController.adicionarProduto);
app.delete('/api/politicas/:id/produtos/:codprod', produtosController.removerProduto);

app.use((err, req, res, next) => {
  logger.error('Erro não tratado: %s', err.stack || err.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function executarSincronizacao() {
  try {
    const { sincronizarProdutosNovos } = require('./models/produtosModel');
    const adicionados = await sincronizarProdutosNovos(11);
    if (adicionados > 0) logger.info(`Sincronização automática: ${adicionados} produto(s) novo(s) adicionado(s) à política 11.`);
  } catch (err) {
    logger.error(`Erro na sincronização automática da política 11: ${err.message}`);
  }
}

app.listen(PORT, () => {
  logger.info(`Políticas de Desconto rodando em http://localhost:${PORT}`);
  logger.info(`Swagger disponível em http://localhost:${PORT}/api-docs`);
  executarSincronizacao();
  setInterval(executarSincronizacao, 60 * 60 * 1000); // a cada 1 hora
});
