'use strict';

const bonificacoesModel = require('../models/bonificacoesModel');
const bonificacoesItensModel = require('../models/bonificacoesItensModel');
const produtosModel = require('../models/produtosModel');

async function listar(req, res) {
  try {
    res.json(await bonificacoesModel.listar());
  } catch (err) {
    console.error('Erro ao listar bonificações:', err.message);
    res.status(500).json({ erro: 'Erro ao listar bonificações.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const politica = await bonificacoesModel.buscarPorId(id);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });
    res.json(politica);
  } catch (err) {
    console.error('Erro ao buscar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar bonificação.' });
  }
}

async function _validarCampos(body, res) {
  const { codgrupo, produto, qtd_vendida, qtd_boni, dt_inicio, dt_fim } = body;
  if (!codgrupo || !produto || qtd_vendida == null || qtd_boni == null || !dt_inicio || !dt_fim)
    return res.status(400).json({ erro: 'Campos obrigatórios: codgrupo, produto, qtd_vendida, qtd_boni, dt_inicio, dt_fim.' });
  if (parseFloat(qtd_vendida) <= 0 || parseFloat(qtd_boni) <= 0)
    return res.status(400).json({ erro: 'As quantidades devem ser maiores que zero.' });
  if (new Date(dt_inicio) >= new Date(dt_fim))
    return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
  return null;
}

async function criar(req, res) {
  try {
    const err = await _validarCampos(req.body, res); if (err) return;
    const { codgrupo, produto, qtd_vendida, qtd_boni, dt_inicio, dt_fim } = req.body;
    const grupo = await bonificacoesModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    const prod = await produtosModel.buscarProdutoDw(produto.trim());
    if (!prod) return res.status(404).json({ erro: `Produto "${produto}" não encontrado.` });
    const id = await bonificacoesModel.criar(codgrupo.trim(), produto.trim(), parseFloat(qtd_vendida), parseFloat(qtd_boni), dt_inicio, dt_fim);
    res.status(201).json({ id, mensagem: 'Política de bonificação criada com sucesso.' });
  } catch (err) {
    console.error('Erro ao criar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao criar bonificação.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const valErr = await _validarCampos(req.body, res); if (valErr) return;
    const { codgrupo, produto, qtd_vendida, qtd_boni, dt_inicio, dt_fim } = req.body;
    const existente = await bonificacoesModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    const grupo = await bonificacoesModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    const prod = await produtosModel.buscarProdutoDw(produto.trim());
    if (!prod) return res.status(404).json({ erro: `Produto "${produto}" não encontrado.` });
    await bonificacoesModel.atualizar(id, codgrupo.trim(), produto.trim(), parseFloat(qtd_vendida), parseFloat(qtd_boni), dt_inicio, dt_fim);
    res.json({ mensagem: 'Política de bonificação atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar bonificação.' });
  }
}

async function excluir(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await bonificacoesModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await bonificacoesModel.excluir(id);
    res.json({ mensagem: 'Política de bonificação excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao excluir bonificação.' });
  }
}

async function ativar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await bonificacoesModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await bonificacoesModel.ativar(id);
    res.json({ mensagem: 'Política ativada com sucesso.' });
  } catch (err) {
    console.error('Erro ao ativar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao ativar bonificação.' });
  }
}

async function inativar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await bonificacoesModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await bonificacoesModel.inativar(id);
    res.json({ mensagem: 'Política inativada com sucesso.' });
  } catch (err) {
    console.error('Erro ao inativar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao inativar bonificação.' });
  }
}

async function replicar(req, res) {
  try {
    const idOrigem = parseInt(req.params.id);
    if (!idOrigem) return res.status(400).json({ erro: 'ID inválido.' });
    const valErr = await _validarCampos(req.body, res); if (valErr) return;
    const { codgrupo, produto, qtd_vendida, qtd_boni, dt_inicio, dt_fim } = req.body;
    const origem = await bonificacoesModel.buscarPorId(idOrigem);
    if (!origem) return res.status(404).json({ erro: 'Política de origem não encontrada.' });
    const grupo = await bonificacoesModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    const prod = await produtosModel.buscarProdutoDw(produto.trim());
    if (!prod) return res.status(404).json({ erro: `Produto "${produto}" não encontrado.` });
    const novoId = await bonificacoesModel.criar(codgrupo.trim(), produto.trim(), parseFloat(qtd_vendida), parseFloat(qtd_boni), dt_inicio, dt_fim);
    const itens = await bonificacoesItensModel.listarPorPolitica(idOrigem);
    for (const item of itens) {
      await bonificacoesItensModel.adicionar(novoId, item.PRODUTO, item.QTD_VENDIDA, item.QTD_BONI);
    }
    res.status(201).json({ id: novoId, mensagem: `Política replicada com sucesso. Novo ID: ${novoId}.` });
  } catch (err) {
    console.error('Erro ao replicar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao replicar bonificação.' });
  }
}

async function buscarGrupo(req, res) {
  try {
    const { codgrupo } = req.query;
    if (!codgrupo) return res.status(400).json({ erro: 'Parâmetro codgrupo é obrigatório.' });
    const grupo = await bonificacoesModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    res.json(grupo);
  } catch (err) {
    console.error('Erro ao buscar grupo:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar grupo.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar, replicar, buscarGrupo };
