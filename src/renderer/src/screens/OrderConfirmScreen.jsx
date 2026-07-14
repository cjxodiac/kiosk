import React, { useState } from 'react';
import { useKiosk } from '../context/KioskContext';
import { ProgressBar } from '../components/ProgressBar';
import { formatPrice } from '../data';
import { OptionModal } from './OptionModal';
import { 수어영역 } from '../components/Signlanguage';
import { BefOverlay } from '../components/BefOverlay';

export function OrderConfirmScreen() {
  const { 안내, 접근성, set화면, 장바구니, 장바구니추가, 장바구니수정, 장바구니제거, menus,
    언어, getLocalizedMenuName, 배프활성, 배프안내닫힘 } = useKiosk();
  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;
  const 배율맵 = { normal: 1.3, large: 1.8, xlarge: 2.3 };
  const 낮은화면배율맵 = { normal: 1.3, large: 1.6, xlarge: 1.8 };
  const 배율 = 낮은화면 ? 낮은화면배율맵[접근성?.글씨크기 || 'normal'] : 배율맵[접근성?.글씨크기 || 'normal'];

  const 이미지크기 = 64;
  const 버튼크기 = 배율 > 2.0 ? Math.min(44 * 배율, 80) : 44 * 배율;
  const 버튼폰트 = 배율 > 2.0 ? Math.min(26 * 배율, 44) : 26 * 배율;
  const 옵션버튼폰트 = 배율 > 2.0 ? Math.min(18 * 배율, 28) : 18 * 배율;
  const X버튼W = 배율 > 2.0 ? Math.min(41 * 배율, 70) : 41 * 배율;
  const X버튼H = 배율 > 2.0 ? Math.min(48 * 배율, 80) : 48 * 배율;

  const t = {
    confirmOrder: { ko: '주문을 확인해주세요.', en: 'Please confirm your order.', ja: 'ご注文をご確認ください。', zh: '请确认您的订单。' },
    prevStep:     { ko: '이전 단계',  en: 'Previous',   ja: '前へ',          zh: '上一步' },
    menu:         { ko: '메뉴',      en: 'Menu',       ja: 'メニュー',      zh: '菜单' },
    noOption:     { ko: '옵션 없음', en: 'No options', ja: 'オプションなし', zh: '无选项' },
    optionChange: { ko: '옵션변경',  en: 'Options',    ja: 'オプション',    zh: '选项' },
    totalQty:     { ko: '총 수량',   en: 'Qty',        ja: '数量',          zh: '数量' },
    total:        { ko: '총 금액',   en: 'Total',      ja: '合計',          zh: '总계' },
    price:        { ko: '가격',      en: 'Price',      ja: '価格',          zh: '价格' },
    checkout:     { ko: '결제하기',  en: 'Checkout',   ja: 'お支払い',      zh: '结算' },
  };

  const [modalConfig, setModalConfig] = useState({ isOpen: false, menu: null, cartItem: null });

  const bg = 고대비 ? '#000000' : '#E6E6E6';
  const fg = 고대비 ? '#FFEB3B' : '#000000';
  const brownColor = 고대비 ? '#FFEB3B' : '#3E2723';
  const yellowColor = 고대비 ? '#FFEB3B' : '#CDE000';
  const grayBtnColor = 고대비 ? '#FFEB3B' : '#D0D0D0';
  const btnTextColor = 고대비 ? '#000000' : '#FFFFFF';
  const whiteBg = 고대비 ? '#000000' : '#FFFFFF';

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

  const CartRow = ({ item, isLast }) => {
    const menu = menus.find(m => m.id === item.menuId);
    if (!menu) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: isLast ? 'none' : `2px solid ${고대비 ? '#444' : '#D0D0D0'}`, gap: '10px' }}>
        <div style={{ width: `${이미지크기}px`, height: `${이미지크기}px`, background: whiteBg, borderRadius: '10px', border: `1px solid ${고대비 ? '#FFEB3B' : '#DDD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={menu.image} alt={menu.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: `${22 * 배율}px`, fontWeight: 'bold', color: fg, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'keep-all' }}>
            {getLocalizedMenuName(menu)}
          </div>
          <div style={{ fontSize: `${14 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
            {item.options?.length > 0 ? item.options.join(', ') : t.noOption[언어]}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button onClick={() => 장바구니수정(item.uid, item.qty - 1)} style={{ width: `${버튼크기}px`, height: `${버튼크기}px`, borderRadius: '50%', border: 'none', background: brownColor, color: btnTextColor, fontSize: `${버튼폰트}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
          <span style={{ fontSize: `${버튼폰트}px`, fontWeight: 'bold', minWidth: '20px', textAlign: 'center', color: fg }}>{item.qty}</span>
          <button onClick={() => 장바구니수정(item.uid, item.qty + 1)} style={{ width: `${버튼크기}px`, height: `${버튼크기}px`, borderRadius: '50%', border: 'none', background: brownColor, color: btnTextColor, fontSize: `${버튼폰트}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
          {menu.categoryId !== 4 && menu.categoryId !== 5 && (
            <button onClick={() => 옵션변경클릭(item)} style={{ background: brownColor, color: btnTextColor, border: 'none', borderRadius: '8px', padding: `8px 12px`, fontSize: `${옵션버튼폰트}px`, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>{t.optionChange[언어]}</button>
          )}
          <button onClick={() => 장바구니제거(item.uid)} style={{ width: `${X버튼W}px`, height: `${X버튼H}px`, background: grayBtnColor, color: '#000000', border: 'none', borderRadius: '8px', fontSize: `${옵션버튼폰트}px`, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100vw', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden', position: 'relative' }}>

      {/* 배프활성 오버레이 - 어두운 배경 + 절대위치 말풍선(하단만) */}
      {!낮은화면 && (
        <BefOverlay bubbles={[
          {
            bottom: '17%', right: '3%',
            textNode: (
              <>
                {'주문이 맞다면\n'}
                <span style={{ color: '#CDE000', fontWeight: 'bold' }}>결제하기</span>
                {' 버튼을 눌러주세요.'}
              </>
            ),
            image: 'bef8.png',
            imageSize: '55px',
            direction: 'row-reverse',
            tail: 'bottom-right',
          },
        ]} />
      )}

      {낮은화면 ? (
        <>
          <수어영역 안내텍스트={t.confirmOrder[언어]} 영상="order_confirm.mp4" />
          <div style={{ padding: '16px 0', textAlign: 'center', flexShrink: 0, position: 'relative' }}>
            <button onClick={() => set화면('메뉴')}
              style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: fg, fontSize: `${16 * 배율}px`, fontWeight: 'bold',
              }}>
              ← {t.prevStep[언어]}
            </button>
            <h2 style={{ fontSize: `${28 * 배율}px`, fontWeight: 'bold', margin: 0, color: fg }}>{t.confirmOrder[언어]}</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
            {장바구니.map((item, index) => (
              <CartRow key={item.uid} item={item} isLast={index === 장바구니.length - 1} />
            ))}
          </div>
          <div style={{ background: brownColor, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: btnTextColor }}>
              <span style={{ fontSize: `${18 * 배율}px` }}>{t.totalQty[언어]} <b>{총수량}</b></span>
              <span style={{ fontSize: `${18 * 배율}px` }}>{t.total[언어]} <b>₩ {formatPrice(총금액)}</b></span>
            </div>
            <button onClick={() => { if (장바구니.length === 0) return 안내('장바구니가 비어 있습니다.'); set화면('결제'); }}
              style={{ background: 고대비 ? '#000000' : yellowColor, color: 고대비 ? '#FFEB3B' : '#000000', border: 고대비 ? '2px solid #FFEB3B' : 'none', borderRadius: '14px', padding: `${12 * 배율}px ${24 * 배율}px`, fontSize: `${22 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>
              {t.checkout[언어]}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: '30px 0', background: bg, flexShrink: 0 }}>
            <ProgressBar currentStep={2} 고대비={고대비} 배율={배율} />
          </div>
          <수어영역 안내텍스트={t.confirmOrder[언어]} 영상="order_confirm.mp4" />
          <div style={{ background: 고대비 ? '#000000' : brownColor, height: `${50 * 배율}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 고대비 ? '1px solid #FFEB3B' : 'none', position: 'relative' }}>
            <button onClick={() => set화면('메뉴')}
              style={{
                position: 'absolute', left: '3%', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 고대비 ? '#FFEB3B' : btnTextColor, fontSize: `${20 * 배율}px`, fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
              }}>
              ← {t.prevStep[언어]}
            </button>
            <span style={{ color: 고대비 ? '#FFEB3B' : btnTextColor, fontSize: `${24 * 배율}px`, fontWeight: 'bold' }}>{t.menu[언어]}</span>
          </div>
          <div style={{ padding: '24px 0 16px', textAlign: 'center', background: bg, flexShrink: 0 }}>
            <h2 style={{ fontSize: `${42 * 배율}px`, fontWeight: 'bold', margin: 0, color: fg }}>{t.confirmOrder[언어]}</h2>
          </div>
          {배프활성 && !배프안내닫힘 && (
            <div style={{ position: 'relative', zIndex: 501, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '14px', padding: '4px 5% 20px', flexShrink: 0 }}>
              <div style={{ background: '#FFFFF0', borderRadius: '20px', padding: `${22 * 배율}px ${28 * 배율}px`, maxWidth: '80%', boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: `${26 * 배율}px`, color: '#444', lineHeight: 1.5, fontWeight: 'bold' }}>
                  {'주문 내역이 맞는지 확인해주세요.\n수정이 필요 없으면 아래 '}
                  <span style={{ color: '#CDE000', fontWeight: 'bold' }}>결제하기</span>
                  {'로 진행할 수 있어요!'}
                </div>
              </div>
              <img src="bef8.png" alt="배프" style={{ width: `${65 * 배율 * 1.4}px`, height: 'auto', flexShrink: 0 }} />
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '0 5%' }}>
            {장바구니.map((item, index) => (
              <CartRow key={item.uid} item={item} isLast={index === 장바구니.length - 1} />
            ))}
          </div>
          <div style={{ background: 고대비 ? '#000000' : brownColor, color: 고대비 ? '#FFEB3B' : btnTextColor, padding: '16px 5%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '40px', flexShrink: 0, border: 고대비 ? '1px solid #FFEB3B' : 'none' }}>
            <div style={{ fontSize: `${26 * 배율}px` }}>{t.totalQty[언어]} <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: `${30 * 배율}px` }}>{총수량}</span></div>
            <div style={{ fontSize: `${26 * 배율}px` }}>{t.price[언어]} <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: `${30 * 배율}px` }}>₩ {formatPrice(총금액)}</span></div>
          </div>
          <div style={{ background: whiteBg, padding: '20px 5%', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            <button onClick={() => { if (장바구니.length === 0) return 안내('장바구니가 비어 있습니다.'); set화면('결제'); }}
              style={{
                width: `${240 * 배율}px`, height: `${90 * 배율}px`, background: yellowColor, border: 'none', borderRadius: '8px',
                fontSize: `${32 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', color: '#000',
                boxShadow: 배프활성 && !고대비 ? '0 0 0 3px rgba(205,224,0,0.5), 0 0 16px 4px rgba(205,224,0,0.35)' : 'none',
              }}>
              {t.checkout[언어]}
            </button>
          </div>
        </>
      )}

      {modalConfig.isOpen && (
        <OptionModal key={`${modalConfig.menu?.id}-${modalConfig.cartItem?.uid || 'new'}`} menu={modalConfig.menu} initialCartItem={modalConfig.cartItem} 고대비={고대비}
          onClose={() => setModalConfig({ isOpen: false, menu: null, cartItem: null })}
          onAddToCart={handleModalConfirm} />
      )}
    </div>
  );
}