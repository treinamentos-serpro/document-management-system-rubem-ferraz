import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const document = await uploadDocument(selectedFile, owner);
      setSelectedFile(null);
      event.target.reset();
      onUploaded?.(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enviar documento</h2>
      <div>
        <label htmlFor="owner">Dono</label>
        <input
          id="owner"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome do dono (opcional)"
        />
      </div>
      <div>
        <label htmlFor="file">Arquivo</label>
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
