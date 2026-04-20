'use strict';

const { getPoolPoliticas, getPoolDw, sql } = require('../config/dbConfig');

async function listarPorPolitica(idPolitica) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .query(`
      SELECT ID, CODPROD, DT_INCLUSAO
      FROM dbo.POLITICAS_DESCONTO_PRODUTOS
      WHERE ID_POLITICA = @idPolitica
      ORDER BY DT_INCLUSAO
    `);
  return result.recordset;
}

async function adicionar(idPolitica, codprod) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .input('codprod', sql.VarChar(30), codprod)
    .query(`
      INSERT INTO dbo.POLITICAS_DESCONTO_PRODUTOS (ID_POLITICA, CODPROD)
      OUTPUT INSERTED.ID
      VALUES (@idPolitica, @codprod)
    `);
  return result.recordset[0].ID;
}

async function remover(idPolitica, codprod) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .input('codprod', sql.VarChar(30), codprod)
    .query(`
      DELETE FROM dbo.POLITICAS_DESCONTO_PRODUTOS
      WHERE ID_POLITICA = @idPolitica AND CODPROD = @codprod
    `);
  return result.rowsAffected[0];
}

async function listarCodprods(idPolitica) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .query(`SELECT CODPROD FROM dbo.POLITICAS_DESCONTO_PRODUTOS WHERE ID_POLITICA = @idPolitica`);
  return result.recordset.map(r => r.CODPROD);
}

async function buscarProdutoDw(codprod) {
  const pool = await getPoolDw();
  const result = await pool.request()
    .input('codprod', sql.VarChar(30), codprod)
    .query(`
      SELECT TOP 1 [SEQ], [FAMILIA], [CODPROD], [PRODUTO]
      FROM [dw].[dbo].[V_PRODUTOS_ATIVOS]
      WHERE [CODPROD] = @codprod
    `);
  return result.recordset[0] || null;
}

module.exports = { listarPorPolitica, adicionar, remover, listarCodprods, buscarProdutoDw };
