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

function getDocumentById(id) {
  return documentsRepository.findById(id);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentById,
  ensureStorageDirectory,
};
