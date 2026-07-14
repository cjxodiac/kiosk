// 국기 SVG (이모지 대신 사용)
export const KRFlag = ({ size = '1.5em' }) => (
  <svg viewBox="0 0 60 40" style={{ width: size, height: 'auto', display: 'block', borderRadius: '0.2em' }}>
    <rect width="60" height="40" fill="#fff"/>
    <circle cx="30" cy="20" r="8" fill="#cd2e3a"/>
    <path d="M22 20 a8 8 0 0 1 16 0 a4 4 0 0 1 -8 0 a4 4 0 0 0 -8 0" fill="#0047a0"/>
    {/* 4괘 단순화 */}
    <g fill="#000" stroke="#000" strokeWidth="0.8">
      <line x1="9" y1="10" x2="14" y2="6"/>
      <line x1="10" y1="12" x2="15" y2="8"/>
      <line x1="11" y1="14" x2="16" y2="10"/>
      <line x1="46" y1="6" x2="51" y2="10"/>
      <line x1="47" y1="8" x2="52" y2="12"/>
      <line x1="48" y1="10" x2="53" y2="14"/>
      <line x1="9" y1="30" x2="14" y2="34"/>
      <line x1="10" y1="28" x2="15" y2="32"/>
      <line x1="11" y1="26" x2="16" y2="30"/>
      <line x1="46" y1="34" x2="51" y2="30"/>
      <line x1="47" y1="32" x2="52" y2="28"/>
      <line x1="48" y1="30" x2="53" y2="26"/>
    </g>
  </svg>
);

export const USFlag = ({ size = '1.5em' }) => (
  <svg viewBox="0 0 60 40" style={{ width: size, height: 'auto', display: 'block', borderRadius: '0.2em' }}>
    {/* 빨간/흰 줄 13개 */}
    {Array.from({ length: 13 }).map((_, i) => (
      <rect key={i} x="0" y={i * (40/13)} width="60" height={40/13}
        fill={i % 2 === 0 ? '#b22234' : '#fff'} />
    ))}
    {/* 파란 칸톤 */}
    <rect width="24" height="22" fill="#3c3b6e"/>
    {/* 별 단순화 (점) */}
    <g fill="#fff">
      {[3, 7, 11, 15, 19].map(x =>
        [3, 7, 11, 15, 19].map(y => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1"/>
        ))
      )}
    </g>
  </svg>
);

export const CNFlag = ({ size = '1.5em' }) => (
  <svg viewBox="0 0 60 40" style={{ width: size, height: 'auto', display: 'block', borderRadius: '0.2em' }}>
    <rect width="60" height="40" fill="#de2910"/>
    {/* 큰 별 */}
    <polygon points="12,7 13.5,11 17.5,11 14.3,13.5 15.5,17.5 12,15 8.5,17.5 9.7,13.5 6.5,11 10.5,11"
      fill="#ffde00"/>
    {/* 작은 별 4개 */}
    <polygon points="22,4 22.5,5.5 24,5.5 22.8,6.5 23.3,8 22,7.2 20.7,8 21.2,6.5 20,5.5 21.5,5.5"
      fill="#ffde00"/>
    <polygon points="26,8 26.5,9.5 28,9.5 26.8,10.5 27.3,12 26,11.2 24.7,12 25.2,10.5 24,9.5 25.5,9.5"
      fill="#ffde00"/>
    <polygon points="26,14 26.5,15.5 28,15.5 26.8,16.5 27.3,18 26,17.2 24.7,18 25.2,16.5 24,15.5 25.5,15.5"
      fill="#ffde00"/>
    <polygon points="22,18 22.5,19.5 24,19.5 22.8,20.5 23.3,22 22,21.2 20.7,22 21.2,20.5 20,19.5 21.5,19.5"
      fill="#ffde00"/>
  </svg>
);

export const JPFlag = ({ size = '1.5em' }) => (
  <svg viewBox="0 0 60 40" style={{ width: size, height: 'auto', display: 'block', borderRadius: '0.2em' }}>
    <rect width="60" height="40" fill="#fff"/>
    <circle cx="30" cy="20" r="10" fill="#bc002d"/>
  </svg>
);

export const FLAGS = {
  ko: { Component: KRFlag, name: '한국어' },
  en: { Component: USFlag, name: 'English' },
  zh: { Component: CNFlag, name: '中文' },
  ja: { Component: JPFlag, name: '日本語' },
};