const fs = require('node:fs');
const documentsService = require('../services/documents.service');

function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    const document = documentsService.createDocument({
      file: req.file,
      owner: req.body?.owner,
    });

    return res.status(201).json(document);
  } catch (error) {
    if (error.message === 'Nenhum arquivo foi enviado.') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Falha ao processar o upload.' });
  }
}

function listDocuments(req, res) {
  try {
    const owner = req.query.owner;
    const documents = documentsService.listDocuments(owner);

    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao listar documentos.' });
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentsService.getDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no armazenamento local.' });
    }

    return res.download(document.path, document.originalName, (error) => {
      if (error) {
        return res.status(500).json({ error: 'Falha ao preparar o download.' });
      }

      return undefined;
    });
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao preparar o download.' });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
