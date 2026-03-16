import { ExportOutlined } from '@ant-design/icons';

export default function ElsaStudioPage() {
  const studioUrl = `${window.location.protocol}//${window.location.hostname}:44305/elsa-studio`;

  return (
    <div className="ce-page-enter" style={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
      }}>
        <a
          href={studioUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--ce-accent)', fontWeight: 500,
          }}
        >
          Open in new tab <ExportOutlined style={{ fontSize: 11 }} />
        </a>
      </div>
      <iframe
        src={studioUrl}
        style={{
          flex: 1, width: '100%', border: '1px solid var(--ce-border-light)',
          borderRadius: 'var(--ce-radius)', background: 'var(--ce-bg-card)',
        }}
        title="Elsa Workflow Designer"
      />
    </div>
  );
}
