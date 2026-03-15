import Lottie from 'lottie-react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Inline Lottie animation data — minimal "empty box" animation
// This avoids needing external JSON files
const emptyBoxAnimation = {
  v: '5.7.4', fr: 30, ip: 0, op: 60, w: 200, h: 200,
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: 'box', sr: 1, ks: {
      o: { a: 1, k: [{ i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [0] }, { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 20, s: [100] }, { t: 60, s: [100] }] },
      p: { a: 1, k: [{ i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 0, s: [100, 120, 0] }, { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 20, s: [100, 100, 0] }, { t: 60, s: [100, 100, 0] }] },
      s: { a: 1, k: [{ i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] }, t: 0, s: [80, 80, 100] }, { i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] }, t: 20, s: [100, 100, 100] }, { t: 60, s: [100, 100, 100] }] },
      r: { a: 0, k: 0 }, a: { a: 0, k: [0, 0, 0] },
    },
    shapes: [
      { ty: 'rc', d: 1, s: { a: 0, k: [60, 50] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 6 }, nm: 'box' },
      { ty: 'st', c: { a: 0, k: [0.76, 0.76, 0.78, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
      { ty: 'fl', c: { a: 0, k: [0.96, 0.96, 0.97, 1] }, o: { a: 0, k: 100 } },
      { ty: 'rc', d: 1, s: { a: 0, k: [60, 8] }, p: { a: 0, k: [0, -21] }, r: { a: 0, k: 4 }, nm: 'lid' },
      { ty: 'st', c: { a: 0, k: [0.76, 0.76, 0.78, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
      { ty: 'fl', c: { a: 0, k: [0.93, 0.93, 0.94, 1] }, o: { a: 0, k: 100 } },
    ],
    ip: 0, op: 60, st: 0,
  }, {
    ddd: 0, ind: 2, ty: 4, nm: 'lines', sr: 1, ks: {
      o: { a: 1, k: [{ i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 25, s: [0] }, { t: 45, s: [40] }] },
      p: { a: 0, k: [100, 60, 0] },
      s: { a: 0, k: [100, 100, 100] }, r: { a: 0, k: 0 }, a: { a: 0, k: [0, 0, 0] },
    },
    shapes: [
      { ty: 'rc', d: 1, s: { a: 0, k: [20, 2] }, p: { a: 0, k: [-10, -8] }, r: { a: 0, k: 1 } },
      { ty: 'fl', c: { a: 0, k: [0.76, 0.76, 0.78, 1] }, o: { a: 0, k: 100 } },
      { ty: 'rc', d: 1, s: { a: 0, k: [14, 2] }, p: { a: 0, k: [-13, 0] }, r: { a: 0, k: 1 } },
      { ty: 'fl', c: { a: 0, k: [0.82, 0.82, 0.84, 1] }, o: { a: 0, k: 100 } },
      { ty: 'rc', d: 1, s: { a: 0, k: [18, 2] }, p: { a: 0, k: [-11, 8] }, r: { a: 0, k: 1 } },
      { ty: 'fl', c: { a: 0, k: [0.86, 0.86, 0.88, 1] }, o: { a: 0, k: 100 } },
    ],
    ip: 0, op: 60, st: 0,
  }],
};

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
      padding: compact ? '32px 20px' : '48px 20px',
    }}>
      <div style={{ width: compact ? 80 : 120, height: compact ? 80 : 120, margin: '0 auto 16px' }}>
        <Lottie
          animationData={emptyBoxAnimation}
          loop={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div style={{
        fontSize: compact ? 14 : 16,
        fontWeight: 600,
        color: 'var(--ce-text)',
        marginBottom: 4,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: compact ? 12 : 13,
        color: 'var(--ce-text-muted)',
        maxWidth: 320,
        margin: '0 auto',
        lineHeight: 1.5,
      }}>
        {description}
      </div>
      {actionLabel && onAction && (
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
