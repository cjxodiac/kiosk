// 옵션 그룹 (한 묶음 안에서 1개만 또는 여러 개 선택)
export const optionGroups = [
  {
    id: 1,
    name: { ko: '온도', en: 'Temperature', ja: '温度', zh: '温度' },
    type: 'single',  // 1개만 선택
    required: true,
    options: [
      { id: 11, name: { ko: '뜨거운(HOT)', en: 'HOT', ja: 'ホット', zh: '热' }, price: 0 },
      { id: 12, name: { ko: '차가운(ICE)', en: 'ICE', ja: 'アイス', zh: '冰' }, price: 0 },
    ],
  },
  {
    id: 2,
    name: { ko: '추가 옵션', en: 'Add-ons', ja: '追加オプション', zh: '附加选项' },
    type: 'multiple',  // 여러 개 선택 가능
    required: false,
    options: [
      { id: 21, name: { ko: '샷 추가', en: 'Extra Shot', ja: 'ショット追加', zh: '加浓' }, price: 500 },
      { id: 22, name: { ko: '시럽 추가', en: 'Add Syrup', ja: 'シロップ追加', zh: '加糖浆' }, price: 500 },
      { id: 23, name: { ko: '헤이즐넛 시럽', en: 'Hazelnut', ja: 'ヘーゼルナッツ', zh: '榛果' }, price: 500 },
    ],
  },
  {
    id: 3,
    name: { ko: '농도', en: 'Strength', ja: '濃さ', zh: '浓度' },
    type: 'single',
    required: false,
    options: [
      { id: 31, name: { ko: '연하게', en: 'Mild', ja: '薄め', zh: '淡' }, price: 0 },
      { id: 32, name: { ko: '보통', en: 'Normal', ja: '普通', zh: '正常' }, price: 0 },
      { id: 33, name: { ko: '진하게', en: 'Strong', ja: '濃いめ', zh: '浓' }, price: 0 },
    ],
  },
];