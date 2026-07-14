import React, { useState, useEffect } from 'react';
import { useKiosk } from '../context/KioskContext';
import { COLORS } from '../components/tokens';
import { ProgressBar } from '../components/ProgressBar';
import { formatPrice } from '../data';
import { OrderConfirmScreen } from './OrderConfirmScreen';
import { OptionModal } from './OptionModal';
import { 수어영역 } from '../components/Signlanguage';
import { BefOverlay } from '../components/BefOverlay';

export function MenuScreen() {
  const { 화면, 안내, 접근성, set화면, 장바구니, 장바구니추가, 장바구니수정, 장바구니제거,
    categories, menus, getMenusByCategoryId, 언어, getLocalizedMenuName, getLocalizedCategoryName, 배프활성 } = useKiosk();
  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;
  const 글씨크기 = 접근성?.글씨크기 || 'normal';
  const 배율맵 = { normal: 1.5, large: 1.8, xlarge: 2.3 };
  const 낮은화면배율맵 = { normal: 1.5, large: 1.6, xlarge: 1.8 };
  const 배율 = 낮은화면 ? 낮은화면배율맵[글씨크기] : 배율맵[글씨크기];

  const t = {
    orderHistory: { ko: '주문내역', en: 'Orders',   ja: '注文履歴',   zh: '订单' },
    order:        { ko: '주문하기', en: 'Order',    ja: '注文する',   zh: '点餐' },
    cancel:       { ko: '취소하기', en: 'Cancel',   ja: 'キャンセル', zh: '取消' },
    cartTitle:    { ko: '장바구니 확인', en: 'Cart', ja: 'カート',    zh: '购물车' },
    optionChange: { ko: '옵션변경', en: 'Options',  ja: 'オプション', zh: '选项' },
    soldOut:      { ko: '품절',    en: 'Sold Out',  ja: '売切',       zh: '售罄' },
    totalQty:     { ko: '총 수량', en: 'Qty',       ja: '数量',       zh: '数量' },
    total:        { ko: '총 금액', en: 'Total',     ja: '合計',       zh: '总计' },
    cartEmpty:    { ko: '장바구니가 비어있습니다.', en: 'Cart is empty.', ja: 'カートが空です。', zh: '购物车为空。' },
    delete:       { ko: '삭제',   en: 'Delete',    ja: '削除',        zh: '删除' },
    prev:         { ko: '이전',   en: 'Prev',      ja: '前へ',        zh: '上一页' },
    next:         { ko: '다음',   en: 'Next',      ja: '次へ',        zh: '下一页' },
    selectMenu:   { ko: '음료를 선택해주세요.', en: 'Select a drink.', ja: '飲み物を選んでください。', zh: '请选择饮品。' },
  };

  const [선택카테고리, set선택카테고리] = useState(() => categories[0]?.id ?? 1);
  const [페이지, set페이지] = useState(0);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, menu: null, cartItem: null });
  const [showCartModal, setShowCartModal] = useState(false);
  const [추천보기, set추천보기] = useState(false);
  const [추천로딩, set추천로딩] = useState(false);
  const [인기추천목록, set인기추천목록] = useState([]);
  const [날씨추천목록, set날씨추천목록] = useState([]);
  const [날씨정보, set날씨정보] = useState(null);
  const [추천에러, set추천에러] = useState(false);

  useEffect(() => { if (!배프활성 && 추천보기) set추천보기(false); }, [배프활성, 추천보기]);

  const 추천불러오기 = async () => {
    set추천로딩(true);
    set추천에러(false);
    try {
      const cartMenuIds = [...new Set(장바구니.map(item => item.menuId))];
      const result = await window.api.recommendation.get(cartMenuIds);
      const mapWithMenuInfo = (list) => (list || [])
        .map(r => { const m = menus.find(m => m.id === r.id); return m ? { ...m, reason: r.reason } : null; })
        .filter(Boolean);
      set인기추천목록(mapWithMenuInfo(result?.popular));
      set날씨추천목록(mapWithMenuInfo(result?.weather));
      set날씨정보(result?.weatherInfo || null);
    } catch (err) {
      console.error(err);
      set추천에러(true);
    } finally {
      set추천로딩(false);
    }
  };

  if (화면 === '주문확인') return <OrderConfirmScreen />;

  const bg = 고대비 ? '#000000' : '#E8E8E8';
  const cardBg = 고대비 ? '#000000' : '#FFFFFF';
  const fg = 고대비 ? '#FFEB3B' : '#000000';
  const primaryColor = 고대비 ? '#FFEB3B' : COLORS.primary;
  const brownColor = 고대비 ? '#FFEB3B' : '#3D2418';
  const grayColor = 고대비 ? '#444' : '#BBB';

  const MENUS_PER_PAGE = 8;
  const 카테고리메뉴 = getMenusByCategoryId(선택카테고리);
  const 총페이지 = Math.max(1, Math.ceil(카테고리메뉴.length / MENUS_PER_PAGE));
  const 현재페이지메뉴 = 카테고리메뉴.slice(페이지 * MENUS_PER_PAGE, (페이지 + 1) * MENUS_PER_PAGE);
  const 빈슬롯수 = MENUS_PER_PAGE - 현재페이지메뉴.length;
  const 빈슬롯 = Array(빈슬롯수).fill(null);

  const 카테고리클릭 = (catId) => { set선택카테고리(catId); set페이지(0); };
  const 메뉴클릭 = (menu) => {
    if (menu.soldOut) { 안내('품절된 메뉴입니다'); return; }
    if (menu.categoryId === 4 || menu.categoryId === 5) {
      장바구니추가({ menuId: menu.id, qty: 1, options: [], optionPrice: 0 });
      안내('장바구니에 담겼습니다.');
      return;
    }
    setModalConfig({ isOpen: true, menu, cartItem: null });
  };
  const 옵션변경클릭 = (cartItem) => {
    const menu = menus.find(m => m.id === cartItem.menuId);
    if (menu && menu.categoryId !== 4 && menu.categoryId !== 5) setModalConfig({ isOpen: true, menu, cartItem });
  };
  const handleModalConfirm = (data) => {
    if (data.uid) {
      const targetItem = 장바구니.find(item => item.uid === data.uid);
      if (targetItem) {
        targetItem.options = data.options;
        targetItem.optionPrice = data.optionPrice;
        장바구니수정(data.uid, targetItem.qty);
      }
      setModalConfig({ isOpen: false, menu: null, cartItem: null });
      안내('옵션이 변경되었습니다.');
    } else {
      장바구니추가(data);
      setModalConfig({ isOpen: false, menu: null, cartItem: null });
      안내('장바구니에 담겼습니다.');
    }
  };

  const 총수량 = 장바구니.reduce((sum, item) => sum + item.qty, 0);
  const 총금액 = 장바구니.reduce((sum, item) => {
    const menu = menus.find(m => m.id === item.menuId);
    return sum + ((menu ? menu.price : 0) + (item.optionPrice || 0)) * item.qty;
  }, 0);

  const 카테고리1행 = categories.slice(0, 4);
  const 카테고리2행 = categories.slice(4, 8);
  const 빈카테고리 = Array(4 - 카테고리2행.length).fill(null);

  const 페이지버튼크기 = `${54 * 배율}px`;
  const 수량버튼크기 = `${36 * 배율}px`;
  const 카테고리높이 = `${44 * 배율}px`;
  const 하단바높이 = `${60 * 배율}px`;
  const 취소주문버튼너비 = `${120 * 배율}px`;

  const 카테고리빛남스타일 = (active) => active ? {
    boxShadow: 배프활성 && !고대비 ? '0 0 0 3px rgba(205,224,0,0.5), 0 0 16px 4px rgba(205,224,0,0.35)' : 'none',
  } : {};

  // TIP 바 컴포넌트 (낮은화면/일반 공통) - 배프모드 켜지면 더 크고 눈에 띄게
  const TipBar = () => (
    <div style={{
      background: 고대비 ? '#111' : '#F5F5DC',
      padding: 배프활성 ? '20px 24px' : '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 배프활성 ? '16px' : '12px',
      borderTop: `${배프활성 ? 3 : 1}px solid ${고대비 ? '#FFEB3B' : (배프활성 ? '#CDE000' : '#DDD')}`,
      flexShrink: 0,
      boxShadow: 배프활성 && !고대비 ? '0 -4px 16px rgba(205,224,0,0.25)' : 'none',
    }}>
      <img src="bef4.png" alt="배프" style={{ width: 배프활성 ? '68px' : '48px', height: 배프활성 ? '68px' : '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      <span style={{ background: '#CDE000', color: '#000', fontSize: 배프활성 ? '20px' : '16px', fontWeight: 'bold', padding: 배프활성 ? '6px 16px' : '4px 12px', borderRadius: '14px', flexShrink: 0 }}>TIP</span>
      <span style={{ fontSize: 배프활성 ? '24px' : '18px', fontWeight: '900', color: 고대비 ? '#FFEB3B' : '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        배프 추천! 실시간 인기 음료를 찾고 계신가요?
      </span>
      <span onClick={() => { set추천보기(true); 추천불러오기(); }} style={{
        fontSize: 배프활성 ? '20px' : '16px', fontWeight: 'bold', color: 배프활성 ? (고대비 ? '#FFEB3B' : '#3D8C00') : '#888',
        flexShrink: 0, cursor: 'pointer',
        padding: 배프활성 ? '10px 20px' : '0', borderRadius: '10px',
        background: 배프활성 && !고대비 ? '#FFFFF0' : 'transparent',
        border: 배프활성 ? `2px solid ${고대비 ? '#FFEB3B' : '#CDE000'}` : 'none',
      }}>추천 메뉴 보기 &gt;</span>
    </div>
  );
  return (
    <div style={{ width: '100vw', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden', boxSizing: 'border-box' }}>

      <BefOverlay bubbles={[
        {
          // 커피 버튼 위에 배치 → 아래로 향하는 꼬리로 커피 가리킴
          top: '13%', left: '2%',
          text: '카테고리를 고를 수 있어요!',
          tail: 'bottom-left',
          direction: 'row',
        },
        {
          // 메뉴 중앙 오른쪽 - bef2 이미지, 꼬리 없음
          top: '40%', right: '2%',
          textNode: (
            <>
              {'원하는 음료를 선택하고\n'}
              <span style={{ color: '#CDE000', fontWeight: 'bold' }}>주문 담기</span>
              {'를 눌러주세요!'}
            </>
          ),
          image: 'bef2.png',
          imageSize: '80px',
          direction: 'row-reverse',
        },
        {
          // 배리어프리 버튼 높이 → 위로 향하는 꼬리로 주문하기 버튼 가리킴
        bottom: '1%', right: '2%',
        text: '주문하기 버튼을 눌러 주문을\n진행해주세요!',
        tail: 'top-right',
        direction: 'row',        },
      ]} />

      {낮은화면 ? (
        <>
          <수어영역 안내텍스트={t.selectMenu[언어]} 영상="order_confirm.mp4" />
          <div style={{ flex: 1, display: 'flex', padding: '8px', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
            <div className="modal-scroll" style={{ width: `${100 * 배율}px`, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flexShrink: 0 }}>
              {categories.map(cat => {
                const active = cat.id === 선택카테고리;
                return (
                  <button key={cat.id} onClick={() => 카테고리클릭(cat.id)} style={{ padding: '8px 4px', borderRadius: '8px', border: active ? `2px solid ${primaryColor}` : '1px solid #CCC', background: active ? primaryColor : cardBg, color: active && 고대비 ? '#000' : fg, fontSize: `${14 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', wordBreak: 'keep-all' }}>
                    {getLocalizedCategoryName(cat)}
                  </button>
                );
              })}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{
                flex: 1, display: 'grid',
                gridTemplateColumns: `repeat(${글씨크기 === 'xlarge' ? 1 : 글씨크기 === 'large' ? 2 : 4}, 1fr)`,
                gridTemplateRows: 글씨크기 === 'normal' ? 'repeat(2, 1fr)' : 'none',
                gridAutoRows: 글씨크기 !== 'normal' ? (글씨크기 === 'xlarge' ? `${90 * 배율}px` : `${120 * 배율}px`) : undefined,
                gap: '6px', minHeight: 0,
                overflowY: 글씨크기 === 'normal' ? 'hidden' : 'auto',
              }}>
                {현재페이지메뉴.map(menu => (
                  <button key={menu.id} onClick={() => 메뉴클릭(menu)} style={{ background: 고대비 ? '#000000' : cardBg, border: 고대비 ? `1px solid ${primaryColor}` : '1px solid #969696', borderRadius: '18px', padding: 글씨크기 === 'xlarge' ? '6px' : '6px', display: 'flex', flexDirection: 글씨크기 === 'xlarge' ? 'row' : 'column', alignItems: 'center', gap: 글씨크기 === 'xlarge' ? '8px' : 0, cursor: menu.soldOut ? 'not-allowed' : 'pointer', opacity: menu.soldOut ? 0.4 : 1, position: 'relative', overflow: 'hidden', minWidth: 0, boxShadow: 고대비 ? 'none' : '0 4px 8px rgba(0,0,0,0.15)' }}>
                    {menu.soldOut && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${14 * 배율}px`, fontWeight: 'bold', borderRadius: '18px', zIndex: 1 }}>{t.soldOut[언어]}</div>}
                    <div style={{
                      width: 글씨크기 === 'xlarge' ? `${60 * 배율}px` : '100%',
                      flex: 글씨크기 === 'xlarge' ? '0 0 auto' : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 0, marginBottom: 글씨크기 === 'xlarge' ? 0 : '6px',
                    }}>
                      <img src={menu.image} alt={menu.name} style={{ maxHeight: '100%', maxWidth: '90%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 글씨크기 === 'xlarge' ? 1 : 'none', minWidth: 0, textAlign: 글씨크기 === 'xlarge' ? 'left' : 'center' }}>
                      <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg, wordBreak: 'keep-all', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>{getLocalizedMenuName(menu)}</div>
                      <div style={{ fontSize: `${14 * 배율}px`, fontWeight: 'bold', color: 고대비 ? primaryColor : '#666' }}>₩ {formatPrice(menu.price)}</div>
                    </div>
                  </button>
                ))}
                {글씨크기 === 'normal' && 빈슬롯.map((_, idx) => <div key={`empty-${idx}`} style={{ background: 'transparent', borderRadius: '18px' }} />)}
              </div>
              {총페이지 > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '6px 0 0 0', flexShrink: 0 }}>
                  <button onClick={() => set페이지(Math.max(0, 페이지 - 1))} disabled={페이지 === 0} style={{ padding: '6px 16px', fontSize: `${14 * 배율}px`, borderRadius: '20px', background: grayColor, border: 'none', fontWeight: 'bold', cursor: 'pointer', color: 페이지 === 0 ? '#888' : '#000' }}>{t.prev[언어]}</button>
                  <span style={{ fontSize: `${14 * 배율}px`, fontWeight: 'bold', color: fg }}>{페이지 + 1} / {총페이지}</span>
                  <button onClick={() => set페이지(Math.min(총페이지 - 1, 페이지 + 1))} disabled={페이지 >= 총페이지 - 1} style={{ padding: '6px 16px', fontSize: `${14 * 배율}px`, borderRadius: '20px', background: grayColor, border: 'none', fontWeight: 'bold', cursor: 'pointer', color: 페이지 >= 총페이지 - 1 ? '#888' : '#000' }}>{t.next[언어]}</button>
                </div>
              )}
            </div>
          </div>
          {배프활성 && <TipBar />}
          <div style={{ background: 고대비 ? '#000000' : brownColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', flexShrink: 0, height: 하단바높이, border: 고대비 ? '2px solid #FFEB3B' : 'none' }}>
            <button onClick={() => setShowCartModal(true)} style={{ background: 고대비 ? '#FFEB3B' : primaryColor, color: '#000', border: 'none', padding: `8px ${16 * 배율}px`, borderRadius: '8px', fontSize: `${16 * 배율}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.orderHistory[언어]}</button>
            <div style={{ color: 고대비 ? '#FFEB3B' : '#FFF', fontSize: `${16 * 배율}px`, fontWeight: 'bold' }}>{t.total[언어]} <span style={{ marginLeft: '8px', fontSize: `${18 * 배율}px` }}>₩ {formatPrice(총금액)}</span></div>
            <button onClick={() => { if (장바구니.length === 0) return 안내('장바구니가 비어 있습니다.'); set화면('주문확인'); }} style={{ background: 고대비 ? '#FFEB3B' : primaryColor, color: '#000', border: 'none', padding: `8px ${16 * 배율}px`, borderRadius: '8px', fontSize: `${16 * 배율}px`, fontWeight: 'bold', cursor: 'pointer' }}>{t.order[언어]}</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', background: bg }}>
            <div style={{ width: '100%', maxWidth: '700px' }}><ProgressBar currentStep={1} 고대비={고대비} 배율={배율} /></div>
          </div>
          <수어영역 안내텍스트={t.selectMenu[언어]} 영상="order_confirm.mp4" />
          {추천보기 ? (
            <RecommendPanel
              로딩={추천로딩} 인기목록={인기추천목록} 날씨목록={날씨추천목록} 날씨정보={날씨정보} 에러={추천에러}
              onBack={() => set추천보기(false)}
              onRefresh={추천불러오기}
              onAdd={메뉴클릭}
              getLocalizedMenuName={getLocalizedMenuName}
              고대비={고대비} fg={fg} cardBg={cardBg} primaryColor={primaryColor} 배율={배율}
            />
          ) : (
          <>
          <div style={{ padding: '10px 18px 6px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {카테고리1행.map(cat => {
                const active = cat.id === 선택카테고리;
                return <button key={cat.id} onClick={() => 카테고리클릭(cat.id)} style={{ flex: 1, height: 카테고리높이, padding: '6px', borderRadius: '10px', border: active ? `3px solid ${primaryColor}` : `1px solid ${grayColor}`, background: active ? primaryColor : cardBg, color: active && 고대비 ? '#000' : fg, fontSize: `${20 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...카테고리빛남스타일(active) }}>{getLocalizedCategoryName(cat)}</button>;
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {카테고리2행.map(cat => {
                const active = cat.id === 선택카테고리;
                return <button key={cat.id} onClick={() => 카테고리클릭(cat.id)} style={{ flex: 1, height: 카테고리높이, padding: '6px', borderRadius: '10px', border: active ? `3px solid ${primaryColor}` : `1px solid ${grayColor}`, background: active ? primaryColor : cardBg, color: active && 고대비 ? '#000' : fg, fontSize: `${20 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...카테고리빛남스타일(active) }}>{getLocalizedCategoryName(cat)}</button>;
              })}
              {빈카테고리.map((_, i) => <div key={`empty-cat-${i}`} style={{ flex: 1, height: 카테고리높이, borderRadius: '10px', border: `1px solid ${grayColor}`, background: cardBg }} />)}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 18px', minHeight: 0, overflow: 'hidden' }}>
            <div style={{
              flex: 1, display: 'grid',
              gridTemplateColumns: `repeat(${글씨크기 === 'xlarge' ? 1 : 글씨크기 === 'large' ? 2 : 4}, 1fr)`,
              gridTemplateRows: 글씨크기 === 'normal' ? 'repeat(2, 1fr)' : 'none',
              gridAutoRows: 글씨크기 !== 'normal' ? (글씨크기 === 'xlarge' ? `${110 * 배율}px` : `${150 * 배율}px`) : undefined,
              gap: '12px', minHeight: 0,
              overflowY: 글씨크기 === 'normal' ? 'hidden' : 'auto',
            }}>
              {현재페이지메뉴.map(menu => (
                <button key={menu.id} onClick={() => 메뉴클릭(menu)} style={{ background: cardBg, border: 고대비 ? `1px solid ${primaryColor}` : '1px solid #969696', borderRadius: '18px', padding: 글씨크기 === 'xlarge' ? '8px' : '10px', display: 'flex', flexDirection: 글씨크기 === 'xlarge' ? 'row' : 'column', alignItems: 'center', gap: 글씨크기 === 'xlarge' ? '10px' : 0, cursor: menu.soldOut ? 'not-allowed' : 'pointer', opacity: menu.soldOut ? 0.4 : 1, position: 'relative', overflow: 'hidden', minHeight: 0, boxShadow: 고대비 ? 'none' : '0 4px 8px rgba(0,0,0,0.15)' }}>
                  {menu.soldOut && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${26 * 배율}px`, fontWeight: 'bold', borderRadius: '18px', zIndex: 1 }}>{t.soldOut[언어]}</div>}
                  <div style={{
                    width: 글씨크기 === 'xlarge' ? `${70 * 배율}px` : '100%',
                    height: 글씨크기 === 'xlarge' ? `${70 * 배율}px` : 글씨크기 === 'large' ? `${90 * 배율}px` : `${80 * 배율}px`,
                    flex: 글씨크기 === 'xlarge' ? '0 0 auto' : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 글씨크기 === 'xlarge' ? 0 : '8px',
                    minHeight: 0,
                  }}>
                    <img src={menu.image} alt={menu.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 글씨크기 === 'xlarge' ? 1 : 'none', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 글씨크기 === 'xlarge' ? 'flex-start' : 'center', textAlign: 글씨크기 === 'xlarge' ? 'left' : 'center' }}>
                    <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg, wordBreak: 'keep-all', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>{getLocalizedMenuName(menu)}</div>
                    <div style={{ fontSize: `${14 * 배율}px`, fontWeight: 'bold', color: 고대비 ? primaryColor : '#777' }}>₩ {formatPrice(menu.price)}</div>
                  </div>
                </button>
              ))}
              {글씨크기 === 'normal' && 빈슬롯.map((_, idx) => <div key={`empty-${idx}`} style={{ background: cardBg, border: '1px solid #DDD', borderRadius: '18px', minHeight: 0 }} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', padding: '12px 0', flexShrink: 0, background: bg }}>
              <button onClick={() => set페이지(Math.max(0, 페이지 - 1))} disabled={페이지 === 0} style={{ width: 페이지버튼크기, height: 페이지버튼크기, borderRadius: '50%', background: grayColor, border: 'none', color: 페이지 === 0 ? '#CCC' : '#000', fontSize: `${32 * 배율}px`, fontWeight: 'bold', cursor: 페이지 === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>&lt;</button>
              {총페이지 > 1 && <div style={{ fontSize: `${20 * 배율}px`, fontWeight: 'bold', color: brownColor, minWidth: '60px', textAlign: 'center' }}>{페이지 + 1} / {총페이지}</div>}
              <button onClick={() => set페이지(Math.min(총페이지 - 1, 페이지 + 1))} disabled={페이지 >= 총페이지 - 1} style={{ width: 페이지버튼크기, height: 페이지버튼크기, borderRadius: '50%', background: grayColor, border: 'none', color: 페이지 >= 총페이지 - 1 ? '#CCC' : '#000', fontSize: `${32 * 배율}px`, fontWeight: 'bold', cursor: 페이지 >= 총페이지 - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>&gt;</button>
            </div>
          </div>
          </>
          )}
          <div style={{ flexShrink: 0 }}>
            {!추천보기 && 배프활성 && <TipBar />}
            <div style={{ background: 고대비 ? '#000' : brownColor, color: 고대비 ? primaryColor : '#FFF', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', fontSize: `${24 * 배율}px`, fontWeight: 'bold' }}>
              <div>{t.totalQty[언어]} <span style={{ marginLeft: '16px' }}>{총수량}</span></div>
              <div>{t.total[언어]} <span style={{ marginLeft: '16px' }}>₩ {formatPrice(총금액)}</span></div>
            </div>
            <div style={{ display: 'flex', background: cardBg, padding: '10px 18px', gap: '10px', alignItems: 'stretch', minHeight: '160px', maxHeight: '160px', overflow: 'hidden' }}>
              <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {장바구니.map(item => {
                  const menu = menus.find(m => m.id === item.menuId);
                  if (!menu) return null;
                  return (
                    <div key={item.uid} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: grayColor, padding: '8px 10px', borderRadius: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: `${16 * 배율}px`, color: fg, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedMenuName(menu)}</div>
                        <div style={{ fontSize: `${12 * 배율}px`, color: '#666', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.options?.length > 0 ? item.options.join(', ') : ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => 장바구니수정(item.uid, item.qty - 1)} style={{ width: 수량버튼크기, height: 수량버튼크기, borderRadius: '50%', background: '#000', border: 'none', color: '#FFF', fontSize: `${18 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                        <span style={{ minWidth: `${24 * 배율}px`, textAlign: 'center', fontSize: `${18 * 배율}px`, fontWeight: 'bold', color: fg }}>{item.qty}</span>
                        <button onClick={() => 장바구니수정(item.uid, item.qty + 1)} style={{ width: 수량버튼크기, height: 수량버튼크기, borderRadius: '50%', background: '#000', border: 'none', color: '#FFF', fontSize: `${18 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                      </div>
                      {menu.categoryId !== 4 && menu.categoryId !== 5 && (
                        <button onClick={() => 옵션변경클릭(item)} style={{ padding: `6px ${10 * 배율}px`, fontSize: `${14 * 배율}px`, borderRadius: '8px', background: brownColor, color: 고대비 ? '#000' : '#FFF', border: 'none', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>{t.optionChange[언어]}</button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ width: 취소주문버튼너비, display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                {장바구니.length > 0 && <button onClick={() => { 장바구니.forEach(item => 장바구니제거(item.uid)); 안내('전체 취소'); }} style={{ padding: '8px 0', fontSize: `${16 * 배율}px`, borderRadius: '8px', background: grayColor, color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}>{t.cancel[언어]}</button>}
                <button onClick={() => { if (장바구니.length === 0) { 안내('장바구니가 비어 있습니다.'); return; } set화면('주문확인'); }} style={{ flex: 1, borderRadius: '8px', background: primaryColor, color: '#000', fontSize: `${20 * 배율}px`, fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 배프활성 && !고대비 ? '0 0 0 3px rgba(205,224,0,0.5), 0 0 16px 4px rgba(205,224,0,0.35)' : 'none' }}>{t.order[언어]}</button>
              </div>
            </div>
            <div style={{ background: cardBg, padding: '10px 18px', borderTop: `1px solid ${grayColor}`, height: `${70 * 배율}px` }} />
          </div>
        </>
      )}

      {modalConfig.isOpen && (
        <OptionModal key={`${modalConfig.menu?.id}-${modalConfig.cartItem?.uid || 'new'}`} menu={modalConfig.menu} initialCartItem={modalConfig.cartItem} 고대비={고대비}
          onClose={() => setModalConfig({ isOpen: false, menu: null, cartItem: null })}
          onAddToCart={handleModalConfirm} />
      )}

      {showCartModal && 낮은화면 && (
        <div onClick={() => setShowCartModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '5vh', alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 고대비 ? '#000000' : cardBg, width: '92%', maxWidth: '600px', maxHeight: '40vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: 고대비 ? '2px solid #FFEB3B' : 'none' }}>
            <div style={{ background: 고대비 ? '#FFEB3B' : brownColor, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#000000', margin: 0, fontSize: `${22 * 배율}px` }}>{t.cartTitle[언어]}</h3>
              <button onClick={() => setShowCartModal(false)} style={{ background: 'transparent', border: 'none', color: '#000000', fontSize: `${28 * 배율}px`, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 고대비 ? '#000000' : cardBg }}>
              {장바구니.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', fontSize: `${20 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#666', fontWeight: 'bold' }}>{t.cartEmpty[언어]}</div>
              ) : (
                장바구니.map(item => {
                  const menu = menus.find(m => m.id === item.menuId);
                  if (!menu) return null;
                  return (
                    <div key={item.uid} style={{ display: 'flex', alignItems: 'center', background: 고대비 ? '#000000' : '#F5F5F5', padding: '14px', borderRadius: '12px', border: 고대비 ? '1px solid #FFEB3B' : '1px solid #DDD' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: `${18 * 배율}px`, fontWeight: 'bold', color: 고대비 ? '#FFEB3B' : '#000' }}>{getLocalizedMenuName(menu)}</div>
                        <div style={{ fontSize: `${14 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#666', marginTop: '4px' }}>{item.options?.join(', ')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: `${18 * 배율}px`, fontWeight: 'bold', color: 고대비 ? '#FFEB3B' : '#000' }}>{item.qty}개</span>
                        <button onClick={() => 장바구니제거(item.uid)} style={{ background: 고대비 ? '#FFEB3B' : '#FF4444', color: '#000000', border: 'none', padding: `${8 * 배율}px ${16 * 배율}px`, fontSize: `${16 * 배율}px`, fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{t.delete[언어]}</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =================== 배프 추천 메뉴 패널 (그리드 대체 뷰) ===================
function RecCard({ menu, onAdd, getLocalizedMenuName, 고대비, fg, cardBg, primaryColor, 배율, badge, badgeColor }) {
  return (
    <button onClick={() => onAdd(menu)} style={{
      width: `${170 * 배율}px`, background: cardBg, border: 고대비 ? `1px solid ${primaryColor}` : '1px solid #E5E5E5',
      borderRadius: '16px', padding: '10px', cursor: 'pointer', textAlign: 'left', position: 'relative',
      boxShadow: 고대비 ? 'none' : '0 4px 10px rgba(0,0,0,0.1)',
    }}>
      <span style={{ position: 'absolute', top: '10px', left: '10px', background: badgeColor, color: '#FFF', fontSize: `${11 * 배율}px`, fontWeight: 'bold', padding: '3px 9px', borderRadius: '10px', zIndex: 1 }}>{badge}</span>
      {menu.categoryId <= 3 && (
        <span style={{ position: 'absolute', top: '10px', right: '10px', background: menu.categoryId === 3 ? '#2E7CD6' : '#F5F5F5', color: menu.categoryId === 3 ? '#FFF' : '#666', fontSize: `${10 * 배율}px`, fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', border: menu.categoryId === 3 ? 'none' : '1px solid #DDD', zIndex: 1 }}>
          {menu.categoryId === 3 ? '❄ ICE' : 'HOT/ICE'}
        </span>
      )}
      <div style={{ width: '100%', aspectRatio: '3 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', marginTop: '16px' }}>
        <img src={menu.image} alt={getLocalizedMenuName(menu)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
      </div>
      <div style={{ fontSize: `${15 * 배율}px`, fontWeight: 'bold', color: fg, marginBottom: '2px' }}>{getLocalizedMenuName(menu)}</div>
      <div style={{ fontSize: `${14 * 배율}px`, fontWeight: 'bold', color: 고대비 ? primaryColor : '#777', marginBottom: '6px' }}>₩ {menu.price?.toLocaleString()}</div>
      <div style={{ fontSize: `${11 * 배율}px`, color: '#3D8C00', background: '#EAF6D8', borderRadius: '6px', padding: '4px 8px', lineHeight: 1.3 }}>{menu.reason}</div>
    </button>
  );
}

function RecommendPanel({ 로딩, 인기목록, 날씨목록, 날씨정보, 에러, onBack, onRefresh, onAdd, getLocalizedMenuName, 고대비, fg, cardBg, primaryColor, 배율 }) {
  const 전체비어있음 = !로딩 && (에러 || (인기목록.length === 0 && 날씨목록.length === 0));
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ margin: 'auto', padding: '12px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0 12px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', fontSize: `${26 * 배율}px`, fontWeight: 'bold', color: fg, cursor: 'pointer', padding: '4px 8px' }}>‹</button>
          <div style={{ flex: 1, textAlign: 'center', marginRight: `${34 * 배율}px` }}>
            <div style={{ fontSize: `${22 * 배율}px`, fontWeight: 'bold', color: 고대비 ? primaryColor : '#3D8C00' }}>🍀 배프 추천 메뉴</div>
            <div style={{ fontSize: `${14 * 배율}px`, color: 고대비 ? primaryColor : '#888', marginTop: '4px' }}>고객님께 인기 있는 메뉴를 추천해드려요!</div>
          </div>
        </div>

        {로딩 && (
          <div style={{ padding: '80px 0', textAlign: 'center', fontSize: `${20 * 배율}px`, color: '#888' }}>취향에 맞는 메뉴를 고르고 있어요...</div>
        )}
        {전체비어있음 && (
          <div style={{ padding: '80px 0', textAlign: 'center', fontSize: `${20 * 배율}px`, color: '#888' }}>지금은 추천할 메뉴가 없어요.</div>
        )}

        {!로딩 && 인기목록.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg, marginBottom: '10px' }}>🔥 지금 인기 있는 메뉴</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {인기목록.map(menu => (
                <RecCard key={menu.id} menu={menu} onAdd={onAdd} getLocalizedMenuName={getLocalizedMenuName} 고대비={고대비} fg={fg} cardBg={cardBg} primaryColor={primaryColor} 배율={배율} badge="BEST" badgeColor="#3D8C00" />
              ))}
            </div>
          </div>
        )}

        {!로딩 && 날씨목록.length > 0 && (
          <div>
            <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg, marginBottom: '10px' }}>
              🌤️ {날씨정보?.label ? `${날씨정보.label} 추천` : '오늘의 날씨 추천'}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {날씨목록.map(menu => (
                <RecCard key={menu.id} menu={menu} onAdd={onAdd} getLocalizedMenuName={getLocalizedMenuName} 고대비={고대비} fg={fg} cardBg={cardBg} primaryColor={primaryColor} 배율={배율} badge="날씨" badgeColor="#2E7CD6" />
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '14px 0 4px' }}>
          <button onClick={onRefresh} style={{ background: 'transparent', border: `1px solid ${고대비 ? primaryColor : '#CCC'}`, borderRadius: '20px', padding: `${8 * 배율}px ${20 * 배율}px`, fontSize: `${14 * 배율}px`, fontWeight: 'bold', color: fg, cursor: 'pointer' }}>
            ↺ 다른 추천 메뉴 보기
          </button>
        </div>
      </div>
    </div>
  );
}