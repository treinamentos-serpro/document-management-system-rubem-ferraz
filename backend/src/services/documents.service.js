const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { storageDirectory } = require('../config');
const documentsRepository = require('../repositories/documents.repository');

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
 * Recupera o caminho absoluto do arquivo de um documento, reconstruindo-o
 * a partir do diretório de armazenamento e do nome de arquivo confiável
 * (nunca usando o caminho fornecido pelo usuário) para evitar path traversal.
 *
 * @returns {{ resolvedPath: string, originalName: string }}
 * @throws {Error} se o documento não existir ou o arquivo não existir no disco
 */
function getDocumentFilePath(id) {
  const document = documentsRepository.findById(id);

  if (!document) {
    throw new Error('Documento não encontrado.');
  }

  // Reconstrói o caminho a partir de componentes confiáveis, nunca do valor
  // armazenado que poderia ter sido manipulado.
  const safeName = path.basename(document.filename);
  const resolvedPath = path.join(storageDirectory, safeName);

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
