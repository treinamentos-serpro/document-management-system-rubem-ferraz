const express = require('express');
const multer = require('multer');
const path = require('node:path');
const documentsController = require('../controllers/documents.controller');
const documentsService = require('../services/documents.service');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, documentsService.ensureStorageDirectory());
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || '');
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    callback(null, `${name}${extension}`);
  },
});

const upload = multer({
  storage,
});

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;
