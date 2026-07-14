import React, { useState, useEffect, useRef } from 'react';
import { useKiosk } from '../context/KioskContext';
import { ProgressBar } from '../components/ProgressBar';
import { 수어영역 } from '../components/Signlanguage';
import { playBeep, playSuccess } from '../utils/sound';

export function PaymentScreen() {
  const {
    처음으로, 접근성, set화면, 장바구니, 모드, 매장구분,
    sessionIdRef, track, set주문결과, menus, 언어, 배프활성
  } = useKiosk();

  const t = {
    selectPayment: { ko: '결제수단을 선택해주세요', en: 'Select payment method', ja: 'お支払い方法を選択', zh: '请选择支付方式' },
    amount:        { ko: '결제 금액',               en: 'Amount',               ja: 'お支払い金額',     zh: '支付金额' },
    card:          { ko: '카드결제, 삼성페이',       en: 'Card / Samsung Pay',   ja: 'カード・Samsung Pay', zh: '银行卡/三星支付' },
    easy:          { ko: '간편결제',                en: 'Easy Pay',             ja: '簡単決済',         zh: '快捷支付' },
    wait:          { ko: '잠시만 기다려주세요',      en: 'Please wait...',       ja: 'しばらくお待ちください', zh: '请稍候' },
    stageInit:       { ko: '결제를 준비하고 있습니다',        en: 'Preparing payment...',       ja: '決済を準備中です',           zh: '正在准备支付' },
    stageCardInsert: { ko: '카드를 단말기에 삽입해주세요',    en: 'Please insert card',         ja: 'カードを挿入してください',   zh: '请插入卡' },
    stageReading:    { ko: '카드를 인식했습니다',             en: 'Card detected',              ja: 'カードを認識しました',       zh: '已识别卡' },
    stageConnecting: { ko: 'VAN사에 연결 중입니다',           en: 'Connecting to VAN...',       ja: 'VAN社に接続中です',         zh: '正在连接VAN' },
    stageRequesting: { ko: '결제 승인을 요청하고 있습니다',   en: 'Requesting approval...',     ja: '決済承認を要請中です',       zh: '正在请求批准' },
    stageApproved:   { ko: '결제가 승인되었습니다',           en: 'Payment approved',           ja: '決済が承認されました',       zh: '支付已批准' },
    stagePrinting:   { ko: '영수증을 출력하고 있습니다',      en: 'Printing receipt...',        ja: 'レシートを印刷中です',       zh: '正在打印收据' },
    stageScan:       { ko: 'QR/바코드를 스캐너에 보여주세요', en: 'Show QR/barcode to scanner', ja: 'QR・バーコードをスキャナーへ', zh: '请向扫描仪显示二维码/条形码' },
    stageQRRead:     { ko: 'QR을 인식했습니다',               en: 'QR detected',                ja: 'QRを認識しました',           zh: '已识别二维码' },
    stageDetected:   { ko: '결제를 처리하는 중입니다',        en: 'Processing payment...',      ja: '決済を処理中です',           zh: '正在처리支付' },
    stageAuth:       { ko: '사용자 인증 중입니다',            en: 'Authenticating...',          ja: 'ユーザー認証中です',         zh: '正在认证用户' },
    lcdInit:       { ko: '준비중...',        en: 'Ready...',      ja: '準備中...',    zh: '准备中...' },
    lcdInsert:     { ko: '카드를 넣어주세요', en: 'Insert card',   ja: 'カード挿入',  zh: '请插卡' },
    lcdScan:       { ko: 'QR 코드 스캔',     en: 'Scan QR',       ja: 'QRスキャン',  zh: '扫描二维码' },
    lcdReading:    { ko: '읽는 중',          en: 'Reading...',    ja: '読取中',      zh: '读取中' },
    lcdConnecting: { ko: 'VAN 통신중',       en: 'VAN comm...',   ja: 'VAN通信中',   zh: 'VAN通信中' },
    lcdDetected:   { ko: '결제 처리',        en: 'Processing',    ja: '決済処理',    zh: '处理中' },
    lcdAuth:       { ko: '인증중',           en: 'Auth...',       ja: '認証中',      zh: '认证中' },
    lcdRequesting: { ko: '승인 요청중',      en: 'Requesting',    ja: '承認要請中',  zh: '请求中' },
    lcdApproved:   { ko: '*승인완료*',       en: '*APPROVED*',    ja: '*承認完了*',  zh: '*已批准*' },
    lcdPrinting:   { ko: '영수증 출력',      en: 'Printing',      ja: 'レシート印刷', zh: '打印中' },
    cardLabel:     { ko: '카드',     en: 'Card',         ja: 'カード',    zh: '卡号' },
    approvalLabel: { ko: '승인번호', en: 'Approval No.', ja: '承認番号',  zh: '批准号' },
    amountLabel:   { ko: '금액',     en: 'Amount',       ja: '金額',      zh: '金额' },
    installLabel:  { ko: '할부',     en: 'Installment',  ja: '分割払い',  zh: '分期' },
    installOnce:   { ko: '일시불',   en: 'Lump sum',     ja: '一括',      zh: '一次性' },
    signPayment: {
      ko: '결제 방법을 선택해주세요. 카드결제 또는 간편결제 중 원하시는 결제 수단을 선택해주세요.',
      en: 'Please select a payment method. Choose Card or Easy Pay.',
      ja: 'お支払い方法を選択してください。カードまたは簡単決済からお選びください。',
      zh: '请选择支付方式。请从银行卡或快捷支付中选择。',
    },
    cardPayment: {
      ko: '신용카드를 우측 하단의 카드 리더기에 끝까지 넣어주세요.',
      en: 'Please insert your card fully into the card reader at the bottom right.',
      ja: 'カードリーダーにカードを奥まで差し込んでください。',
      zh: '请将信用卡完全插入右下方的读卡器。',
    },
  };

  const CARD_STAGES = [
    { key: 'init',       msgKey: 'stageInit',       lcdKey: 'lcdInit',       duration: 1700 },
    { key: 'insert',     msgKey: 'stageCardInsert', lcdKey: 'lcdInsert',     duration: 1700, blink: true },
    { key: 'reading',    msgKey: 'stageReading',    lcdKey: 'lcdReading',    duration: 1700,  beep: 'simple' },
    { key: 'connecting', msgKey: 'stageConnecting', lcdKey: 'lcdConnecting', duration: 1700 },
    { key: 'requesting', msgKey: 'stageRequesting', lcdKey: 'lcdRequesting', duration: 1700, action: 'pay' },
    { key: 'approved',   msgKey: 'stageApproved',   lcdKey: 'lcdApproved',   duration: 1700, beep: 'success' },
    { key: 'printing',   msgKey: 'stagePrinting',   lcdKey: 'lcdPrinting',   duration: 1700, action: 'order' },
  ];

  const EASY_STAGES = [
    { key: 'init',       msgKey: 'stageInit',       lcdKey: 'lcdInit',       duration: 1700 },
    { key: 'scan',       msgKey: 'stageScan',       lcdKey: 'lcdScan',       duration: 1700, blink: true },
    { key: 'reading',    msgKey: 'stageQRRead',     lcdKey: 'lcdReading',    duration: 1700,  beep: 'simple' },
    { key: 'detected',   msgKey: 'stageDetected',   lcdKey: 'lcdDetected',   duration: 1700 },
    { key: 'auth',       msgKey: 'stageAuth',       lcdKey: 'lcdAuth',       duration: 1700, action: 'pay' },
    { key: 'requesting', msgKey: 'stageRequesting', lcdKey: 'lcdRequesting', duration: 1700 },
    { key: 'approved',   msgKey: 'stageApproved',   lcdKey: 'lcdApproved',   duration: 1700, beep: 'success' },
    { key: 'printing',   msgKey: 'stagePrinting',   lcdKey: 'lcdPrinting',   duration: 1700, action: 'order' },
  ];

  const BEF_PAY_TEXT = {
    init:       { plain: '결제를 준비하고 있어요, ', bold: '잠시만 기다려주세요!' },
    insert:     { plain: '카드를 ', bold: '끝까지 투입해주세요!' },
    scan:       { plain: 'QR/바코드를 ', bold: '스캐너에 보여주세요!' },
    reading:    { plain: '', bold: '인식하고 있어요!' },
    detected:   { plain: '결제를 ', bold: '처리하는 중이에요!' },
    auth:       { plain: '사용자 ', bold: '인증 중이에요!' },
    connecting: { plain: 'VAN사와 ', bold: '통신 중이에요!' },
    requesting: { plain: '결제 ', bold: '승인을 요청하고 있어요!' },
    approved:   { plain: '결제가 ', bold: '승인됐어요!' },
    printing:   { plain: '영수증을 ', bold: '출력하고 있어요!' },
  };

  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;
  const 배율맵 = { normal: 1.0, large: 1.3, xlarge: 1.6 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'];

  const [flow, setFlow] = useState('select');
  const [stageIdx, setStageIdx] = useState(0);
  const [paymentResult, setPaymentResult] = useState(null);
  const paymentResultRef = useRef(null);
  const timerRef = useRef(null);

  const stages = flow === 'card' ? CARD_STAGES : EASY_STAGES;
  const stage = stages[stageIdx];

  const 총금액 = 장바구니.reduce((sum, item) => {
    const menu = menus.find(m => m.id === item.menuId);
    return sum + ((menu ? menu.price : 0) + (item.optionPrice || 0)) * item.qty;
  }, 0);

  const startPayment = (method) => {
    track('payment_method_select', '결제', { method });
    setFlow(method === '카드' ? 'card' : 'easy');
    setStageIdx(0);
    setPaymentResult(null);
    paymentResultRef.current = null;
  };

  useEffect(() => {
    if (flow === 'select') return;
    let cancelled = false;

    const run = async () => {
      if (stage.beep === 'simple') playBeep(1200, 100);
      if (stage.beep === 'success') playSuccess();

      if (stage.action === 'pay') {
        try {
          const result = await window.api?.payment.request({
            amount: 총금액,
            method: flow === 'card' ? 'card' : 'easy_pay',
          });
          if (!cancelled && result?.success) {
            paymentResultRef.current = result;
            setPaymentResult(result);
          }
        } catch (e) { console.error(e); }
      }

      if (stage.action === 'order') {
        try {
          const items = 장바구니.map(it => {
            const menu = menus.find(m => m.id === it.menuId);
            return {
              menuId: it.menuId,
              name: menu?.name || '',
              price: menu?.price || 0,
              qty: it.qty,
              options: it.options || [],
              optionPrice: it.optionPrice || 0,
            };
          });
          const usedAcc = (접근성.휠체어 || 접근성.음성안내 || 접근성.수어모드 || 접근성.자막 || 접근성.고대비) ? 1 : 0;
          const order = await window.api?.order.create({
            sessionId: sessionIdRef?.current,
            items,
            total: 총금액,
            payment: paymentResultRef.current,
            paymentMethod: flow === 'card' ? 'card' : 'easy_pay',
            mode: 모드,
            usedAccessibility: usedAcc,
          });
          if (!cancelled && order) {
            set주문결과({ ...order, payment: paymentResultRef.current, storeType: 매장구분 });
            window.api?.printer.receipt({ ...order, payment: paymentResultRef.current, storeType: 매장구분 });
            track('order_complete', '결제', { orderId: order.id, total: 총금액 });
          }
        } catch (e) { console.error(e); }
      }

      await new Promise(r => { timerRef.current = setTimeout(r, stage.duration); });
      if (cancelled) return;

      if (stageIdx < stages.length - 1) {
        setStageIdx(stageIdx + 1);
      } else {
        set화면('완료');
      }
    };

    run();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIdx, flow]);

  const bg = 고대비 ? '#000000' : '#E6E6E6';
  const fg = 고대비 ? '#FFEB3B' : '#000000';
  const cardBg = 고대비 ? '#000000' : '#FFFFFF';

  // ── 낮은화면 ──
  if (낮은화면) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: bg, overflow: 'hidden' }}>
        {flow === 'select' ? (
          <>
            {/* 결제수단 선택 수어영역 */}
            <수어영역 안내텍스트={t.signPayment[언어]} 영상="sign_payment.mp4" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${16 * 배율}px`, padding: '12px 20px', overflow: 'hidden' }}>
              <div style={{ fontSize: `${18 * 배율}px`, fontWeight: 'bold', color: fg }}>{t.amount[언어]}: ₩{총금액.toLocaleString()}</div>
              <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg }}>{t.selectPayment[언어]}</div>
              <div style={{ display: 'flex', gap: `${16 * 배율}px` }}>
                <button onClick={() => startPayment('카드')}
                  style={{ width: `${150 * 배율}px`, height: `${110 * 배율}px`, background: cardBg, borderRadius: '12px', border: 고대비 ? '2px solid #FFEB3B' : '1px solid #CCC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <div style={{ fontSize: `${36 * 배율}px` }}>💳</div>
                  <span style={{ fontSize: `${13 * 배율}px`, fontWeight: 'bold', color: fg, textAlign: 'center' }}>{t.card[언어]}</span>
                </button>
                <button onClick={() => startPayment('간편결제')}
                  style={{ width: `${150 * 배율}px`, height: `${110 * 배율}px`, background: cardBg, borderRadius: '12px', border: 고대비 ? '2px solid #FFEB3B' : '1px solid #CCC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <div style={{ fontSize: `${36 * 배율}px` }}>📱</div>
                  <span style={{ fontSize: `${13 * 배율}px`, fontWeight: 'bold', color: fg }}>{t.easy[언어]}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 결제 진행 중 수어영역 */}
            <수어영역
              안내텍스트={flow === 'card' ? t.cardPayment[언어] : t[stage.msgKey][언어]}
              영상={flow === 'card' ? 'card_payment.mp4' : 'sign_payment.mp4'}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${16 * 배율}px`, padding: '16px', overflow: 'auto' }}>
              <div style={{ fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: fg, textAlign: 'center' }}>{t[stage.msgKey][언어]}</div>
              <div style={{ fontSize: `${13 * 배율}px`, color: 고대비 ? '#FFF' : '#666' }}>{t.wait[언어]}</div>
              <TerminalDisplay stageKey={stage.lcdKey} amount={총금액} flow={flow} blink={stage.blink} small t={t} 언어={언어} />
              {paymentResult && stageIdx >= stages.findIndex(s => s.key === 'approved') && (
                <ApprovalInfo result={paymentResult} amount={총금액} small t={t} 언어={언어} />
              )}
              <StageProgress stages={stages} currentIdx={stageIdx} 고대비={고대비} />
            </div>
          </>
        )}
      </div>
    );
  }

  // ── 일반모드: 결제수단 선택 ──
  if (flow === 'select') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden', position: 'relative' }}>
        {배프활성 && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, pointerEvents: 'none' }} />
        )}
        <div style={{ padding: '30px 0', flexShrink: 0, position: 'relative', zIndex: 501 }}><ProgressBar currentStep={3} 고대비={고대비} /></div>
        <수어영역 안내텍스트={t.signPayment[언어]} 영상="sign_payment.mp4" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${30 * 배율}px`, paddingBottom: '40px', position: 'relative', zIndex: 501 }}>
          <h2 style={{ fontSize: `${36 * 배율}px`, fontWeight: 'bold', color: fg, margin: 0 }}>{t.selectPayment[언어]}</h2>
          <div style={{
            fontSize: `${32 * 배율}px`, color: fg, fontWeight: 'bold',
            padding: 배프활성 ? `${8 * 배율}px ${20 * 배율}px` : 0,
            borderRadius: '14px',
            background: 배프활성 && !고대비 ? '#FFFFF0' : 'transparent',
            boxShadow: 배프활성 && !고대비 ? '0 0 0 3px rgba(205,224,0,0.6), 0 0 20px 6px rgba(205,224,0,0.4)' : 'none',
          }}>{t.amount[언어]}: ₩{총금액.toLocaleString()}</div>
          {배프활성 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: `${14 * 배율}px`, background: '#FFFFF0', borderRadius: `${20 * 배율}px`, padding: `${18 * 배율}px ${24 * 배율}px`, boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }}>
              <span style={{ fontWeight: 'bold', fontSize: `${28 * 배율}px`, color: '#222' }}>
                원하는 <span style={{ color: '#3D8C00', fontWeight: 'bold' }}>결제수단을</span> 선택해주세요!
              </span>
              <img src="bef5.png" alt="배프" style={{ width: `${76 * 배율}px`, height: 'auto', flexShrink: 0 }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: `${30 * 배율}px` }}>
            <button onClick={() => startPayment('카드')} style={{ width: `${280 * 배율}px`, height: `${280 * 배율}px`, background: cardBg, borderRadius: '16px', border: 고대비 ? '2px solid #FFEB3B' : 'none', boxShadow: 배프활성 && !고대비 ? '0 0 0 4px rgba(205,224,0,0.6), 0 0 28px 8px rgba(205,224,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: `${80 * 배율}px` }}>💳</div>
              <span style={{ fontSize: `${28 * 배율}px`, fontWeight: 'bold', color: fg, textAlign: 'center', wordBreak: 'keep-all' }}>{t.card[언어]}</span>
            </button>
            <button onClick={() => startPayment('간편결제')} style={{ width: `${280 * 배율}px`, height: `${280 * 배율}px`, background: cardBg, borderRadius: '16px', border: 고대비 ? '2px solid #FFEB3B' : 'none', boxShadow: 배프활성 && !고대비 ? '0 0 0 4px rgba(205,224,0,0.6), 0 0 28px 8px rgba(205,224,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: `${80 * 배율}px` }}>📱</div>
              <span style={{ fontSize: `${28 * 배율}px`, fontWeight: 'bold', color: fg }}>{t.easy[언어]}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 일반모드: 결제 진행 중 ──
  const approvedIdx = stages.findIndex(s => s.key === 'approved');
  const showApproval = paymentResult && stageIdx >= approvedIdx;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden', position: 'relative' }}>
      {배프활성 && (flow === 'card' || flow === 'easy') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, pointerEvents: 'none' }} />
      )}
      <div style={{ padding: '20px 0', flexShrink: 0, position: 'relative', zIndex: 501 }}><ProgressBar currentStep={3} 고대비={고대비} /></div>
      <수어영역
        안내텍스트={flow === 'card' ? t.cardPayment[언어] : t[stage.msgKey][언어]}
        영상={flow === 'card' ? 'card_payment.mp4' : 'sign_payment.mp4'}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: `${30 * 배율}px`, padding: '20px', overflow: 'auto', position: 'relative', zIndex: 501 }}>
        {배프활성 && (flow === 'card' || flow === 'easy') && BEF_PAY_TEXT[stage.key] && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="bef9.png" alt="배프" style={{ width: `${110 * 배율}px`, height: 'auto', flexShrink: 0 }} />
            <div style={{ position: 'relative', background: '#FFFFF0', borderRadius: `${20 * 배율}px`, padding: `${18 * 배율}px ${26 * 배율}px`, boxShadow: '0 6px 16px rgba(0,0,0,0.3)', marginLeft: `${18 * 배율}px`, maxWidth: '70vw' }}>
              <div style={{ position: 'absolute', left: `${-13 * 배율}px`, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderStyle: 'solid', borderWidth: `${11 * 배율}px ${14 * 배율}px ${11 * 배율}px 0`, borderColor: 'transparent #FFFFF0 transparent transparent' }} />
              <span style={{ fontWeight: 'bold', fontSize: `${28 * 배율}px`, color: '#222', lineHeight: 1.4 }}>
                {BEF_PAY_TEXT[stage.key].plain}
                <span style={{ color: '#3D8C00', fontWeight: 'bold' }}>{BEF_PAY_TEXT[stage.key].bold}</span>
              </span>
            </div>
          </div>
        )}
        <div style={{
          borderRadius: '20px',
          boxShadow: 배프활성 && (flow === 'card' || flow === 'easy') && !고대비 ? '0 0 0 4px rgba(205,224,0,0.6), 0 0 28px 8px rgba(205,224,0,0.5)' : 'none',
        }}>
          <TerminalDisplay stageKey={stage.lcdKey} amount={총금액} flow={flow} blink={stage.blink} t={t} 언어={언어} 배율={배율} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: `${38 * 배율}px`, fontWeight: 'bold', color: fg, margin: '0 0 12px 0' }}>{t[stage.msgKey][언어]}</h2>
          <div style={{ fontSize: `${20 * 배율}px`, color: 고대비 ? '#FFF' : '#666' }}>{t.wait[언어]}</div>
        </div>
        {showApproval && <ApprovalInfo result={paymentResult} amount={총금액} t={t} 언어={언어} 배율={배율} />}
        <StageProgress stages={stages} currentIdx={stageIdx} 고대비={고대비} />
      </div>
    </div>
  );
}

function TerminalDisplay({ stageKey, amount, flow, blink, small, t, 언어, 배율 = 1 }) {
  const w = small ? '220px' : `${380 * 배율}px`;
  const fontSize = small ? '15px' : `${22 * 배율}px`;
  const subSize = small ? '12px' : `${16 * 배율}px`;
  const minH = small ? '52px' : `${90 * 배율}px`;
  const pad = small ? '10px' : `${20 * 배율}px`;
  return (
    <div style={{ width: w, background: '#1a1a1a', borderRadius: '12px', padding: pad, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ background: '#9eef00', fontFamily: 'monospace', padding: pad, borderRadius: '6px', color: '#000', fontSize, fontWeight: 'bold', textAlign: 'center', minHeight: minH, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
        <div>{t[stageKey]?.[언어] || '...'}</div>
        <div style={{ fontSize: subSize }}>₩{amount.toLocaleString()}</div>
      </div>
      {flow === 'card' && (
        <div style={{ marginTop: small ? '8px' : `${14 * 배율}px`, height: small ? '22px' : `${36 * 배율}px`, background: '#000', borderRadius: '4px', border: '2px solid #444', animation: blink ? 'kioskBlink 1s infinite' : 'none' }} />
      )}
      {flow === 'easy' && (
        <div style={{ marginTop: small ? '8px' : `${14 * 배율}px`, height: small ? '22px' : `${36 * 배율}px`, background: blink ? '#ff5555' : '#333', borderRadius: '4px', textAlign: 'center', color: '#FFF', fontFamily: 'monospace', fontSize: small ? '11px' : `${14 * 배율}px`, padding: small ? '4px 0' : `${10 * 배율}px 0`, animation: blink ? 'kioskBlink 1s infinite' : 'none' }}>
          {blink ? (언어 === 'en' ? '◉ Scanner active' : 언어 === 'ja' ? '◉ スキャナ有効' : 언어 === 'zh' ? '◉ 扫描仪激活' : '◉ 스캐너 활성') : (언어 === 'en' ? 'Standby' : 언어 === 'ja' ? '待機中' : 언어 === 'zh' ? '待机中' : '대기중')}
        </div>
      )}
      <style>{`@keyframes kioskBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

function ApprovalInfo({ result, amount, small, t, 언어, 배율 = 1 }) {
  const fontSize = small ? '13px' : `${17 * 배율}px`;
  const pad = small ? '10px 14px' : `${20 * 배율}px ${30 * 배율}px`;
  const minW = small ? '200px' : `${320 * 배율}px`;
  return (
    <div style={{ background: '#FFF', borderRadius: '12px', padding: pad, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize, lineHeight: 1.7, minWidth: minW }}>
      <Row label={t.cardLabel[언어]} value={result.cardNumber} />
      <Row label={t.approvalLabel[언어]} value={result.approvalNumber} />
      <Row label={t.amountLabel[언어]} value={`₩${amount.toLocaleString()}`} />
      <Row label={t.installLabel[언어]} value={result.installment || t.installOnce[언어]} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 'bold', color: '#000' }}>{value}</span>
    </div>
  );
}

function StageProgress({ stages, currentIdx, 고대비 }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {stages.map((s, i) => (
        <div key={s.key} style={{
          width: i === currentIdx ? '14px' : '10px',
          height: i === currentIdx ? '14px' : '10px',
          borderRadius: '50%',
          background: i <= currentIdx ? (고대비 ? '#FFEB3B' : '#3D2418') : '#CCC',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}