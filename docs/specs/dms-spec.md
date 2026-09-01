# Especificacao - Document Management System

## 1. Objetivo

Entregar um sistema web simples para upload, listagem e download de documentos por usuario, com arquivos armazenados no filesystem local da aplicacao e metadados mantidos em memoria nesta fase inicial.

## 2. Escopo

### Dentro do escopo

- Upload de documentos pelo usuario.
- Listagem dos documentos enviados.
- Download de um documento pelo seu identificador.
- Gestao simples por usuario por meio do campo `owner` nos metadados.
- Persistencia local dos arquivos em `backend/storage` usando `multer` com `diskStorage`.
- Persistencia em memoria dos metadados dos documentos durante a execucao da aplicacao.
- Interface frontend em React para consumir a API do backend via prefixo `/api`.

### Fora do escopo

- Armazenamento externo, em nuvem ou por servicos de terceiros.
- Persistencia de metadados em banco de dados.
- Versionamento de documentos.
- Autenticacao robusta, autorizacao granular ou controle avancado de permissoes.
- Auditoria avancada, trilhas historicas ou relatorios administrativos.
- Edicao, visualizacao inline ou conversao de conteudo dos documentos.

## 3. Requisitos funcionais

| ID    | Requisito |
| ----- | --------- |
| RF-01 | O usuario pode enviar um documento por meio de uma requisicao `multipart/form-data`. |
| RF-02 | O sistema deve gravar o arquivo enviado no filesystem local da aplicacao. |
| RF-03 | O sistema deve gerar um identificador unico para cada documento enviado. |
| RF-04 | O sistema deve registrar os metadados do documento enviado em memoria. |
| RF-05 | O sistema deve retornar os metadados do documento criado apos um upload bem-sucedido. |
| RF-06 | O usuario pode listar os documentos cadastrados. |
| RF-07 | A listagem deve retornar somente metadados, sem expor o conteudo binario dos arquivos. |
| RF-08 | O usuario pode baixar um documento pelo identificador. |
| RF-09 | O sistema deve retornar erro quando o usuario tentar baixar um documento inexistente. |
| RF-10 | O sistema deve retornar erro quando uma tentativa de upload nao incluir arquivo. |
| RF-11 | O sistema deve associar cada documento a um dono por meio do campo `owner`. |
| RF-12 | Quando aplicavel, a listagem pode ser filtrada por `owner` para apoiar a gestao simples por usuario. |

## 4. Requisitos nao funcionais

| ID     | Requisito |
| ------ | --------- |
| RNF-01 | Os arquivos devem ser gravados no filesystem local usando `multer` com `diskStorage`. |
| RNF-02 | O diretorio de armazenamento local deve ser `backend/storage`, configuravel por variavel de ambiente quando necessario. |
| RNF-03 | Os metadados devem ser mantidos em memoria nesta fase inicial. |
| RNF-04 | A configuracao da aplicacao deve seguir 12-Factor App, usando variaveis de ambiente para valores configuraveis. |
| RNF-05 | O backend deve usar Node.js com Express em CommonJS. |
| RNF-06 | O frontend deve usar React com Vite em ESM. |
| RNF-07 | A comunicacao do frontend com o backend deve ocorrer via `fetch` usando o prefixo `/api`. |
| RNF-08 | A arquitetura do backend deve seguir Clean Architecture simples com as camadas `routes`, `controllers`, `services` e `repositories`. |
| RNF-09 | O fluxo de dependencias deve ser `routes -> controllers -> services -> repositories`. |
| RNF-10 | As camadas internas nao devem depender de detalhes HTTP ou de componentes de interface. |
| RNF-11 | Erros de entrada, upload e download devem ser tratados nos limites HTTP. |
| RNF-12 | A solucao deve permanecer simples, sem banco de dados, filas, armazenamento externo ou abstracoes desnecessarias nesta fase. |

## 5. Modelo de dados

### Metadados do documento

| Campo        | Tipo   | Obrigatorio | Descricao |
| ------------ | ------ | ----------- | --------- |
| id           | string | Sim | Identificador unico do documento. |
| originalName | string | Sim | Nome original do arquivo enviado pelo usuario. |
| filename     | string | Sim | Nome do arquivo gravado no storage local. |
| mimeType     | string | Sim | Tipo MIME informado no upload. |
| size         | number | Sim | Tamanho do arquivo em bytes. |
| uploadedAt   | string | Sim | Data e hora do upload em formato ISO 8601. |
| owner        | string | Sim | Identificador simples do usuario dono do documento. |
| path         | string | Sim | Caminho interno do arquivo no filesystem local. Nao precisa ser exposto ao frontend. |

### Exemplo de metadados expostos pela API

```json
{
  "id": "doc_1720000000000_abcd1234",
  "originalName": "contrato.pdf",
  "filename": "doc_1720000000000_abcd1234.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T10:00:00.000Z",
  "owner": "usuario-1"
}
```

## 6. Contratos de API

### POST /upload

Envia um documento para armazenamento local.

#### Entrada

- Tipo: `multipart/form-data`.
- Campo de arquivo: `file`.
- Campo opcional de texto: `owner`.
- Caso `owner` nao seja informado, o backend pode aplicar um dono padrao simples para esta fase inicial.

#### Saida de sucesso

- Status: `201 Created`.
- Corpo: metadados do documento criado, sem expor o campo interno `path`.

```json
{
  "id": "doc_1720000000000_abcd1234",
  "originalName": "contrato.pdf",
  "filename": "doc_1720000000000_abcd1234.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T10:00:00.000Z",
  "owner": "usuario-1"
}
```

#### Erros esperados

| Status | Condicao |
| ------ | -------- |
| 400 | Nenhum arquivo foi enviado. |
| 500 | Falha inesperada ao processar ou registrar o upload. |

### GET /documents

Lista os documentos cadastrados em memoria.

#### Entrada

- Query opcional: `owner`, para filtrar documentos por dono quando informado.

#### Saida de sucesso

- Status: `200 OK`.
- Corpo: lista de metadados dos documentos, sem expor o campo interno `path`.

```json
[
  {
    "id": "doc_1720000000000_abcd1234",
    "originalName": "contrato.pdf",
    "filename": "doc_1720000000000_abcd1234.pdf",
    "mimeType": "application/pdf",
    "size": 245760,
    "uploadedAt": "2026-09-01T10:00:00.000Z",
    "owner": "usuario-1"
  }
]
```

#### Erros esperados

| Status | Condicao |
| ------ | -------- |
| 500 | Falha inesperada ao listar documentos. |

### GET /documents/:id/download

Baixa o conteudo binario de um documento pelo identificador.

#### Entrada

- Path param: `id`, identificador unico do documento.

#### Saida de sucesso

- Status: `200 OK`.
- Corpo: conteudo binario do arquivo.
- Headers esperados:
  - `Content-Type` de acordo com o `mimeType` do documento.
  - `Content-Disposition` com sugestao de download usando `originalName`.

#### Erros esperados

| Status | Condicao |
| ------ | -------- |
| 404 | Documento nao encontrado nos metadados em memoria. |
| 404 | Arquivo fisico nao encontrado no storage local. |
| 500 | Falha inesperada ao preparar o download. |

## 7. Decisoes arquiteturais

- O backend deve seguir Clean Architecture simples com separacao em `routes`, `controllers`, `services` e `repositories`.
- As rotas definem endpoints e delegam o processamento para controllers.
- Os controllers tratam entrada e saida HTTP, validacoes basicas e conversao de erros em status HTTP.
- Os services concentram as regras de negocio, como criacao de metadados, listagem e recuperacao de documentos para download.
- Os repositories cuidam da persistencia em memoria dos metadados.
- O upload fisico deve usar `multer` com `diskStorage`, gravando arquivos somente em `backend/storage` ou no diretorio configurado por variavel de ambiente.
- O campo `path` deve ser tratado como detalhe interno do backend e nao deve ser necessario para o frontend.
- O frontend deve consumir a API por `fetch` usando `/api`, aproveitando o proxy do Vite em ambiente de desenvolvimento.
- A fase inicial nao deve usar banco de dados, servicos externos de upload, filas ou storage em nuvem.
- A implementacao deve privilegiar legibilidade, funcoes pequenas e baixo acoplamento.

## 8. Plano de execucao

1. Preparar a configuracao do backend para resolver o diretorio de armazenamento local a partir de variavel de ambiente, mantendo `backend/storage` como padrao.
2. Implementar o repository de documentos em memoria, com operacoes para criar, listar e buscar metadados por `id`.
3. Implementar o service de documentos, centralizando criacao de metadados, filtro por `owner` e recuperacao dos dados necessarios para download.
4. Configurar o `multer` com `diskStorage` para gravar os arquivos enviados no storage local.
5. Implementar o controller de documentos para tratar `POST /upload`, `GET /documents` e `GET /documents/:id/download`.
6. Implementar as rotas do backend e integra-las ao app Express preservando o endpoint `/health`.
7. Adicionar testes de backend com `node:test` para upload invalido, upload valido, listagem e download de documento inexistente.
8. Criar o service de frontend para consumir os endpoints via `fetch` usando o prefixo `/api`.
9. Criar os componentes React para upload, listagem e acao de download.
10. Integrar os componentes na pagina principal do frontend, com mensagens de sucesso e erro em portugues.
11. Validar o fluxo completo em ambiente local: enviar documento, listar metadados e baixar arquivo pelo identificador.
12. Revisar a solucao para garantir aderencia a Clean Architecture simples, armazenamento local com `multer` e ausencia de armazenamento externo.
