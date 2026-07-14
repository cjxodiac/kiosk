// 메뉴 데이터베이스
// 메뉴 추가/수정/삭제는 이 파일만 고치면 됨
// 필드 설명:
//   id: 고유 번호 (중복 X)
//   categoryId: 어느 카테고리에 속하는지 (categories.js의 id 참조)
//   name: 메뉴 이름
//   price: 가격 (원)
//   image: 이모지 (나중에 사진 경로로 교체 가능)
//   description: 메뉴 설명 (선택)
//   soldOut: 품절 여부
// 메뉴 데이터베이스
// 메뉴 추가/수정/삭제는 이 파일만 고치면 됨
// 필드 설명:
//   id: 고유 번호 (중복 X)
//   categoryId: 어느 카테고리에 속하는지 (categories.js의 id 참조)
//   name: 메뉴 이름 (다국어 지원)
//   price: 가격 (원)
//   image: 이모지 (나중에 사진 경로로 교체 가능)
//   description: 메뉴 설명 (선택)
//   soldOut: 품절 여부
export const menus = [
  // ── 커피 ──
  { id: 101, categoryId: 1, name: { ko: '아메리카노', en: 'Americano', ja: 'アメリカーノ', zh: '美式咖啡' }, price: 4500, image: 'americano.png', description: '에스프레소와 물의 조화', soldOut: false },
  { id: 102, categoryId: 1, name: { ko: '카페라떼', en: 'Cafe Latte', ja: 'カフェラテ', zh: '拿铁咖啡' }, price: 5000, image: 'cafe_latte.png', description: '부드러운 우유와 에스프레소', soldOut: false },
  { id: 103, categoryId: 1, name: { ko: '카푸치노', en: 'Cappuccino', ja: 'カプチーノ', zh: '卡布奇诺' }, price: 5000, image: 'cappuccino.png', description: '풍성한 우유 거품', soldOut: false },
  { id: 104, categoryId: 1, name: { ko: '바닐라라떼', en: 'Vanilla Latte', ja: 'バニララテ', zh: '香草拿铁' }, price: 5500, image: 'vanila_latte.png', description: '달콤한 바닐라 시럽', soldOut: false },
  { id: 105, categoryId: 1, name: { ko: '카라멜마키아토', en: 'Caramel Macchiato', ja: 'キャラメルマキアート', zh: '焦糖玛奇朵' }, price: 5800, image: 'macchiato.png', description: '카라멜의 달콤함', soldOut: false },

  // ── 논커피 ──
  { id: 201, categoryId: 2, name: { ko: '초코라떼', en: 'Choco Latte', ja: 'チョコラテ', zh: '巧克力拿铁' }, price: 5500, image: 'choco_latte.png', description: '진한 초콜릿', soldOut: false },
  { id: 202, categoryId: 2, name: { ko: '녹차라떼', en: 'Green Tea Latte', ja: '抹茶ラテ', zh: '抹茶拿铁' }, price: 5500, image: 'matcha_latte.png', description: '고소한 녹차', soldOut: false },
  { id: 203, categoryId: 2, name: { ko: '미숫가루', en: 'Misugaru (Grain)', ja: 'ミスカル', zh: '烤五谷拿铁' }, price: 5500, image: 'misugaru.png', description: '달콤한 고구마', soldOut: false }, // 설명이 고구마로 되어있네요? ㅎㅎ
  { id: 204, categoryId: 2, name: { ko: '딸기라떼', en: 'Strawberry Latte', ja: 'イチゴラテ', zh: '草莓拿铁' }, price: 5800, image: 'strawberry_latte .png', description: '상큼한 딸기', soldOut: false },

  // ── 스무디 (Only Ice) ──
  { id: 301, categoryId: 3, name: { ko: '딸기요거트스무디', en: 'Strawberry Yogurt Smoothie', ja: 'イチゴヨーグルトスムージー', zh: '草莓酸奶冰沙' }, price: 6500, image: 'strawberry_smoothie.png', description: '신선한 딸기와 요거트', soldOut: false },
  { id: 302, categoryId: 3, name: { ko: '블루베리요거트스무디', en: 'Blueberry Yogurt Smoothie', ja: 'ブルーベリーヨーグルトスムージー', zh: '蓝莓酸奶冰沙' }, price: 6500, image: 'blueberry_smoothie.png', description: '블루베리의 풍미', soldOut: false },
  { id: 303, categoryId: 3, name: { ko: '망고스무디', en: 'Mango Smoothie', ja: 'マンゴースムージー', zh: '芒果冰沙' }, price: 6500, image: 'mango_smoothie.png', description: '달콤한 망고', soldOut: false },
  { id: 304, categoryId: 3, name: { ko: '플레인요거트', en: 'Plain Yogurt', ja: 'プレーンヨーグルト', zh: '原味酸奶' }, price: 5800, image: 'plane_yougart.png', description: '깔끔한 요거트', soldOut: false },
  { id: 305, categoryId: 3, name: { ko: '초코스무디', en: 'Choco Smoothie', ja: 'チョコスムージー', zh: '巧克力冰沙' }, price: 6500, image: 'choco_smoothie.png', description: '진한 초코', soldOut: false },

  // ── 디저트 ──
  { id: 401, categoryId: 4, name: { ko: '치즈케이크', en: 'Cheese Cake', ja: 'チーズケーキ', zh: '芝士蛋糕' }, price: 6000, image: 'cheeze_cake.png', description: '부드러운 뉴욕 치즈케이크', soldOut: false },
  { id: 402, categoryId: 4, name: { ko: '티라미수', en: 'Tiramisu', ja: 'ティラミス', zh: '提拉米苏' }, price: 6500, image: 'tiramisu.png', description: '이탈리안 정통 티라미수', soldOut: false },
  { id: 403, categoryId: 4, name: { ko: '크로플', en: 'Croffle', ja: 'クロッフル', zh: '可朗芙' }, price: 5500, image: 'crople.png', description: '바삭한 크로아상 와플', soldOut: false },
  { id: 404, categoryId: 4, name: { ko: '쿠키', en: 'Cookie', ja: 'クッキー', zh: '曲奇' }, price: 3500, image: 'cookie.png', description: '수제 초코칩 쿠키', soldOut: false },

  // ── 푸드 ──
  { id: 501, categoryId: 5, name: { ko: '햄치즈샌드위치', en: 'Ham & Cheese Sandwich', ja: 'ハムチーズサンドイッチ', zh: '火腿奶酪三明治' }, price: 7000, image: 'sandwitch.png', description: '신선한 햄과 치즈', soldOut: false },
  { id: 502, categoryId: 5, name: { ko: '베이글', en: 'Bagel', ja: 'ベーグル', zh: '百吉饼' }, price: 5000, image: 'beigle.png', description: '쫄깃한 베이글', soldOut: false },
  { id: 503, categoryId: 5, name: { ko: '에그타르트', en: 'Egg Tart', ja: 'エッグタルト', zh: '蛋挞' }, price: 4500, image: 'eggtart.png', description: '포르투갈식 에그타르트', soldOut: false },
];