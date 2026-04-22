'use strict';

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Políticas de Desconto – CINI',
    version: '1.0.0',
    description: 'API REST para gestão de políticas de desconto por produto. Sem autenticação (uso interno).',
  },
  servers: [{ url: 'http://localhost:3014', description: 'Servidor local' }],
  tags: [
    { name: 'Saúde', description: 'Health check da API' },
    { name: 'Políticas', description: 'CRUD de políticas de desconto' },
    { name: 'Produtos', description: 'Produtos vinculados a políticas' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica status da API',
        responses: { 200: { description: 'Serviço operacional' } },
      },
    },

    '/api/produtos/buscar': {
      get: {
        tags: ['Produtos'],
        summary: 'Buscar produto por código',
        parameters: [{ name: 'codprod', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Produto encontrado' },
          404: { description: 'Produto não encontrado' },
        },
      },
    },

    '/api/politicas': {
      get: {
        tags: ['Políticas'],
        summary: 'Listar todas as políticas ativas',
        responses: { 200: { description: 'Lista de políticas' } },
      },
      post: {
        tags: ['Políticas'],
        summary: 'Criar nova política',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['descricao', 'perc_desconto', 'dt_inicio', 'dt_fim'],
                properties: {
                  descricao: { type: 'string' },
                  perc_desconto: { type: 'number', example: 10.5 },
                  dt_inicio: { type: 'string', format: 'date-time' },
                  dt_fim: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Política criada' },
          400: { description: 'Campos inválidos' },
        },
      },
    },

    '/api/politicas/{id}': {
      get: {
        tags: ['Políticas'],
        summary: 'Buscar política por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Dados da política' },
          404: { description: 'Política não encontrada' },
        },
      },
      put: {
        tags: ['Políticas'],
        summary: 'Atualizar política',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['descricao', 'perc_desconto', 'dt_inicio', 'dt_fim'],
                properties: {
                  descricao: { type: 'string' },
                  perc_desconto: { type: 'number' },
                  dt_inicio: { type: 'string', format: 'date-time' },
                  dt_fim: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Política atualizada' },
          409: { description: 'Conflito de vigência em produtos vinculados' },
        },
      },
      delete: {
        tags: ['Políticas'],
        summary: 'Excluir política (soft delete)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Política excluída' },
          404: { description: 'Política não encontrada' },
        },
      },
    },

    '/api/politicas/{id}/replicar': {
      post: {
        tags: ['Políticas'],
        summary: 'Replicar política com nova vigência',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['descricao', 'dt_inicio', 'dt_fim'],
                properties: {
                  descricao: { type: 'string' },
                  dt_inicio: { type: 'string', format: 'date-time' },
                  dt_fim: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Política replicada com sucesso' },
          409: { description: 'Conflito de vigência detectado' },
        },
      },
    },

    '/api/politicas/{id}/produtos': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar produtos da política',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Lista de produtos' } },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Adicionar produto à política',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codprod'],
                properties: { codprod: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Produto adicionado' },
          409: { description: 'Conflito de vigência com outra política' },
        },
      },
    },

    '/api/politicas/{id}/produtos/{codprod}': {
      delete: {
        tags: ['Produtos'],
        summary: 'Remover produto da política',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'codprod', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Produto removido' } },
      },
    },
  },
};

module.exports = { swaggerUi, swaggerDocument };
