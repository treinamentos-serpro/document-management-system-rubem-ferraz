const { test } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');

const api = supertest(app);

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('deve listar documentos e aceitar upload de arquivo', async () => {
  const uploadResponse = await api
    .post('/upload')
    .attach('file', Buffer.from('conteudo de teste', 'utf8'), {
      filename: 'documento.txt',
      contentType: 'text/plain'
    })
    .field('owner', 'tester');

  assert.strictEqual(uploadResponse.status, 201, 'o upload deve retornar 201');
  assert.ok(uploadResponse.body.id, 'deve retornar um id do documento');
  assert.strictEqual(uploadResponse.body.originalName, 'documento.txt');

  const listResponse = await api.get('/documents');

  assert.strictEqual(listResponse.status, 200, 'a listagem deve retornar 200');
  assert.ok(Array.isArray(listResponse.body), 'a resposta deve ser um array');
  assert.ok(listResponse.body.some((document) => document.id === uploadResponse.body.id));
});

test('deve baixar um documento salvo', async () => {
  const uploadResponse = await api
    .post('/upload')
    .attach('file', Buffer.from('arquivo para download', 'utf8'), {
      filename: 'download.txt',
      contentType: 'text/plain'
    });

  const downloadResponse = await api.get(`/documents/${uploadResponse.body.id}/download`);

  assert.strictEqual(downloadResponse.status, 200, 'o download deve retornar 200');
  assert.strictEqual(downloadResponse.headers['content-type'], 'text/plain; charset=utf-8');
  assert.strictEqual(downloadResponse.text, 'arquivo para download');
});
