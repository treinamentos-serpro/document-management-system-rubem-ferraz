import { getDownloadUrl } from '../services/documentsApi';

export default function DownloadButton({ documentId, fileName }) {
  return (
    <a href={getDownloadUrl(documentId)} download={fileName}>
      <button type="button">Baixar</button>
    </a>
  );
}
