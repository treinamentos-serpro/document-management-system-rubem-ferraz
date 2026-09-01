const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const documentsRepository = require('../repositories/documents.repository');

const storageDirectory = path.resolve(__dirname, '../../storage');

function ensureStorageDirectory() {
  fs.mkdirSync(storageDirectory, { recursive: true });
  return storageDirectory;
}

function sanitizeDocument(document) {
  if (!document) {
    return null;
  }

  const { path: _path, ...safeDocument } = document;
  return safeDocument;
}

function createDocument({ file, owner }) {
  if (!file) {
    throw new Error('Nenhum arquivo foi enviado.');
  }

  ensureStorageDirectory();

  const id = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const filename = file.filename || `${id}${path.extname(file.originalname || '')}`;
  const documentPath = file.path || path.join(storageDirectory, filename);

  const document = {
    id,
    originalName: file.originalname,
    filename,
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonymous',
    path: documentPath,
  };

  documentsRepository.createDocument(document);

  return sanitizeDocument(document);
}

function listDocuments(owner) {
  return documentsRepository
    .findAll(owner)
    .map((document) => sanitizeDocument(document));
}

/**
 * Recupera o caminho absoluto do arquivo de um documento, validando que ele
 * está dentro do diretório de armazenamento para evitar path traversal.
 *
 * @returns {string} caminho absoluto seguro
 * @throws {Error} se o documento não existir, o arquivo não existir no disco
 *   ou o caminho estiver fora do diretório de armazenamento
 */
function getDocumentFilePath(id) {
  const document = documentsRepository.findById(id);

  if (!document) {
    throw new Error('Documento não encontrado.');
  }

  const resolvedPath = path.resolve(document.path);
  if (!resolvedPath.startsWith(storageDirectory + path.sep) && resolvedPath !== storageDirectory) {
    throw new Error('Acesso negado: caminho fora do diretório de armazenamento.');
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error('Arquivo não encontrado no armazenamento local.');
  }

  return { resolvedPath, originalName: document.originalName };
}

function getDocumentById(id) {
  return documentsRepository.findById(id);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentById,
  getDocumentFilePath,
  ensureStorageDirectory,
};
