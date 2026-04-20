'use strict';

const { getPoolPoliticas, sql } = require('../config/dbConfig');

async function listar() {
  const pool = await getPoolPoliticas();
  const result = await pool.request().query(`
    SELECT ID, DESCRICAO, PERC_DESCONTO, DT_INICIO, DT_FIM, DT_CRIACAO
    FROM dbo.POLITICAS_DESCONTO
    WHERE ATIVO = 1
    ORDER BY DT_CRIACAO DESC
  `);
  return result.recordset;
}

async function buscarPorId(id) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT ID, DESCRICAO, PERC_DESCONTO, DT_INICIO, DT_FIM, DT_CRIACAO
      FROM dbo.POLITICAS_DESCONTO
      WHERE ID = @id AND ATIVO = 1
    `);
  return result.recordset[0] || null;
}

async function criar(descricao, percDesconto, dtInicio, dtFim) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('descricao', sql.VarChar(255), descricao)
    .input('percDesconto', sql.Decimal(5, 2), percDesconto)
    .input('dtInicio', sql.DateTime2, new Date(dtInicio))
    .input('dtFim', sql.DateTime2, new Date(dtFim))
    .query(`
      INSERT INTO dbo.POLITICAS_DESCONTO (DESCRICAO, PERC_DESCONTO, DT_INICIO, DT_FIM)
      OUTPUT INSERTED.ID
      VALUES (@descricao, @percDesconto, @dtInicio, @dtFim)
    `);
  return result.recordset[0].ID;
}

async function atualizar(id, descricao, percDesconto, dtInicio, dtFim) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .input('descricao', sql.VarChar(255), descricao)
    .input('percDesconto', sql.Decimal(5, 2), percDesconto)
    .input('dtInicio', sql.DateTime2, new Date(dtInicio))
    .input('dtFim', sql.DateTime2, new Date(dtFim))
    .query(`
      UPDATE dbo.POLITICAS_DESCONTO
      SET DESCRICAO = @descricao,
          PERC_DESCONTO = @percDesconto,
          DT_INICIO = @dtInicio,
          DT_FIM = @dtFim
      WHERE ID = @id AND ATIVO = 1
    `);
}

async function excluir(id) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICAS_DESCONTO SET ATIVO = 0 WHERE ID = @id`);
}

async function verificarConflitoProduto(codprod, dtInicio, dtFim, idPoliticaAtual) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('codprod', sql.VarChar(30), codprod)
    .input('dtInicio', sql.DateTime2, new Date(dtInicio))
    .input('dtFim', sql.DateTime2, new Date(dtFim))
    .input('idPoliticaAtual', sql.Int, idPoliticaAtual)
    .query(`
      SELECT p.ID, p.DESCRICAO, p.DT_INICIO, p.DT_FIM
      FROM dbo.POLITICAS_DESCONTO p
      JOIN dbo.POLITICAS_DESCONTO_PRODUTOS pp ON pp.ID_POLITICA = p.ID
      WHERE pp.CODPROD = @codprod
        AND p.ATIVO = 1
        AND p.ID <> @idPoliticaAtual
        AND p.DT_INICIO <= @dtFim
        AND p.DT_FIM >= @dtInicio
    `);
  return result.recordset;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, verificarConflitoProduto };
