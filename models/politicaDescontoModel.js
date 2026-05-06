'use strict';

const { getPoolPoliticaDesconto: getPool, sql } = require('../config/dbConfig');

async function listar() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT pd.ID, pd.CODGRUPO,
           ISNULL((SELECT TOP 1 GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO COLLATE Latin1_General_CI_AS = pd.CODGRUPO COLLATE Latin1_General_CI_AS), '') AS NOME_GRUPO,
           pd.PRODUTO,
           ISNULL((SELECT TOP 1 PRODUTO FROM dw.dbo.V_PRODUTOS_ATIVOS WHERE CODPROD COLLATE Latin1_General_CI_AS = pd.PRODUTO COLLATE Latin1_General_CI_AS), '') AS NOME_PRODUTO,
           pd.PERC_DESC,
           CONVERT(varchar(19), pd.DT_INICIO, 120) AS DT_INICIO,
           CONVERT(varchar(19), pd.DT_FIM,    120) AS DT_FIM,
           pd.DT_CRIACAO, pd.ATIVO
    FROM dbo.POLITICA_DESCONTO pd
    ORDER BY pd.DT_CRIACAO DESC
  `);
  return result.recordset;
}

async function buscarPorId(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT pd.ID, pd.CODGRUPO,
             ISNULL((SELECT TOP 1 GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO COLLATE Latin1_General_CI_AS = pd.CODGRUPO COLLATE Latin1_General_CI_AS), '') AS NOME_GRUPO,
             pd.PRODUTO,
             ISNULL((SELECT TOP 1 PRODUTO FROM dw.dbo.V_PRODUTOS_ATIVOS WHERE CODPROD COLLATE Latin1_General_CI_AS = pd.PRODUTO COLLATE Latin1_General_CI_AS), '') AS NOME_PRODUTO,
             pd.PERC_DESC,
             CONVERT(varchar(19), pd.DT_INICIO, 120) AS DT_INICIO,
             CONVERT(varchar(19), pd.DT_FIM,    120) AS DT_FIM,
             pd.DT_CRIACAO, pd.ATIVO
      FROM dbo.POLITICA_DESCONTO pd
      WHERE pd.ID = @id
    `);
  return result.recordset[0] || null;
}

async function criar(codgrupo, produto, percDesc, dtInicio, dtFim) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codgrupo',  sql.VarChar(30),   codgrupo)
    .input('produto',   sql.VarChar(30),   produto)
    .input('percDesc',  sql.Decimal(5, 2), percDesc)
    .input('dtInicio',  sql.DateTime2,     new Date(dtInicio))
    .input('dtFim',     sql.DateTime2,     new Date(dtFim))
    .query(`
      INSERT INTO dbo.POLITICA_DESCONTO (CODGRUPO, PRODUTO, PERC_DESC, DT_INICIO, DT_FIM)
      OUTPUT INSERTED.ID
      VALUES (@codgrupo, @produto, @percDesc, @dtInicio, @dtFim)
    `);
  return result.recordset[0].ID;
}

async function atualizar(id, codgrupo, produto, percDesc, dtInicio, dtFim) {
  const pool = await getPool();
  await pool.request()
    .input('id',        sql.Int,           id)
    .input('codgrupo',  sql.VarChar(30),   codgrupo)
    .input('produto',   sql.VarChar(30),   produto)
    .input('percDesc',  sql.Decimal(5, 2), percDesc)
    .input('dtInicio',  sql.DateTime2,     new Date(dtInicio))
    .input('dtFim',     sql.DateTime2,     new Date(dtFim))
    .query(`
      UPDATE dbo.POLITICA_DESCONTO
      SET CODGRUPO = @codgrupo, PRODUTO = @produto,
          PERC_DESC = @percDesc,
          DT_INICIO = @dtInicio, DT_FIM = @dtFim
      WHERE ID = @id
    `);
}

async function excluir(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICA_DESCONTO WHERE ID = @id`);
}

async function ativar(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICA_DESCONTO SET ATIVO = 1, DT_CRIACAO = GETDATE() WHERE ID = @id`);
}

async function inativar(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICA_DESCONTO SET ATIVO = 0 WHERE ID = @id`);
}

async function buscarGrupoDw(codgrupo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codgrupo', sql.VarChar(30), codgrupo)
    .query(`SELECT TOP 1 CODGRUPO, GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO COLLATE Latin1_General_CI_AS = @codgrupo COLLATE Latin1_General_CI_AS`);
  return result.recordset[0] || null;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar, buscarGrupoDw };
