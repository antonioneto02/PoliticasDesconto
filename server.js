'use strict';

require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');

const politicasController = require('./controllers/politicasController');
const produtosController = require('./controllers/produtosController');

const app = express();
const PORT = process.env.PORT || 3014;

// Middleware
app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://192.168.0.88:3000',
    'https://192.168.0.88:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'politicas-desconto', port: PORT });
});

// ── Produtos DW (busca) ───────────────────────────────────────────────────────
// GET /api/produtos/buscar?codprod=XXX
app.get('/api/produtos/buscar', produtosController.buscarProduto);

// ── Políticas ─────────────────────────────────────────────────────────────────
// GET    /api/politicas
app.get('/api/politicas', politicasController.listar);

// GET    /api/politicas/:id
app.get('/api/politicas/:id', politicasController.buscarPorId);

// POST   /api/politicas
app.post('/api/politicas', politicasController.criar);

// PUT    /api/politicas/:id
app.put('/api/politicas/:id', politicasController.atualizar);

// DELETE /api/politicas/:id
app.delete('/api/politicas/:id', politicasController.excluir);

// POST   /api/politicas/:id/replicar
app.post('/api/politicas/:id/replicar', politicasController.replicar);

// ── Produtos de uma política ──────────────────────────────────────────────────
// GET    /api/politicas/:id/produtos
app.get('/api/politicas/:id/produtos', produtosController.listarProdutos);

// POST   /api/politicas/:id/produtos
app.post('/api/politicas/:id/produtos', produtosController.adicionarProduto);

// DELETE /api/politicas/:id/produtos/:codprod
app.delete('/api/politicas/:id/produtos/:codprod', produtosController.removerProduto);

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Políticas de Desconto rodando em http://localhost:${PORT}`);
});
