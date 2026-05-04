'use strict';

require('dotenv').config();
const sql = require('mssql');

const baseOptions = {
  options: {
    encrypt: true,
    trustServerCertificate: true,
    useUTC: false,
  },
  requestTimeout: 60000,
  connectionTimeout: 30000,
};

const configPoliticas = {
  user: process.env.DB_USER_ERP,
  password: process.env.DB_PASSWORD_ERP,
  server: process.env.DB_SERVER_ERP,
  database: process.env.DB_DATABASE_POL,
  ...baseOptions,
};

const configDw = {
  user: process.env.DB_USER_ERP,
  password: process.env.DB_PASSWORD_ERP,
  server: process.env.DB_SERVER_ERP,
  database: process.env.DB_DATABASE_DW,
  ...baseOptions,
};

const configBonificacao = {
  user: process.env.DB_USER_ERP,
  password: process.env.DB_PASSWORD_ERP,
  server: process.env.DB_SERVER_ERP,
  database: process.env.DB_DATABASE_BONI,
  ...baseOptions,
};

let _poolPoliticas = null;
let _poolDw = null;
let _poolBonificacao = null;

async function getPoolPoliticas() {
  if (_poolPoliticas && _poolPoliticas.connected) return _poolPoliticas;
  const pool = new sql.ConnectionPool(configPoliticas);
  _poolPoliticas = await pool.connect();
  _poolPoliticas.on('error', () => { _poolPoliticas = null; });
  return _poolPoliticas;
}

async function getPoolDw() {
  if (_poolDw && _poolDw.connected) return _poolDw;
  const pool = new sql.ConnectionPool(configDw);
  _poolDw = await pool.connect();
  _poolDw.on('error', () => { _poolDw = null; });
  return _poolDw;
}

async function getPoolBonificacao() {
  if (_poolBonificacao && _poolBonificacao.connected) return _poolBonificacao;
  const pool = new sql.ConnectionPool(configBonificacao);
  _poolBonificacao = await pool.connect();
  _poolBonificacao.on('error', () => { _poolBonificacao = null; });
  return _poolBonificacao;
}

module.exports = { getPoolPoliticas, getPoolDw, getPoolBonificacao, sql };
