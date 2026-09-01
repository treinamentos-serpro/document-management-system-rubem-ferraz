const documents = [];

function createDocument(document) {
  documents.push(document);
  return document;
}

function findAll(owner) {
  if (!owner) {
    return [...documents];
  }

  return documents.filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.find((document) => document.id === id);
}

module.exports = {
  createDocument,
  findAll,
  findById,
};
