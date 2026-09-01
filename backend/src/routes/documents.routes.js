const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const documentsController = require('../controllers/documents.controller');

const storageDirectory = path.resolve(__dirname, '../../storage');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(storageDirectory, { recursive: true });
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

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;
