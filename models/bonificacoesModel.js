'use strict';

const { getPoolPoliticas, sql } = require('../config/dbConfig');

async function listar() {
  const pool = await getPoolPoliticas();
  const result = await pool.request().query(`
    SELECT ID, GRUPO,
           CONVERT(varchar(19), DT_INICIO, 120) AS DT_INICIO,
           CONVERT(varchar(19), DT_FIM,    120) AS DT_FIM,
           DT_CRIACAO, ATIVO
    FROM dbo.POLITICAS_BONIFICACAO
    ORDER BY DT_CRIACAO DESC
  `);
  return result.recordset;
}

async function buscarPorId(id) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT ID, GRUPO,
             CONVERT(varchar(19), DT_INICIO, 120) AS DT_INICIO,
             CONVERT(varchar(19), DT_FIM,    120) AS DT_FIM,
             DT_CRIACAO, ATIVO
      FROM dbo.POLITICAS_BONIFICACAO
      WHERE ID = @id
    `);
  return result.recordset[0] || null;
}

async function criar(grupo, dtInicio, dtFim) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('grupo', sql.VarChar(255), grupo)
    .input('dtInicio', sql.DateTime2, new Date(dtInicio))
    .input('dtFim', sql.DateTime2, new Date(dtFim))
    .query(`
      INSERT INTO dbo.POLITICAS_BONIFICACAO (GRUPO, DT_INICIO, DT_FIM)
      OUTPUT INSERTED.ID
      VALUES (@grupo, @dtInicio, @dtFim)
    `);
  return result.recordset[0].ID;
}

async function atualizar(id, grupo, dtInicio, dtFim) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .input('grupo', sql.VarChar(255), grupo)
    .input('dtInicio', sql.DateTime2, new Date(dtInicio))
    .input('dtFim', sql.DateTime2, new Date(dtFim))
    .query(`
      UPDATE dbo.POLITICAS_BONIFICACAO
      SET GRUPO = @grupo, DT_INICIO = @dtInicio, DT_FIM = @dtFim
      WHERE ID = @id
    `);
}

async function excluir(id) {
  const pool = await getPoolPoliticas();
  await pool.request().input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICAS_BONIFICACAO_ITENS WHERE ID_POLITICA = @id`);
  await pool.request().input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICAS_BONIFICACAO WHERE ID = @id`);
}

async function ativar(id) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICAS_BONIFICACAO SET ATIVO = 1, DT_CRIACAO = GETDATE() WHERE ID = @id`);
}

async function inativar(id) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICAS_BONIFICACAO SET ATIVO = 0 WHERE ID = @id`);
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar };
