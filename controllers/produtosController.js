'use strict';

const produtosModel = require('../models/produtosModel');
const politicasModel = require('../models/politicasModel');

function formatarData(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

async function buscarProduto(req, res) {
  try {
    const { codprod } = req.query;
    if (!codprod) return res.status(400).json({ erro: 'Parâmetro codprod é obrigatório.' });
    const produto = await produtosModel.buscarProdutoDw(codprod.trim());
    if (!produto) return res.status(404).json({ erro: `Produto "${codprod}" não encontrado na base de produtos ativos.` });
    res.json(produto);
  } catch (err) {
    console.error('Erro ao buscar produto:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
}

async function listarProdutos(req, res) {
  try {
    const idPolitica = parseInt(req.params.id);
    if (!idPolitica) return res.status(400).json({ erro: 'ID de política inválido.' });

    const politica = await politicasModel.buscarPorId(idPolitica);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });

    const produtos = await produtosModel.listarPorPolitica(idPolitica);
    const enriquecidos = await Promise.all(produtos.map(async (p) => {
      try {
        const dw = await produtosModel.buscarProdutoDw(p.CODPROD);
        return { ...p, FAMILIA: dw?.FAMILIA || '', PRODUTO: dw?.PRODUTO || '' };
      } catch {
        return { ...p, FAMILIA: '', PRODUTO: '' };
      }
    }));

    res.json(enriquecidos);
  } catch (err) {
    console.error('Erro ao listar produtos da política:', err.message);
    res.status(500).json({ erro: 'Erro ao listar produtos.' });
  }
}

async function adicionarProduto(req, res) {
  try {
    const idPolitica = parseInt(req.params.id);
    const { codprod } = req.body;

    if (!idPolitica) return res.status(400).json({ erro: 'ID de política inválido.' });
    if (!codprod) return res.status(400).json({ erro: 'Campo obrigatório: codprod.' });

    const politica = await politicasModel.buscarPorId(idPolitica);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });
    const produto = await produtosModel.buscarProdutoDw(codprod.trim());
    if (!produto) return res.status(404).json({ erro: `Produto "${codprod}" não encontrado na base de produtos ativos.` });
    const conflitos = await politicasModel.verificarConflitoProduto(
      codprod.trim(),
      politica.DT_INICIO,
      politica.DT_FIM,
      idPolitica
    );

    if (conflitos.length > 0) {
      const c = conflitos[0];
      return res.status(409).json({
        conflito: true,
        mensagem: `O produto "${codprod}" já está na política "${c.DESCRICAO}" com vigência ativa (${formatarData(c.DT_INICIO)} a ${formatarData(c.DT_FIM)}). Altere a vigência da política atual, exclua o produto da política conflitante, ou não adicione este produto.`,
        politicaConflitante: c,
      });
    }

    await produtosModel.adicionar(idPolitica, codprod.trim());
    res.status(201).json({ mensagem: 'Produto adicionado com sucesso.', produto });
  } catch (err) {
    if (err.number === 2627 || (err.message && err.message.includes('UQ_POLITICA_PRODUTO'))) {
      return res.status(409).json({ erro: 'Este produto já está nesta política.' });
    }
    console.error('Erro ao adicionar produto:', err.message);
    res.status(500).json({ erro: 'Erro ao adicionar produto.' });
  }
}

async function removerProduto(req, res) {
  try {
    const idPolitica = parseInt(req.params.id);
    const { codprod } = req.params;
    if (!idPolitica) return res.status(400).json({ erro: 'ID de política inválido.' });
    if (!codprod) return res.status(400).json({ erro: 'Código do produto não informado.' });
    const linhas = await produtosModel.remover(idPolitica, codprod);
    if (linhas === 0) return res.status(404).json({ erro: 'Produto não encontrado nesta política.' });

    res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover produto:', err.message);
    res.status(500).json({ erro: 'Erro ao remover produto.' });
  }
}

module.exports = { buscarProduto, listarProdutos, adicionarProduto, removerProduto };
