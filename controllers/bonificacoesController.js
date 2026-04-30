'use strict';

const bonificacoesModel = require('../models/bonificacoesModel');
const bonificacoesItensModel = require('../models/bonificacoesItensModel');

async function listar(req, res) {
  try {
    const dados = await bonificacoesModel.listar();
    res.json(dados);
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

async function criar(req, res) {
  try {
    const { grupo, dt_inicio, dt_fim } = req.body;
    if (!grupo || !dt_inicio || !dt_fim) {
      return res.status(400).json({ erro: 'Campos obrigatórios: grupo, dt_inicio, dt_fim.' });
    }
    if (new Date(dt_inicio) >= new Date(dt_fim)) {
      return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
    }
    const id = await bonificacoesModel.criar(grupo.trim(), dt_inicio, dt_fim);
    res.status(201).json({ id, mensagem: 'Política de bonificação criada com sucesso.' });
  } catch (err) {
    console.error('Erro ao criar bonificação:', err.message);
    res.status(500).json({ erro: 'Erro ao criar bonificação.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { grupo, dt_inicio, dt_fim } = req.body;
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });
    if (!grupo || !dt_inicio || !dt_fim) {
      return res.status(400).json({ erro: 'Campos obrigatórios: grupo, dt_inicio, dt_fim.' });
    }
    if (new Date(dt_inicio) >= new Date(dt_fim)) {
      return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
    }
    const existente = await bonificacoesModel.buscarPorId(id);
    if (!existente) return res.status(404).json({ erro: 'Política não encontrada.' });
    await bonificacoesModel.atualizar(id, grupo.trim(), dt_inicio, dt_fim);
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
    const { grupo, dt_inicio, dt_fim } = req.body;
    if (!idOrigem) return res.status(400).json({ erro: 'ID inválido.' });
    if (!grupo || !dt_inicio || !dt_fim) {
      return res.status(400).json({ erro: 'Campos obrigatórios: grupo, dt_inicio, dt_fim.' });
    }
    if (new Date(dt_inicio) >= new Date(dt_fim)) {
      return res.status(400).json({ erro: 'A data de início deve ser anterior à data de fim.' });
    }
    const origem = await bonificacoesModel.buscarPorId(idOrigem);
    if (!origem) return res.status(404).json({ erro: 'Política de origem não encontrada.' });

    const novoId = await bonificacoesModel.criar(grupo.trim(), dt_inicio, dt_fim);
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

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar, replicar };
