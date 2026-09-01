// Cliente de API responsável por toda a comunicação com o backend de documentos.
const API_BASE_URL = '/api';

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || 'Falha ao comunicar com o servidor.';
    throw new Error(message);
  }

  return data;
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse(response);
}

export async function fetchDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`${API_BASE_URL}/documents${query}`);

  return parseResponse(response);
}

export function getDownloadUrl(documentId) {
  return `${API_BASE_URL}/documents/${documentId}/download`;
}
