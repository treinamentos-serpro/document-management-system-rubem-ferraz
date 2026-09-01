import { getDownloadUrl } from '../services/documentsApi';

export default function DownloadButton({ documentId, fileName }) {
  return (
    <a
      href={getDownloadUrl(documentId)}
      download={fileName}
      style={{ display: 'inline-block', padding: '0.25rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none' }}
    >
      Baixar
    </a>
  );
}
