// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const multer = require('multer');
const documentsRoutes = require('./routes/documents.routes');
const documentsService = require('./services/documents.service');

const app = express();
const PORT = process.env.PORT || 3000;

documentsService.ensureStorageDirectory();

app.use(express.json());
app.use(documentsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Tratamento centralizado de erros do multer (ex: arquivo muito grande)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Arquivo muito grande. Limite de 10 MB.' });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
