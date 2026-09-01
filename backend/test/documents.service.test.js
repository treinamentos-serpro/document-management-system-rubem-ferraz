const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const documentsService = require('../src/services/documents.service');

test('getDocumentFilePath lança erro para documento inexistente', () => {
  assert.throws(
    () => documentsService.getDocumentFilePath('id-inexistente'),
    { message: 'Documento não encontrado.' },
  );
});

test('getDocumentFilePath lança erro de acesso negado para path fora do storage', () => {
  // Injeta diretamente no repositório um documento com path malicioso
  const repository = require('../src/repositories/documents.repository');
  const maliciousDoc = {
    id: 'doc-malicioso',
    originalName: 'evil.txt',
    filename: 'evil.txt',
    mimeType: 'text/plain',
    size: 10,
    uploadedAt: new Date().toISOString(),
    owner: 'attacker',
    path: path.resolve('/etc/passwd'),
  };
  repository.createDocument(maliciousDoc);

  assert.throws(
    () => documentsService.getDocumentFilePath('doc-malicioso'),
    { message: /Acesso negado/ },
  );
});

test('createDocument lança erro quando file é ausente', () => {
  assert.throws(
    () => documentsService.createDocument({ file: null, owner: 'user' }),
    { message: 'Nenhum arquivo foi enviado.' },
  );
});

test('listDocuments retorna array', () => {
  const result = documentsService.listDocuments();
  assert.ok(Array.isArray(result), 'deve retornar um array');
});

test('sanitizeDocument não expõe path no retorno de createDocument', () => {
  const fakeFile = {
    filename: 'test.txt',
    originalname: 'test.txt',
    mimetype: 'text/plain',
    size: 4,
    path: path.join(path.resolve(__dirname, '../storage'), 'test.txt'),
  };

  const doc = documentsService.createDocument({ file: fakeFile, owner: 'user' });
  assert.ok(!('path' in doc), 'o campo path não deve ser exposto');
  assert.ok('id' in doc, 'deve conter id');
  assert.ok('originalName' in doc, 'deve conter originalName');
});
