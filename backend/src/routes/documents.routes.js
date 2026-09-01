const express = require('express');
const multer = require('multer');
const path = require('node:path');
const rateLimit = require('express-rate-limit');
const { storageDirectory } = require('../config');
const documentsController = require('../controllers/documents.controller');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, storageDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || '');
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    callback(null, `${name}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Limitador de taxa para downloads: máximo de 20 requisições por IP por minuto.
const downloadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  message: { error: 'Muitas requisições. Tente novamente em instantes.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', downloadRateLimiter, documentsController.downloadDocument);

module.exports = router;
