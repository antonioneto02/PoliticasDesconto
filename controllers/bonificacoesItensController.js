'use strict';

const bonificacoesModel = require('../models/bonificacoesModel');
const bonificacoesItensModel = require('../models/bonificacoesItensModel');
const produtosModel = require('../models/produtosModel');

async function listarItens(req, res) {
  try {
    const idPolitica = parseInt(req.params.id);
    if (!idPolitica) return res.status(400).json({ erro: 'ID inválido.' });
    const politica = await bonificacoesModel.buscarPorId(idPolitica);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });
    const itens = await bonificacoesItensModel.listarPorPolitica(idPolitica);
    res.json(itens);
  } catch (err) {
    console.error('Erro ao listar itens:', err.message);
    res.status(500).json({ erro: 'Erro ao listar itens.' });
  }
}

async function adicionarItem(req, res) {
  try {
    const idPolitica = parseInt(req.params.id);
    const { produto, qtd_vendida, qtd_boni } = req.body;
    if (!idPolitica) return res.status(400).json({ erro: 'ID inválido.' });
    if (!produto || qtd_vendida == null || qtd_boni == null) {
      return res.status(400).json({ erro: 'Campos obrigatórios: produto, qtd_vendida, qtd_boni.' });
    }
    if (parseFloat(qtd_vendida) <= 0 || parseFloat(qtd_boni) <= 0) {
      return res.status(400).json({ erro: 'As quantidades devem ser maiores que zero.' });
    }
    const politica = await bonificacoesModel.buscarPorId(idPolitica);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });
    const produtoExiste = await produtosModel.buscarProdutoDw(produto.trim());
    if (!produtoExiste) return res.status(404).json({ erro: `Produto "${produto}" não encontrado na base de produtos ativos.` });

    const id = await bonificacoesItensModel.adicionar(idPolitica, produto.trim(), parseFloat(qtd_vendida), parseFloat(qtd_boni));
    res.status(201).json({ id, mensagem: 'Item adicionado com sucesso.', produto: produtoExiste });
  } catch (err) {
    if (err.number === 2627 || (err.message && err.message.includes('UQ_BONIFICACAO_PRODUTO'))) {
      return res.status(409).json({ erro: 'Este produto já está nesta política.' });
    }
    console.error('Erro ao adicionar item:', err.message);
    res.status(500).json({ erro: 'Erro ao adicionar item.' });
  }
}

async function atualizarItem(req, res) {
  try {
    const itemId = parseInt(req.params.itemId);
    const { qtd_vendida, qtd_boni } = req.body;
    if (!itemId) return res.status(400).json({ erro: 'ID do item inválido.' });
    if (qtd_vendida == null || qtd_boni == null) {
      return res.status(400).json({ erro: 'Campos obrigatórios: qtd_vendida, qtd_boni.' });
    }
    if (parseFloat(qtd_vendida) <= 0 || parseFloat(qtd_boni) <= 0) {
      return res.status(400).json({ erro: 'As quantidades devem ser maiores que zero.' });
    }
    const item = await bonificacoesItensModel.buscarPorId(itemId);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    await bonificacoesItensModel.atualizar(itemId, parseFloat(qtd_vendida), parseFloat(qtd_boni));
    res.json({ mensagem: 'Item atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar item:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar item.' });
  }
}

async function removerItem(req, res) {
  try {
    const itemId = parseInt(req.params.itemId);
    if (!itemId) return res.status(400).json({ erro: 'ID do item inválido.' });
    const linhas = await bonificacoesItensModel.remover(itemId);
    if (linhas === 0) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json({ mensagem: 'Item removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover item:', err.message);
    res.status(500).json({ erro: 'Erro ao remover item.' });
  }
}

module.exports = { listarItens, adicionarItem, atualizarItem, removerItem };
