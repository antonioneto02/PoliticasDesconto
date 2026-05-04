'use strict';

const { getPoolBonificacao: getPool, sql } = require('../config/dbConfig');

async function listar() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT pb.ID, pb.CODGRUPO,
           ISNULL((SELECT TOP 1 GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO = pb.CODGRUPO), '') AS NOME_GRUPO,
           pb.PRODUTO,
           ISNULL((SELECT TOP 1 PRODUTO FROM dw.dbo.V_PRODUTOS_ATIVOS WHERE CODPROD = pb.PRODUTO), '') AS NOME_PRODUTO,
           pb.QTD_VENDIDA, pb.QTD_BONI,
           CONVERT(varchar(19), pb.DT_INICIO, 120) AS DT_INICIO,
           CONVERT(varchar(19), pb.DT_FIM,    120) AS DT_FIM,
           pb.DT_CRIACAO, pb.ATIVO
    FROM dbo.POLITICAS_BONIFICACAO pb
    ORDER BY pb.DT_CRIACAO DESC
  `);
  return result.recordset;
}

async function buscarPorId(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT pb.ID, pb.CODGRUPO,
             ISNULL((SELECT TOP 1 GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO = pb.CODGRUPO), '') AS NOME_GRUPO,
             pb.PRODUTO,
             ISNULL((SELECT TOP 1 PRODUTO FROM dw.dbo.V_PRODUTOS_ATIVOS WHERE CODPROD = pb.PRODUTO), '') AS NOME_PRODUTO,
             pb.QTD_VENDIDA, pb.QTD_BONI,
             CONVERT(varchar(19), pb.DT_INICIO, 120) AS DT_INICIO,
             CONVERT(varchar(19), pb.DT_FIM,    120) AS DT_FIM,
             pb.DT_CRIACAO, pb.ATIVO
      FROM dbo.POLITICAS_BONIFICACAO pb
      WHERE pb.ID = @id
    `);
  return result.recordset[0] || null;
}

async function criar(codgrupo, produto, qtdVendida, qtdBoni, dtInicio, dtFim) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codgrupo',   sql.VarChar(30),    codgrupo)
    .input('produto',    sql.VarChar(30),    produto)
    .input('qtdVendida', sql.Decimal(10, 3), qtdVendida)
    .input('qtdBoni',    sql.Decimal(10, 3), qtdBoni)
    .input('dtInicio',   sql.DateTime2,      new Date(dtInicio))
    .input('dtFim',      sql.DateTime2,      new Date(dtFim))
    .query(`
      INSERT INTO dbo.POLITICAS_BONIFICACAO (CODGRUPO, PRODUTO, QTD_VENDIDA, QTD_BONI, DT_INICIO, DT_FIM)
      OUTPUT INSERTED.ID
      VALUES (@codgrupo, @produto, @qtdVendida, @qtdBoni, @dtInicio, @dtFim)
    `);
  return result.recordset[0].ID;
}

async function atualizar(id, codgrupo, produto, qtdVendida, qtdBoni, dtInicio, dtFim) {
  const pool = await getPool();
  await pool.request()
    .input('id',         sql.Int,            id)
    .input('codgrupo',   sql.VarChar(30),    codgrupo)
    .input('produto',    sql.VarChar(30),    produto)
    .input('qtdVendida', sql.Decimal(10, 3), qtdVendida)
    .input('qtdBoni',    sql.Decimal(10, 3), qtdBoni)
    .input('dtInicio',   sql.DateTime2,      new Date(dtInicio))
    .input('dtFim',      sql.DateTime2,      new Date(dtFim))
    .query(`
      UPDATE dbo.POLITICAS_BONIFICACAO
      SET CODGRUPO = @codgrupo, PRODUTO = @produto,
          QTD_VENDIDA = @qtdVendida, QTD_BONI = @qtdBoni,
          DT_INICIO = @dtInicio, DT_FIM = @dtFim
      WHERE ID = @id
    `);
}

async function excluir(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICAS_BONIFICACAO_ITENS WHERE ID_POLITICA = @id`);
  await pool.request().input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICAS_BONIFICACAO WHERE ID = @id`);
}

async function ativar(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICAS_BONIFICACAO SET ATIVO = 1, DT_CRIACAO = GETDATE() WHERE ID = @id`);
}

async function inativar(id) {
  const pool = await getPool();
  await pool.request().input('id', sql.Int, id)
    .query(`UPDATE dbo.POLITICAS_BONIFICACAO SET ATIVO = 0 WHERE ID = @id`);
}

async function buscarGrupoDw(codgrupo) {
  const pool = await getPool();
  const result = await pool.request()
    .input('codgrupo', sql.VarChar(30), codgrupo)
    .query(`SELECT TOP 1 CODGRUPO, GRUPO FROM dw.dbo.DIM_GRUPOS WHERE CODGRUPO = @codgrupo`);
  return result.recordset[0] || null;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, ativar, inativar, buscarGrupoDw };
