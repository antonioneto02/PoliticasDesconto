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

let _poolPoliticas = null;
let _poolDw = null;

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

module.exports = { getPoolPoliticas, getPoolDw, sql };
