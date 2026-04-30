'use strict';

const { getPoolPoliticas, sql } = require('../config/dbConfig');

async function listarPorPolitica(idPolitica) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .query(`
      SELECT i.ID, i.ID_POLITICA, i.PRODUTO, i.QTD_VENDIDA, i.QTD_BONI, i.DT_INCLUSAO,
             ISNULL((SELECT TOP 1 PRODUTO FROM dw.dbo.V_PRODUTOS_ATIVOS WHERE CODPROD = i.PRODUTO), '') AS NOME_PRODUTO,
             ISNULL((SELECT TOP 1 FAMILIA  FROM dw.dbo.SGC005           WHERE CODPROD = i.PRODUTO), '') AS FAMILIA
      FROM dbo.POLITICAS_BONIFICACAO_ITENS i
      WHERE i.ID_POLITICA = @idPolitica
      ORDER BY i.DT_INCLUSAO
    `);
  return result.recordset;
}

async function buscarPorId(id) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT ID, ID_POLITICA, PRODUTO, QTD_VENDIDA, QTD_BONI, DT_INCLUSAO
            FROM dbo.POLITICAS_BONIFICACAO_ITENS WHERE ID = @id`);
  return result.recordset[0] || null;
}

async function adicionar(idPolitica, produto, qtdVendida, qtdBoni) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .input('produto', sql.VarChar(30), produto)
    .input('qtdVendida', sql.Decimal(10, 3), qtdVendida)
    .input('qtdBoni', sql.Decimal(10, 3), qtdBoni)
    .query(`
      INSERT INTO dbo.POLITICAS_BONIFICACAO_ITENS (ID_POLITICA, PRODUTO, QTD_VENDIDA, QTD_BONI)
      OUTPUT INSERTED.ID
      VALUES (@idPolitica, @produto, @qtdVendida, @qtdBoni)
    `);
  return result.recordset[0].ID;
}

async function atualizar(id, qtdVendida, qtdBoni) {
  const pool = await getPoolPoliticas();
  await pool.request()
    .input('id', sql.Int, id)
    .input('qtdVendida', sql.Decimal(10, 3), qtdVendida)
    .input('qtdBoni', sql.Decimal(10, 3), qtdBoni)
    .query(`
      UPDATE dbo.POLITICAS_BONIFICACAO_ITENS
      SET QTD_VENDIDA = @qtdVendida, QTD_BONI = @qtdBoni
      WHERE ID = @id
    `);
}

async function remover(id) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`DELETE FROM dbo.POLITICAS_BONIFICACAO_ITENS WHERE ID = @id`);
  return result.rowsAffected[0];
}

async function listarProdutos(idPolitica) {
  const pool = await getPoolPoliticas();
  const result = await pool.request()
    .input('idPolitica', sql.Int, idPolitica)
    .query(`SELECT PRODUTO FROM dbo.POLITICAS_BONIFICACAO_ITENS WHERE ID_POLITICA = @idPolitica`);
  return result.recordset.map(r => r.PRODUTO);
}

module.exports = { listarPorPolitica, buscarPorId, adicionar, atualizar, remover, listarProdutos };
