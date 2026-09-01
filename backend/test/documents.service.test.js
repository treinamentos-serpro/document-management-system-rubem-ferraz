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

test('getDocumentFilePath lança erro para arquivo fora do storage (path traversal)', () => {
  // Injeta diretamente no repositório um documento com filename malicioso
  const repository = require('../src/repositories/documents.repository');
  const maliciousDoc = {
    id: 'doc-malicioso',
    originalName: 'evil.txt',
    // path.basename extrai apenas o nome do arquivo, o que impede path traversal
    filename: '../../../etc/passwd',
    mimeType: 'text/plain',
    size: 10,
    uploadedAt: new Date().toISOString(),
    owner: 'attacker',
    path: '/etc/passwd',
  };
  repository.createDocument(maliciousDoc);

  // Com filename malicioso, path.basename isola apenas "passwd".
  // O arquivo não existe em storageDirectory, então lança erro de não encontrado.
  assert.throws(
    () => documentsService.getDocumentFilePath('doc-malicioso'),
    { message: 'Arquivo não encontrado no armazenamento local.' },
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
    path: path.join(require('../src/config').storageDirectory, 'test.txt'),
  };

  const doc = documentsService.createDocument({ file: fakeFile, owner: 'user' });
  assert.ok(!('path' in doc), 'o campo path não deve ser exposto');
  assert.ok('id' in doc, 'deve conter id');
  assert.ok('originalName' in doc, 'deve conter originalName');
});
