import React, { useState, useEffect } from 'react';
import { useKiosk } from '../context/KioskContext';
import { 수어영역 } from '../components/Signlanguage';

export function CompleteScreen() {
  const { 처음으로, 접근성, 장바구니, 장바구니제거, 언어, 주문결과 } = useKiosk();
  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;

  const 배율맵 = { normal: 1.3, large: 1.8, xlarge: 2.3 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'];
  const 낮은배율맵 = { normal: 1.0, large: 1.2, xlarge: 1.4 };
  const lr = 낮은배율맵[접근성?.글씨크기 || 'normal'] || 1.0;

  const t = {
    complete:  { ko: '결제가 완료되었어요!',      en: 'Payment Complete!',        ja: 'お支払い完了！',           zh: '支付成功！' },
    receipt:   { ko: '영수증을 출력하시겠습니까?', en: 'Print receipt?',           ja: 'レシートを印刷しますか？', zh: '是否打印收据？' },
    yes:       { ko: '예',                        en: 'Yes',                      ja: 'はい',                     zh: '是' },
    no:        { ko: '아니오',                    en: 'No',                       ja: 'いいえ',                   zh: '否' },
    orderNum:  { ko: '주문번호',                  en: 'Order No.',                ja: '注文番号',                 zh: '订单号' },
    approvalNum: { ko: '승인번호',               en: 'Approval No.',             ja: '承認番号',                 zh: '批准号' },
    thankYou:  { ko: '주문이 완료되었습니다.',     en: 'Order complete.',          ja: 'ご注文完了。',             zh: '订单完成。' },
    receiptSign: {
      ko: '영수증을 출력하시겠습니까? 출력하시려면 예 버튼을 눌러주세요.',
      en: 'Print receipt? Press Yes to print.',
      ja: 'レシートを印刷しますか？印刷する場合ははいを押してください。',
      zh: '是否打印收据？请按是进行打印。',
    },
  };

  // 단계: 'receipt' → 예/아니오 선택 / 'done' → 주문번호 화면
  const [단계, set단계] = useState('receipt');
  const orderNumber = 주문결과?.orderNumber || Math.floor(Math.random() * 99) + 1;
  const approvalNumber = 주문결과?.payment?.approvalNumber || '';

  const bg = 고대비 ? '#000000' : '#E6E6E6';
  const fg = 고대비 ? '#FFEB3B' : '#000000';
  const yellowColor = 고대비 ? '#FFEB3B' : '#CDE000';
  const whiteBg = 고대비 ? '#111' : '#FFFFFF';

  const handleGoHome = () => {
    if (Array.isArray(장바구니)) {
      장바구니.forEach(item => { if (item?.uid) 장바구니제거(item.uid); });
    }
    처음으로();
  };

  const handleSelect = () => {
    set단계('done');
  };

  // done 단계에서 10초 후 자동 홈
  useEffect(() => {
    if (단계 === 'receipt') {
      const timer = setTimeout(() => set단계('done'), 8000);
      return () => clearTimeout(timer);
    }
    if (단계 === 'done') {
      const timer = setTimeout(() => handleGoHome(), 8000);
      return () => clearTimeout(timer);
    }
  }, [단계]);

  return (
    <div style={{ width: '100vw', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden' }}>

      {단계 === 'receipt' ? (
        <>
          {/* 1단계: 결제 완료 + 영수증 출력 여부 */}
          <수어영역 안내텍스트={t.receiptSign[언어]} 영상="sign_receipt.mp4" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${14 * 배율}px`, padding: '20px' }}>
            <img src="bef6.png" alt="배프" style={{ width: 낮은화면 ? '90px' : `${120 * 배율}px`, height: 'auto' }} />
            <h2 style={{ fontSize: 낮은화면 ? `${26 * lr}px` : `${34 * 배율}px`, fontWeight: 'bold', color: fg, margin: 0, textAlign: 'center' }}>
              {t.complete[언어]}
            </h2>
            <div style={{ fontSize: `${44 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#3D8C00' }}>✅</div>
            <p style={{ fontSize: 낮은화면 ? `${16 * lr}px` : `${18 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#666', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
              {언어 === 'ko' ? <>이용해주셔서 감사합니다.<br />맛있게 즐기세요!</> : t.thankYou[언어]}
            </p>
            <p style={{ fontSize: 낮은화면 ? `${20 * lr}px` : `${24 * 배율}px`, fontWeight: 'bold', color: fg, margin: `${10 * 배율}px 0 0`, textAlign: 'center' }}>
              {t.receipt[언어]}
            </p>
            <div style={{ display: 'flex', gap: 낮은화면 ? `${16 * lr}px` : `${16 * 배율}px`, width: '100%', maxWidth: '640px', justifyContent: 'center' }}>
              <button
                onClick={handleSelect}
                style={{ flex: 1, maxWidth: 낮은화면 ? `${220 * lr}px` : `${300 * 배율}px`, height: 낮은화면 ? `${70 * lr}px` : `${80 * 배율}px`, fontSize: 낮은화면 ? `${20 * lr}px` : `${24 * 배율}px`, fontWeight: 'bold', background: yellowColor, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                🖨️ {언어 === 'ko' ? '예, 출력할게요' : t.yes[언어]}
              </button>
              <button
                onClick={handleSelect}
                style={{ flex: 1, maxWidth: 낮은화면 ? `${220 * lr}px` : `${300 * 배율}px`, height: 낮은화면 ? `${70 * lr}px` : `${80 * 배율}px`, fontSize: 낮은화면 ? `${20 * lr}px` : `${24 * 배율}px`, fontWeight: 'bold', background: 고대비 ? '#333' : '#FFFFFF', color: fg, border: `2px solid ${고대비 ? '#FFEB3B' : '#CCC'}`, borderRadius: '25px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📄 {언어 === 'ko' ? '아니요, 괜찮아요' : t.no[언어]}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 2단계: 주문번호 화면 */}
          <수어영역 안내텍스트={t.thankYou[언어]} 영상="thank_you.mp4" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${20 * 배율}px`, padding: '20px' }}>

            {/* 체크 아이콘 */}
            <div style={{ fontSize: `${80 * 배율}px` }}>✅</div>

            <h2 style={{ fontSize: 낮은화면 ? `${28 * lr}px` : `${36 * 배율}px`, fontWeight: 'bold', margin: 0, color: fg, textAlign: 'center' }}>
              {t.thankYou[언어]}
            </h2>

            {/* 주문번호 카드 */}
            <div style={{ background: whiteBg, borderRadius: '16px', padding: `${24 * 배율}px ${40 * 배율}px`, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: `${240 * 배율}px` }}>
              <div style={{ fontSize: `${16 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#888', marginBottom: '8px' }}>{t.orderNum[언어]}</div>
              <div style={{ fontSize: `${72 * 배율}px`, fontWeight: 'bold', color: fg, lineHeight: 1 }}>{orderNumber}</div>
              {approvalNumber && (
                <div style={{ fontSize: `${13 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#AAA', marginTop: '8px' }}>
                  {t.approvalNum[언어]}: {approvalNumber}
                </div>
              )}
            </div>

            {/* 처음 화면으로 버튼 */}
            <button
              onClick={handleGoHome}
              style={{ marginTop: `${10 * 배율}px`, padding: `${16 * 배율}px ${48 * 배율}px`, fontSize: `${22 * 배율}px`, fontWeight: 'bold', background: yellowColor, color: '#000', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
            >
              {언어 === 'ko' ? '처음 화면으로' : 언어 === 'en' ? 'Back to Home' : 언어 === 'ja' ? 'ホームへ' : '返回首页'}
            </button>

            <div style={{ fontSize: `${13 * 배율}px`, color: 고대비 ? '#FFEB3B' : '#999' }}>
              {언어 === 'ko' ? '8초 후 자동으로 처음 화면으로 돌아갑니다.' : 언어 === 'en' ? 'Returns to home in 8 seconds.' : 언어 === 'ja' ? '8秒後にホームへ戻ります。' : '8秒后自动返回首页。'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}