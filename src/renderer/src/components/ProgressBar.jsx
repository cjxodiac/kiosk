import { COLORS } from './tokens';

const STEPS = ['메뉴선택', '주문확인', '결제', '완료'];

export function ProgressBar({ currentStep = 1, 고대비 = false, 배율 = 1 }) {
  const primaryColor = 고대비 ? '#FFEB3B' : COLORS.primary;
  const brownColor = 고대비 ? '#FFEB3B' : '#3D2418';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px 24px', gap: '8px',
    }}>
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isPast = stepNum < currentStep;

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{
                width: `${50 * 배율}px`, height: `${50 * 배율}px`, borderRadius: '50%',
                background: isActive ? primaryColor : isPast ? (고대비 ? '#FFEB3B' : brownColor) : (고대비 ? '#000000' : '#FFFFFF'),
                border: `3px solid ${고대비 ? '#FFEB3B' : (isActive ? primaryColor : brownColor)}`,
                color: isActive ? '#000000' : isPast ? (고대비 ? '#000000' : '#FFFFFF') : (고대비 ? '#FFEB3B' : brownColor),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: `${22 * 배율}px`, fontWeight: 'bold',
              }}>
                {stepNum}
              </div>
              <div style={{
                fontSize: `${14 * 배율}px`,
                fontWeight: isActive ? 'bold' : 'normal',
                color: 고대비 ? '#FFEB3B' : (isActive ? brownColor : '#777'),
                whiteSpace: 'nowrap',
              }}>
                {step}
              </div>
            </div>

            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '3px',
                background: isPast ? (고대비 ? '#FFEB3B' : brownColor) : (고대비 ? '#444444' : '#DDD'),
                marginBottom: '24px', marginLeft: '-10px', marginRight: '-10px',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}