// 색상 팔레트
export const COLORS = {
  // 메인 라임 (콜린님 지정)
  primary: '#D1E000',
  primaryDark: '#A8B400',
  primaryLight: '#E8F26B',

  // 갈색 (하단바, 카테고리탭)
  brown: '#3E2723',
  brownLight: '#6D4C41',
  brownPale: '#EFEBE9',

  // 쉬운모드 강조 (오렌지)
  easy: '#FF7A00',
  easyDark: '#E66A00',

  // 시스템
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray400: '#9CA3AF',
  gray700: '#374151',

  // 상태
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',

  // 고대비 모드
  hcBg: '#000000',
  hcFg: '#FFEB3B',
};

// 크기 (em 기반 — 모든 키오스크 크기에 적응)
export const SIZE = {
  // 터치 최소 크기 (NIA 권장)
  touchMin: '4em',
  // 둥근 모서리
  radiusS: '0.5em',
  radiusM: '1em',
  radiusL: '1.5em',
  // 그림자
  shadowS: '0 0.2em 0.5em rgba(0,0,0,0.1)',
  shadowM: '0 0.5em 1.2em rgba(0,0,0,0.15)',
  shadowL: '0 0.8em 2em rgba(0,0,0,0.25)',
};

// 화면 흐름 단계
export const STEPS = ['메뉴선택', '주문확인', '결제', '완료'];