import { useKiosk } from '../context/KioskContext';

export function BefOverlay({ bubbles }) {
  const { 배프활성, 배프안내닫힘, set배프안내닫힘, 접근성 } = useKiosk();
  if (!배프활성 || 배프안내닫힘) return null;

  const 배율맵 = { normal: 1, large: 1.25, xlarge: 1.5 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'] || 1;

  const getTailStyle = (tail) => {
    if (!tail) return null;
    const s = 20 * 배율;
    const base = {
      position: 'absolute',
      width: 0, height: 0,
      borderStyle: 'solid',
    };
    switch (tail) {
      case 'top-right': return { ...base, top: `-${s}px`, right: '24px', borderWidth: `0 ${s * 0.7}px ${s}px ${s * 0.7}px`, borderColor: 'transparent transparent #FFFFF0 transparent' };
      case 'top-left':  return { ...base, top: `-${s}px`, left: '24px',  borderWidth: `0 ${s * 0.7}px ${s}px ${s * 0.7}px`, borderColor: 'transparent transparent #FFFFF0 transparent' };
      case 'bottom-left':  return { ...base, bottom: `-${s}px`, left: '24px',  borderWidth: `${s}px ${s * 0.7}px 0 ${s * 0.7}px`, borderColor: '#FFFFF0 transparent transparent transparent' };
      case 'bottom-right': return { ...base, bottom: `-${s}px`, right: '24px', borderWidth: `${s}px ${s * 0.7}px 0 ${s * 0.7}px`, borderColor: '#FFFFF0 transparent transparent transparent' };
      case 'left':  return { ...base, top: '50%', left: `-${s}px`,  transform: 'translateY(-50%)', borderWidth: `${s * 0.7}px ${s}px ${s * 0.7}px 0`, borderColor: 'transparent #FFFFF0 transparent transparent' };
      case 'right': return { ...base, top: '50%', right: `-${s}px`, transform: 'translateY(-50%)', borderWidth: `${s * 0.7}px 0 ${s * 0.7}px ${s}px`, borderColor: 'transparent transparent transparent #FFFFF0' };
      default: return null;
    }
  };

  return (
    <div
      onClick={() => set배프안내닫힘(true)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 500,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}>
      {bubbles.map((bubble, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: bubble.left,
          top: bubble.top,
          right: bubble.right,
          bottom: bubble.bottom,
          transform: bubble.transform,
          display: 'flex',
          flexDirection: bubble.direction || 'row',
          alignItems: 'flex-end',
          gap: `${14 * 배율}px`,
        }}>
          {/* 말풍선 */}
          <div style={{
            background: '#FFFFF0',
            borderRadius: `${20 * 배율}px`,
            padding: `${22 * 배율}px ${28 * 배율}px`,
            maxWidth: `${420 * 배율}px`,
            boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            {/* 말풍선 꼬리 */}
            {bubble.tail && <div style={getTailStyle(bubble.tail)} />}

            {bubble.title && (
              <div style={{ fontWeight: 'bold', fontSize: `${28 * 배율}px`, color: '#222', marginBottom: '8px' }}>
                {bubble.title}
              </div>
            )}
            <div style={{ fontSize: `${26 * 배율}px`, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line', fontWeight: 'bold' }}>
              {bubble.textNode || bubble.text}
            </div>
          </div>

          {/* 캐릭터 이미지 */}
          {bubble.image && (
            <img
              src={bubble.image}
              alt="배프"
              style={{ width: `calc(${bubble.imageSize || '80px'} * ${배율} * 1.4)`, height: 'auto', flexShrink: 0 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}