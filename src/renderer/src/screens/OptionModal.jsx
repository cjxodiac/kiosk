import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useKiosk } from '../context/KioskContext';
import { 수어영역 } from '../components/Signlanguage';

const INGREDIENT_EMOJI = {
  '에스프레소샷': '☕', '우유': '🥛', '물': '💧', '바닐라시럽': '🍦',
  '헤이즐넛시럽': '🌰', '카라멜시럽': '🍯', '딸기시럽': '🍓', '블루베리시럽': '🫐',
  '초코파우더': '🍫', '말차파우더': '🍵', '미숫가루': '🌾', '요거트': '🥣',
  '망고': '🥭', '치즈케이크': '🍰', '티라미수': '🍮', '크로플': '🧇',
  '쿠키': '🍪', '햄치즈샌드위치': '🥪', '베이글': '🥯', '에그타르트': '🥚',
  '펄': '🧋', '휘핑크림': '🍦',
};

const PAID_OPTIONS = [
  { name: '샷 추가', price: 500 },
  { name: '우유 추가', price: 500 },
  { name: '헤이즐넛 시럽 추가', price: 500 },
  { name: '바닐라 시럽 추가', price: 500 },
  { name: '카라멜 시럽 추가', price: 500 },
  { name: '펄 추가', price: 1000 },
  { name: '휘핑 추가', price: 1000 },
];

const FREE_OPTIONS = ['연하게', '덜달게', '얼음적게', '얼음많이'];

export function OptionModal({ menu, onClose, onAddToCart, 고대비, initialCartItem }) {
  if (!menu) return null;

  const context = useKiosk();
  const 접근성 = context?.접근성;
  const cart = context?.cart || [];
  const 언어 = context?.언어 || 'ko';
  const 배프모드 = context?.배프활성 || false;
  const getLocalizedMenuName = context?.getLocalizedMenuName || ((m) => m?.name || '');
  const 낮은화면 = 접근성?.휠체어 || false;

  const t = {
    options:       { ko: '옵션',        en: 'Options',          ja: 'オプション',        zh: '选项' },
    freeOptions:   { ko: '무료옵션',     en: 'Free options',     ja: '無料オプション',     zh: '免费选项' },
    paidOptions:   { ko: '유료옵션',     en: 'Paid options',     ja: '有料オプション',     zh: '付费选项' },
    hot:           { ko: '뜨거운(HOT)',  en: 'Hot',              ja: 'ホット',             zh: '热饮' },
    iced:          { ko: '차가운(ICE)',  en: 'Iced',             ja: 'アイス',             zh: '冷饮' },
    cancel:        { ko: '취소',         en: 'Cancel',           ja: 'キャンセル',         zh: '取消' },
    next:          { ko: '다음',         en: 'Next',             ja: '次へ',               zh: '下一页' },
    prev:          { ko: '이전',         en: 'Previous',         ja: '前へ',               zh: '上一页' },
    addToCart:     { ko: '주문 담기',    en: 'Add to order',     ja: 'カートに入れる',     zh: '加入订单' },
    updateComplete:{ ko: '변경 완료',    en: 'Update',           ja: '変更完了',           zh: '更新完成' },
    back:          { ko: '뒤로 가기',    en: 'Back',             ja: '戻る',               zh: '返回' },
    ingredients:   { ko: '들어가는 재료', en: 'Ingredients',     ja: '材料',               zh: '配料' },
    noIngredients: { ko: '등록된 재료 없음', en: 'No ingredients', ja: '材料なし',         zh: '无配料' },
    add:           { ko: '추가',         en: 'More',             ja: '追加',               zh: '更多' },
    lessStrong:    { ko: '연하게',       en: 'Less strong',      ja: '薄め',               zh: '少浓' },
    lessSweet:     { ko: '덜달게',       en: 'Less sweet',       ja: '甘さ控えめ',         zh: '少糖' },
    lessIce:       { ko: '얼음적게',     en: 'Less ice',         ja: '氷少なめ',           zh: '少冰' },
    extraIce:      { ko: '얼음많이',     en: 'Extra ice',        ja: '氷多め',             zh: '多冰' },
    addShot:       { ko: '샷 추가',      en: 'Add shot',         ja: 'ショット追加',       zh: '加浓缩' },
    addMilk:       { ko: '우유 추가',    en: 'Add milk',         ja: 'ミルク追加',         zh: '加牛奶' },
    addHazelnut:   { ko: '헤이즐넛 시럽 추가', en: 'Add hazelnut syrup', ja: 'ヘーゼルナッツシロップ追加', zh: '加榛子糖浆' },
    addVanilla:    { ko: '바닐라 시럽 추가', en: 'Add vanilla syrup', ja: 'バニラシロップ追加', zh: '加香草糖浆' },
    addCaramel:    { ko: '카라멜 시럽 추가', en: 'Add caramel syrup', ja: 'キャラメルシロップ追加', zh: '加焦糖糖浆' },
    addPearl:      { ko: '펄 추가',      en: 'Add pearl',        ja: 'パール追加',         zh: '加珍珠' },
    addWhip:       { ko: '휘핑 추가',    en: 'Add whipped cream', ja: 'ホイップ追加',      zh: '加奶油' },
    drinkOption:   {
      ko: '음료의 온도를 선택해주세요. 뜨겁게 또는 차갑게를 선택하신 후 다음 버튼을 눌러주세요.',
      en: 'Please select the temperature. Choose Hot or Iced, then press Next.',
      ja: '温度を選んでください。ホットまたはアイスを選んで次へを押してください。',
      zh: '请选择饮品温度，选择热饮或冷饮后按下一步。',
    },
  };

  const getFreeOptionLabel = (optName) => {
    const map = { '연하게': 'lessStrong', '덜달게': 'lessSweet', '얼음적게': 'lessIce', '얼음많이': 'extraIce' };
    return t[map[optName]]?.[언어] || optName;
  };

  const getPaidOptionLabel = (optName) => {
    const map = {
      '샷 추가': 'addShot', '우유 추가': 'addMilk', '헤이즐넛 시럽 추가': 'addHazelnut',
      '바닐라 시럽 추가': 'addVanilla', '카라멜 시럽 추가': 'addCaramel',
      '펄 추가': 'addPearl', '휘핑 추가': 'addWhip'
    };
    return t[map[optName]]?.[언어] || optName;
  };

  const 배율맵 = { normal: 1.3, large: 1.8, xlarge: 2.3 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'] || 1.3;
  const 낮은배율맵 = { normal: 1.0, large: 1.1, xlarge: 1.2 };
  const lr = 낮은배율맵[접근성?.글씨크기 || 'normal'] || 1.0;

  const [view, setView] = useState('main');
  const [lowPage, setLowPage] = useState(1);
  const [temp, setTemp] = useState('ICE');
  const [freeOpts, setFreeOpts] = useState([]);
  const [paidOpts, setPaidOpts] = useState({});
  const [recipe, setRecipe] = useState([]);

  useEffect(() => {
    let alive = true;
    if (menu?.id != null) {
      window.api?.menu?.getRecipe(menu.id)
        .then(r => { if (alive) setRecipe(Array.isArray(r) ? r : []); })
        .catch(() => {});
    }
    return () => { alive = false; };
  }, [menu?.id]);

  useEffect(() => {
    if (initialCartItem && Array.isArray(initialCartItem.options)) {
      if (initialCartItem.options.includes('따뜻한(HOT)')) setTemp('HOT');
      else setTemp('ICE');
      setFreeOpts(initialCartItem.options.filter(o => FREE_OPTIONS.includes(o)));
      const initialPaid = {};
      initialCartItem.options.forEach(opt => {
        const match = opt.match(/(.*?)\((\d+)\)/);
        if (match && PAID_OPTIONS.find(p => p.name === match[1])) {
          initialPaid[match[1]] = parseInt(match[2], 10);
        }
      });
      setPaidOpts(initialPaid);
    }
  }, [initialCartItem]);

  const yellowColor = 고대비 ? '#FFEB3B' : '#CDE000';
  const brownColor  = 고대비 ? '#3E2723' : '#3E2723';
  const bg          = 고대비 ? '#000000' : '#FFFFFF';
  const fg          = 고대비 ? '#FFEB3B' : '#000000';
  const modalBg     = 고대비 ? '#000000' : '#F5F5F5';
  const borderStyle = 고대비 ? '2px solid #FFEB3B' : 'none';
  const menuImageSrc = menu.image || menu.img || '';
  const r = 배율;

  const 모달Ref = useRef(null);
  const 추가버튼Ref = useRef(null);
  const 주문담기버튼Ref = useRef(null);
  const [화살표경로, set화살표경로] = useState(null);

  useLayoutEffect(() => {
    if (!배프모드) { set화살표경로(null); return; }
    const 측정 = () => {
      const modalEl = 모달Ref.current;
      const endEl = view === 'paid' ? 주문담기버튼Ref.current : 추가버튼Ref.current;
      if (!modalEl || !endEl) { set화살표경로(null); return; }
      const modalRect = modalEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();
      const startX = modalRect.width - 32;
      const startY = 60;
      const endX = endRect.left + endRect.width / 2 - modalRect.left;
      const endY = endRect.top - modalRect.top - 8; // 버튼 살짝 위에서 꽂히게
      if (endY - startY < 20 || modalRect.width < 10) { set화살표경로(null); return; }
      set화살표경로({ startX, startY, endX, endY, w: modalRect.width, h: modalRect.height });
    };
    측정();
    const raf = requestAnimationFrame(측정); // 레이아웃이 완전히 반영된 다음 한 번 더 재측정
    window.addEventListener('resize', 측정);
    return () => { window.removeEventListener('resize', 측정); cancelAnimationFrame(raf); };
  }, [배프모드, view, r, 고대비]);

  const getTempBtnStyle = (key, isLow = false) => {
    const active = temp === key;
    const size = isLow ? lr : 배율;
    return {
      background: active ? yellowColor : bg,
      color: active ? '#000000' : fg,
      border: active ? `3px solid ${고대비 ? '#FFEB3B' : '#AABF00'}` : `1px solid ${고대비 ? '#FFEB3B' : '#969696'}`,
      fontWeight: 'bold', cursor: 'pointer', fontSize: `${18 * size}px`,
    };
  };

  const toggleFreeOpt = (opt) => {
    let next = [...freeOpts];
    if (next.includes(opt)) { next = next.filter(o => o !== opt); }
    else {
      if (opt === '연하게') next = next.filter(o => o !== '덜달게');
      if (opt === '덜달게') next = next.filter(o => o !== '연하게');
      if (opt === '얼음적게') next = next.filter(o => o !== '얼음많이');
      if (opt === '얼음많이') next = next.filter(o => o !== '얼음적게');
      next.push(opt);
    }
    setFreeOpts(next);
  };

  const updatePaidOpt = (name, delta) => {
    setPaidOpts(prev => {
      const currentQty = prev[name] || 0;
      const next = currentQty + delta;
      if (next < 0) return prev;
      if (context?.안내) {
        const localizedName = getPaidOptionLabel(name);
        if (delta > 0) context.안내(`${localizedName}가 추가되어 총 ${next}개가 되었습니다.`);
        else if (next === 0) context.안내(`${localizedName}가 모두 취소되었습니다.`);
        else context.안내(`${localizedName}가 하나 빼져서 총 ${next}개가 되었습니다.`);
      }
      return { ...prev, [name]: next };
    });
  };

  const handleAddToCart = () => {
    const optionsArray = [temp === 'ICE' ? '차가운(ICE)' : '따뜻한(HOT)', ...freeOpts];
    let optionPriceTotal = 0;
    Object.entries(paidOpts || {}).forEach(([name, qty]) => {
      if (qty > 0) {
        optionsArray.push(`${name}(${qty})`);
        const optData = PAID_OPTIONS.find(o => o.name === name);
        if (optData) optionPriceTotal += optData.price * qty;
      }
    });
    const existingItem = cart.find(item =>
      item.menuId === menu.id &&
      JSON.stringify([...item.options].sort()) === JSON.stringify([...optionsArray].sort())
    );
    if (typeof onAddToCart === 'function') {
      if (existingItem && !initialCartItem) {
        onAddToCart({ uid: existingItem.uid, menuId: menu.id, qty: existingItem.qty + 1, options: optionsArray, optionPrice: optionPriceTotal });
      } else {
        onAddToCart({ uid: initialCartItem ? initialCartItem.uid : undefined, menuId: menu.id, qty: initialCartItem ? initialCartItem.qty : 1, options: optionsArray, optionPrice: optionPriceTotal });
      }
    }
    if (onClose) onClose();
  };

  const RecipeBox = () => (
    <div style={{ border: `1px solid ${고대비 ? '#FFEB3B' : '#CCC'}`, borderRadius: `${8 * r}px`, padding: `${10 * r}px ${12 * r}px`, background: 고대비 ? '#111' : '#FAFAFA' }}>
      <div style={{ fontSize: `${12 * r}px`, fontWeight: 'bold', color: 고대비 ? '#FFEB3B' : '#888', marginBottom: `${8 * r}px` }}>{t.ingredients[언어]}</div>
      {recipe.length === 0 ? (
        <div style={{ fontSize: `${12 * r}px`, color: 고대비 ? '#FFEB3B' : '#AAA' }}>{t.noIngredients[언어]}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${8 * r}px` }}>
          {recipe.map(ing => {
            const emoji = INGREDIENT_EMOJI[ing.ingredient_name] || '🧂';
            return (
              <div key={ing.ingredient_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${3 * r}px`, width: `${52 * r}px` }}>
                <div style={{ width: `${44 * r}px`, height: `${44 * r}px`, borderRadius: '50%', border: `1px solid ${고대비 ? '#FFEB3B' : '#DDD'}`, background: 고대비 ? '#222' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${22 * r}px` }}>{emoji}</div>
                <div style={{ fontSize: `${10 * r}px`, color: fg, textAlign: 'center', lineHeight: 1.2, wordBreak: 'keep-all' }}>{ing.ingredient_name}</div>
                <div style={{ fontSize: `${10 * r}px`, color: 고대비 ? '#FFEB3B' : '#999', whiteSpace: 'nowrap' }}>{ing.quantity}{ing.unit}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 배프모드 - 팝업 상단 안내 (일반모드 전용)
  const BefGuide = () => {
      if (!배프모드) return null;
      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: `${16 * r}px 16px 0`, gap: `${14 * r}px` }}>
          <div style={{ background: '#FFFFF0', borderRadius: `${18 * r}px`, padding: `${18 * r}px ${22 * r}px`, boxShadow: '0 6px 16px rgba(0,0,0,0.25)', position: 'relative', maxWidth: `${380 * r}px` }}>
            <div style={{ fontWeight: 'bold', fontSize: `${24 * r}px`, color: '#222', lineHeight: 1.5 }}>
              {view === 'paid' ? (
                <>
                  추가된 옵션을 확인해주세요!<br />
                  주문이 맞다면 '<span style={{ color: '#CDE000', fontWeight: 'bold' }}>주문 담기</span>'를 눌러주세요.
                </>
              ) : (
                <>
                  원하는 옵션을 선택하고<br />
                  <span style={{ color: '#CDE000', fontWeight: 'bold' }}>주문 담기</span>를 눌러주세요!
                </>
              )}
            </div>
          </div>
          <img src="bef2.png" alt="배프" style={{ width: `${96 * r}px`, height: 'auto', flexShrink: 0 }} />
        </div>
      );
    };

  // 배프모드 - 팝업 하단 TIP
  const BefTip = () => {
    if (!배프모드) return null;
    if (view === 'paid') {
      return (
        <div style={{ background: '#F5F5DC', padding: `${18 * r}px ${16 * r}px`, display: 'flex', alignItems: 'center', gap: `${12 * r}px`, borderTop: '1px solid #DDD' }}>
          <span style={{ fontSize: `${28 * r}px`, flexShrink: 0 }}>💡</span>
          <span style={{ fontSize: `${22 * r}px`, fontWeight: 'bold', color: '#333' }}>
            옵션은 나중에 다시 변경할 수 있어요.
          </span>
        </div>
      );
    }
    return (
      <div style={{ background: '#F5F5DC', padding: `${18 * r}px ${16 * r}px`, display: 'flex', alignItems: 'center', gap: `${14 * r}px`, borderTop: '1px solid #DDD' }}>
        <img src="bef4.png" alt="배프" style={{ width: `${58 * r}px`, height: `${58 * r}px`, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <span style={{ background: '#CDE000', color: '#000', fontSize: `${22 * r}px`, fontWeight: 'bold', padding: `${5 * r}px ${12 * r}px`, borderRadius: `${12 * r}px`, flexShrink: 0 }}>TIP</span>
        <span style={{ fontSize: `${23 * r}px`, fontWeight: '900', color: '#333', flex: 1 }}>
          옵션을 선택한 후 <span style={{ color: '#3D8C00', fontWeight: 'bold' }}>주문 담기</span>를 누르면 장바구니에 담겨요!
        </span>
      </div>
    );
  };

  // ── 낮은화면 모드 ──
  if (낮은화면) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ width: '100%', background: bg, display: 'flex', flexDirection: 'column', borderTop: borderStyle, boxShadow: '0 -4px 20px rgba(0,0,0,0.2)' }}>
          <수어영역 안내텍스트={t.drinkOption[언어]} 영상="drink_option.mp4" />
          <div style={{ background: 고대비 ? '#000' : brownColor, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 고대비 ? '2px solid #FFEB3B' : 'none' }}>
            <span style={{ color: 고대비 ? '#FFEB3B' : '#FFF', fontSize: `${20 * lr}px`, fontWeight: 'bold' }}>{getLocalizedMenuName(menu)} &nbsp; {lowPage}/2</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 고대비 ? '#FFEB3B' : '#FFF', fontSize: '26px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lowPage === 1 && (
              <>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '140px', height: '140px', border: `1px solid ${고대비 ? '#FFEB3B' : '#E0E0E0'}`, borderRadius: '12px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '6px' }}>
                    {menuImageSrc && <img src={menuImageSrc} alt={getLocalizedMenuName(menu)} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />}
                  </div>
                  <div style={{ fontSize: `${26 * lr}px`, fontWeight: 'bold', color: fg, wordBreak: 'keep-all' }}>{getLocalizedMenuName(menu)}</div>
                </div>
                <div>
                  <div style={{ fontSize: `${16 * lr}px`, fontWeight: 'bold', color: fg, marginBottom: '8px' }}>{t.options[언어]}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button onClick={() => setTemp('HOT')} style={{ ...getTempBtnStyle('HOT', true), padding: '16px 8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <img src="hot.png" alt="HOT" style={{ width: '60px', height: 'auto', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                      <span>{t.hot[언어]}</span>
                    </button>
                    <button onClick={() => setTemp('ICE')} style={{ ...getTempBtnStyle('ICE', true), padding: '16px 8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <img src="cold.png" alt="ICE" style={{ width: '60px', height: 'auto', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                      <span>{t.iced[언어]}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: `${16 * lr}px`, fontWeight: 'bold', color: fg, marginBottom: '8px' }}>{t.freeOptions[언어]}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {FREE_OPTIONS.map(opt => {
                      const active = freeOpts.includes(opt);
                      return (
                        <button key={opt} onClick={() => toggleFreeOpt(opt)} style={{ height: '52px', borderRadius: '8px', fontSize: `${16 * lr}px`, fontWeight: 'bold', background: active ? yellowColor : bg, color: active ? '#000' : fg, border: active ? `2px solid ${고대비 ? '#FFEB3B' : '#AABF00'}` : `1px solid ${고대비 ? '#FFEB3B' : '#DDD'}`, cursor: 'pointer' }}>
                          {getFreeOptionLabel(opt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            {lowPage === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {PAID_OPTIONS.map(opt => {
                  const qty = paidOpts[opt.name] || 0;
                  const localizedOptName = getPaidOptionLabel(opt.name);
                  return (
                    <div key={opt.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div style={{ fontSize: `${18 * lr}px`, color: fg }}>+ {localizedOptName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: `${18 * lr}px`, color: fg }}>₩ {opt.price.toLocaleString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updatePaidOpt(opt.name, -1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 고대비 ? '#FFEB3B' : '#666', color: 고대비 ? '#000' : '#FFF', border: 'none', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 'bold', fontSize: `${18 * lr}px`, color: fg }}>{qty}</span>
                          <button onClick={() => updatePaidOpt(opt.name, 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 고대비 ? '#FFEB3B' : '#666', color: 고대비 ? '#000' : '#FFF', border: 'none', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ background: modalBg, padding: '14px 16px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${고대비 ? '#FFEB3B' : '#E0E0E0'}` }}>
            {lowPage === 1 ? (
              <>
                <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: '#C0C0C0', color: '#000', fontSize: `${16 * lr}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.cancel[언어]}</button>
                <button onClick={() => setLowPage(2)} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: yellowColor, color: '#000', fontSize: `${16 * lr}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.next[언어]}</button>
              </>
            ) : (
              <>
                <button onClick={() => setLowPage(1)} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: '#C0C0C0', color: '#000', fontSize: `${16 * lr}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.prev[언어]}</button>
                <button onClick={handleAddToCart} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: yellowColor, color: '#000', fontSize: `${16 * lr}px`, fontWeight: 'bold', cursor: 'pointer' }}>{initialCartItem ? t.updateComplete[언어] : t.addToCart[언어]}</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 일반 모드 ──
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div ref={모달Ref} style={{ width: '92%', maxWidth: `min(${538 * r}px, 95vw)`, background: 고대비 ? '#000' : '#FFFFFF', border: borderStyle, borderRadius: `${12 * r}px`, display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', position: 'relative' }}>
      {배프모드 && 화살표경로 && (() => {
          const { startY, endX, endY, w, h } = 화살표경로;
          // 모달 안쪽 패딩(20*r)의 중간 지점 - 콘텐츠(버튼)와 모달 테두리 사이 빈 여백을 타고 내려감
          const startX = w - 10 * r;
          const bendY = startY + (endY - startY) * 0.9; // 거의 끝부분에서만 안쪽으로 짧게 꺾여 들어오도록
          return (
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: `${w}px`, height: `${h}px`, zIndex: 10, pointerEvents: 'none' }}
              viewBox={`0 0 ${w} ${h}`}
            >
              <path
                d={`M ${startX} ${startY} C ${startX} ${bendY}, ${endX} ${bendY}, ${endX} ${endY}`}
                fill="none" stroke="#CDE000" strokeWidth="2.5" strokeDasharray="6,4"
              />
              <polygon points={`${endX - 8},${endY - 10} ${endX + 8},${endY - 10} ${endX},${endY + 4}`} fill="#CDE000" />
            </svg>
          );
        })()}

        {/* 상단 바 */}
        <div style={{ background: 고대비 ? '#111111' : brownColor, padding: `${15 * r}px ${20 * r}px`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 고대비 ? '#FFEB3B' : '#FFF', fontSize: `${28 * r}px`, cursor: 'pointer' }}>✕</button>
        </div>

        {/* 배프 안내 (배프모드 ON일때만) */}
        <BefGuide />

        {/* 수어 영역 */}
        <수어영역 안내텍스트={t.drinkOption[언어]} 영상="drink_option.mp4" />

        <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', background: bg }}>
          {view === 'main' ? (
            <div style={{ padding: `${20 * r}px` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${20 * r}px`, marginBottom: `${20 * r}px` }}>
                <div style={{ width: `${180 * r}px`, height: `${220 * r}px`, flexShrink: 0, border: `1px solid ${고대비 ? '#FFEB3B' : '#CCC'}`, borderRadius: `${12 * r}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: 고대비 ? '#111' : '#FFF' }}>
                  {menuImageSrc && <img src={menuImageSrc} alt={getLocalizedMenuName(menu)} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />}
                  <div style={{ position: 'absolute', top: `${8 * r}px`, right: `${8 * r}px`, fontSize: `${20 * r}px` }}>{temp === 'ICE' ? '❄️' : '♨️'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: `${24 * r}px`, fontWeight: 'bold', marginBottom: `${12 * r}px`, color: fg, wordBreak: 'keep-all' }}>{getLocalizedMenuName(menu)}</div>
                  <RecipeBox />
                </div>
              </div>
              <div style={{ fontSize: `${18 * r}px`, fontWeight: 'bold', marginBottom: `${10 * r}px`, color: fg }}>{t.options[언어]}</div>
              <div style={{ display: 'flex', gap: `${10 * r}px`, marginBottom: `${20 * r}px` }}>
                <button onClick={() => setTemp('HOT')} style={{ ...getTempBtnStyle('HOT'), width: `${160 * r}px`, padding: '16px 0', borderRadius: `${12 * r}px`, boxShadow: '2px 2px 6px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <img src="hot.png" alt="HOT" style={{ width: '50px', height: 'auto' }} />
                  {t.hot[언어]}
                </button>
                <button onClick={() => setTemp('ICE')} style={{ ...getTempBtnStyle('ICE'), width: `${160 * r}px`, padding: '16px 0', borderRadius: `${12 * r}px`, boxShadow: '2px 2px 6px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <img src="cold.png" alt="ICE" style={{ width: '50px', height: 'auto' }} />
                  {t.iced[언어]}
                </button>
              </div>
              <div style={{ fontSize: `${18 * r}px`, fontWeight: 'bold', marginBottom: `${10 * r}px`, color: fg }}>{t.freeOptions[언어]}</div>
              <div style={{ display: 'grid', gridTemplateColumns: `${160 * r}px ${160 * r}px`, gap: `${10 * r}px`, marginBottom: `${20 * r}px`, marginLeft: `${16 * r}px` }}>
                {FREE_OPTIONS.map(opt => {
                  const active = freeOpts.includes(opt);
                  return (
                    <button key={opt} onClick={() => toggleFreeOpt(opt)} style={{ height: `${52 * r}px`, borderRadius: `${8 * r}px`, fontSize: `${16 * r}px`, fontWeight: 'bold', background: active ? yellowColor : (고대비 ? '#111' : '#FFF'), color: active ? '#000' : fg, border: active ? `2px solid ${고대비 ? '#FFEB3B' : brownColor}` : `1px solid ${고대비 ? '#555' : '#CCC'}`, cursor: 'pointer' }}>
                      {getFreeOptionLabel(opt)}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: `${18 * r}px`, fontWeight: 'bold', color: fg }}>{t.paidOptions[언어]}</div>
                <button ref={추가버튼Ref} onClick={() => setView('paid')} style={{ padding: `${8 * r}px ${24 * r}px`, borderRadius: `${8 * r}px`, border: `1px solid ${고대비 ? '#FFEB3B' : '#CCC'}`, background: 고대비 ? '#111' : '#FFF', color: fg, fontSize: `${16 * r}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.add[언어]} 〉</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: `${20 * r}px` }}>
              <div style={{ textAlign: 'center', fontSize: `${22 * r}px`, fontWeight: 'bold', marginBottom: `${24 * r}px`, color: fg }}>{getLocalizedMenuName(menu)} {temp === 'ICE' ? '❄️' : '♨️'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${16 * r}px` }}>
                {PAID_OPTIONS.map(opt => {
                  const qty = paidOpts[opt.name] || 0;
                  const localizedOptName = getPaidOptionLabel(opt.name);
                  return (
                    <div key={opt.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: `${18 * r}px`, color: fg }}>
                      <div>+ {localizedOptName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: `${16 * r}px` }}>
                        <span style={{ fontWeight: 'bold' }}>₩ {opt.price.toLocaleString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * r}px` }}>
                          <button onClick={() => updatePaidOpt(opt.name, -1)} style={{ width: `${34 * r}px`, height: `${34 * r}px`, borderRadius: '50%', background: 고대비 ? '#FFEB3B' : brownColor, color: 고대비 ? '#000' : '#FFF', border: 'none', fontSize: `${18 * r}px`, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ minWidth: `${22 * r}px`, textAlign: 'center', fontWeight: 'bold', color: fg }}>{qty}</span>
                          <button onClick={() => updatePaidOpt(opt.name, 1)} style={{ width: `${34 * r}px`, height: `${34 * r}px`, borderRadius: '50%', background: 고대비 ? '#FFEB3B' : brownColor, color: 고대비 ? '#000' : '#FFF', border: 'none', fontSize: `${18 * r}px`, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const 추가금액 = Object.entries(paidOpts || {}).reduce((sum, [name, qty]) => {
                  const opt = PAID_OPTIONS.find(o => o.name === name);
                  return sum + (opt ? opt.price * qty : 0);
                }, 0);
                const 총금액 = (menu.price || 0) + 추가금액;
                return (
                  <div style={{ marginTop: `${24 * r}px`, border: `2px dashed ${고대비 ? '#FFEB3B' : '#CDE000'}`, borderRadius: `${12 * r}px`, padding: `${16 * r}px ${20 * r}px`, display: 'flex', alignItems: 'center', gap: `${16 * r}px` }}>
                    <div style={{ fontSize: `${28 * r}px`, flexShrink: 0 }}>🥤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${16 * r}px`, color: fg, marginBottom: '6px' }}>
                        <span>추가 금액</span>
                        <span style={{ fontWeight: 'bold' }}>₩{추가금액.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${16 * r}px`, color: fg }}>
                        <span>총 금액</span>
                        <span style={{ fontWeight: 'bold' }}>₩{총금액.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div style={{ marginTop: `${20 * r}px`, textAlign: 'center' }}>
                <button onClick={() => setView('main')} style={{ padding: `${12 * r}px ${40 * r}px`, borderRadius: '30px', border: `1px solid ${고대비 ? '#FFEB3B' : '#CCC'}`, background: 고대비 ? '#111' : '#FFF', color: fg, fontSize: `${16 * r}px`, fontWeight: 'bold', cursor: 'pointer' }}>〈 {t.back[언어]}</button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 TIP */}
        <BefTip />

        {/* 하단 버튼 */}
        <div style={{ background: modalBg, padding: `${16 * r}px ${20 * r}px`, display: 'flex', justifyContent: 'center', gap: `${12 * r}px`, borderTop: 고대비 ? '1px solid #FFEB3B' : 'none' }}>
          <button onClick={onClose} style={{ width: `${120 * r}px`, height: `${72 * r}px`, borderRadius: `${8 * r}px`, border: 'none', background: 고대비 ? '#333' : '#C0C0C0', color: 고대비 ? '#FFEB3B' : '#000', fontSize: `${20 * r}px`, fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 4px 8px rgba(0,0,0,0.25)' }}>{t.cancel[언어]}</button>
          <button ref={주문담기버튼Ref} onClick={handleAddToCart} style={{ width: `${180 * r}px`, height: `${72 * r}px`, borderRadius: `${8 * r}px`, border: 'none', background: yellowColor, color: '#000', fontSize: `${20 * r}px`, fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 4px 8px rgba(0,0,0,0.25)' }}>{initialCartItem ? t.updateComplete[언어] : t.addToCart[언어]}</button>
        </div>
      </div>
    </div>
  );
}