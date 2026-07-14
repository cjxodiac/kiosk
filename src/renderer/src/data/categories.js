// 카테고리 데이터베이스
// 메뉴를 그룹별로 분류. id로 menus.js와 연결.
export const categories = [
  { id: 1, name: { ko: '커피', en: 'Coffee', ja: 'コーヒー', zh: '咖啡' }, icon: '☕', iceOnly: false },
  { id: 2, name: { ko: '논커피', en: 'Non-Coffee', ja: 'ノンコーヒー', zh: '非咖啡' }, icon: '🥛', iceOnly: false },
  { id: 3, name: { ko: '스무디(Only Ice)', en: 'Smoothie (Ice)', ja: 'スムージー(アイス)', zh: '冰沙(仅冷饮)' }, icon: '🥤', iceOnly: true },
  { id: 4, name: { ko: '디저트', en: 'Dessert', ja: 'デザート', zh: '甜点' }, icon: '🍰', iceOnly: false },
  { id: 5, name: { ko: '푸드', en: 'Food', ja: 'フード', zh: '食品' }, icon: '🥪', iceOnly: false },
];