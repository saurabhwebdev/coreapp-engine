import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: compact ? '28px 20px' : '48px 20px',
    }}>
      {/* Animated empty box — pure CSS */}
      <div style={{
        width: compact ? 64 : 96,
        height: compact ? 64 : 96,
        margin: '0 auto 16px',
        position: 'relative',
        animation: 'ceEmptyFloat 3s ease-in-out infinite',
      }}>
        {/* Box body */}
        <div style={{
          position: 'absolute',
          bottom: compact ? 8 : 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: compact ? 40 : 56,
          height: compact ? 32 : 44,
          borderRadius: compact ? 6 : 8,
          background: 'var(--ce-bg-inset)',
          border: '2px solid var(--ce-border)',
        }} />
        {/* Box lid */}
        <div style={{
          position: 'absolute',
          bottom: compact ? 36 : 52,
          left: '50%',
          transform: 'translateX(-50%)',
          width: compact ? 46 : 64,
          height: compact ? 8 : 10,
          borderRadius: compact ? 3 : 4,
          background: 'var(--ce-border)',
          animation: 'ceEmptyLid 3s ease-in-out infinite',
        }} />
        {/* Sparkle dots */}
        <div style={{
          position: 'absolute',
          top: compact ? 4 : 6,
          right: compact ? 4 : 8,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--ce-accent)',
          opacity: 0.3,
          animation: 'ceEmptySparkle 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: compact ? 12 : 18,
          left: compact ? 6 : 10,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'var(--ce-accent)',
          opacity: 0.2,
          animation: 'ceEmptySparkle 3s ease-in-out 0.5s infinite',
        }} />
      </div>

      <div style={{
        fontSize: compact ? 13 : 15,
        fontWeight: 600,
        color: 'var(--ce-text)',
        marginBottom: 4,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: compact ? 11 : 13,
        color: 'var(--ce-text-muted)',
        maxWidth: 300,
        margin: '0 auto',
        lineHeight: 1.5,
      }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction} size={compact ? 'small' : 'middle'}>
            {actionLabel}
          </Button>
        </div>
      )}

      <style>{`
        @keyframes ceEmptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ceEmptyLid {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          30% { transform: translateX(-50%) rotate(-3deg) translateY(-2px); }
          70% { transform: translateX(-50%) rotate(2deg) translateY(-1px); }
        }
        @keyframes ceEmptySparkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
