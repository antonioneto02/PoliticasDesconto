'use strict';

const politicaDescontoModel = require('../models/politicaDescontoModel');
const produtosModel = require('../models/produtosModel');

async function listar(req, res) {
  try {
    res.json(await politicaDescontoModel.listar());
  } catch (err) {
    console.error('Erro ao listar políticas de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao listar políticas de desconto.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const politica = await politicaDescontoModel.buscarPorId(id);
    if (!politica) return res.status(404).json({ erro: 'Política não encontrada.' });
    res.json(politica);
  } catch (err) {
    console.error('Erro ao buscar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar política de desconto.' });
  }
}

function _validarCampos(body, res) {
  const { codgrupo, produto, perc_desc, dt_inicio, dt_fim } = body;
  if (!codgrupo || !produto || perc_desc == null || !dt_inicio || !dt_fim)
    return res.status(400).json({ erro: 'Campos obrigatórios: codgrupo, produto, perc_desc, dt_inicio, dt_fim.' });
  if (parseFloat(perc_desc) < 0 || parseFloat(perc_desc) > 100)
    return res.status(400).json({ erro: 'O percentual de desconto deve estar entre 0 e 100.' });
  if (new Date(dt_inicio) >= new Date(dt_fim))
    return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
  return null;
}

async function criar(req, res) {
  try {
    const err = _validarCampos(req.body, res); if (err) return;
    const { codgrupo, produto, perc_desc, dt_inicio, dt_fim } = req.body;
    const grupo = await politicaDescontoModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    const prod = await produtosModel.buscarProdutoDw(produto.trim());
    if (!prod) return res.status(404).json({ erro: `Produto "${produto}" não encontrado.` });
    const id = await politicaDescontoModel.criar(codgrupo.trim(), produto.trim(), parseFloat(perc_desc), dt_inicio, dt_fim);
    res.status(201).json({ id, mensagem: 'Política de desconto criada com sucesso.' });
  } catch (err) {
    console.error('Erro ao criar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao criar política de desconto.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const valErr = _validarCampos(req.body, res); if (valErr) return;
    const { codgrupo, produto, perc_desc, dt_inicio, dt_fim } = req.body;
    const existente = await politicaDescontoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    const grupo = await politicaDescontoModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    const prod = await produtosModel.buscarProdutoDw(produto.trim());
    if (!prod) return res.status(404).json({ erro: `Produto "${produto}" não encontrado.` });
    await politicaDescontoModel.atualizar(id, codgrupo.trim(), produto.trim(), parseFloat(perc_desc), dt_inicio, dt_fim);
    res.json({ mensagem: 'Política de desconto atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar política de desconto.' });
  }
}

async function excluir(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await politicaDescontoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await politicaDescontoModel.excluir(id);
    res.json({ mensagem: 'Política de desconto excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao excluir política de desconto.' });
  }
}

async function ativar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await politicaDescontoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await politicaDescontoModel.ativar(id);
    res.json({ mensagem: 'Política ativada com sucesso.' });
  } catch (err) {
    console.error('Erro ao ativar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao ativar política de desconto.' });
  }
}

async function inativar(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    const existente = await politicaDescontoModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await politicaDescontoModel.inativar(id);
    res.json({ mensagem: 'Política inativada com sucesso.' });
  } catch (err) {
    console.error('Erro ao inativar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao inativar política de desconto.' });
  }
}

async function replicar(req, res) {
  try {
    const idOrigem = parseInt(req.params.id);
    if (!idOrigem) return res.status(400).json({ erro: 'ID inválido.' });
    const origem = await politicaDescontoModel.buscarPorId(idOrigem);
    if (!origem) return res.status(404).json({ erro: 'Política de origem não encontrada.' });
    const { codgrupo, perc_desc, dt_inicio, dt_fim } = req.body;
    if (!dt_inicio || !dt_fim) return res.status(400).json({ erro: 'dt_inicio e dt_fim são obrigatórios.' });
    if (new Date(dt_inicio) >= new Date(dt_fim))
      return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
    const novoGrupo = codgrupo ? codgrupo.trim() : origem.CODGRUPO;
    const novoPerc  = perc_desc != null ? parseFloat(perc_desc) : parseFloat(origem.PERC_DESC);
    const grupo = await politicaDescontoModel.buscarGrupoDw(novoGrupo);
    if (!grupo) return res.status(404).json({ erro: `Grupo "${novoGrupo}" não encontrado.` });
    const novoId = await politicaDescontoModel.criar(novoGrupo, origem.PRODUTO, novoPerc, dt_inicio, dt_fim);
    res.status(201).json({ id: novoId, mensagem: `Política replicada com sucesso. Novo ID: ${novoId}.` });
  } catch (err) {
    console.error('Erro ao replicar política de desconto:', err.message);
    res.status(500).json({ erro: 'Erro ao replicar política de desconto.' });
  }
}

async function buscarGrupo(req, res) {
  try {
    const { codgrupo } = req.query;
    if (!codgrupo) return res.status(400).json({ erro: 'Parâmetro codgrupo é obrigatório.' });
    const grupo = await politicaDescontoModel.buscarGrupoDw(codgrupo.trim());
    if (!grupo) return res.status(404).json({ erro: `Grupo "${codgrupo}" não encontrado.` });
    res.json(grupo);
  } catch (err) {
    console.error('Erro ao buscar grupo:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar grupo.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar, replicar, buscarGrupo };
