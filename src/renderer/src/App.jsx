import { useState, useRef } from 'react';
import { KioskProvider, useKiosk } from './context/KioskContext';
import { MainScreen } from './screens/MainScreen';
import { StoreSelectScreen } from './screens/StoreSelectScreen';
import { MenuScreen } from './screens/MenuScreen';
import { OrderConfirmScreen } from './screens/OrderConfirmScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { CompleteScreen } from './screens/CompleteScreen';
import { Header } from './components/Header';
import { AdminScreen } from './screens/AdminScreen';

function 라우터() {
  const { 화면, set화면, 접근성, 안내, 모드, set모드, 접근성업데이트, 언어, 행동기록, 쉬운모드제안, set쉬운모드제안, set배프모드, 장바구니토스트, 세션경고, 세션타이머재시작 } = useKiosk();
  const [배리어프리팝업, set배리어프리팝업] = useState(false);
  const [음성안내팝업, set음성안내팝업] = useState(false);
  const [음량, set음량] = useState(3);
  const [속도, set속도] = useState(1.0);

  const adminTapRef = useRef(0);
  const adminTimerRef = useRef(null);
  const handleAdminTap = () => {
    adminTapRef.current += 1;
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    adminTimerRef.current = setTimeout(() => { adminTapRef.current = 0; }, 2000);
    if (adminTapRef.current >= 5) { adminTapRef.current = 0; set화면('관리자'); }
  };

  const 배율맵 = { normal: 1, large: 1.3, xlarge: 1.6 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'];
  const 낮은화면 = 접근성?.휠체어 === true;

  const yellowColor = '#CDE000';
  const brownColor = '#3E2723';

  const t = {
    volumeBtn:     { ko: '음량\n조절',              en: 'Volume',                      ja: '音量\n調整',             zh: '音量\n调节' },
    barrierBtn:    { ko: '배리어프리 모드',          en: 'Accessibility',               ja: 'バリアフリー',           zh: '无障碍模式' },
    barrierTitle:  { ko: '배리어프리 모드',          en: 'Accessibility Mode',          ja: 'バリアフリーモード',     zh: '无障碍模式' },
    voiceGuide:    { ko: '음성 안내',                en: 'Voice Guide',                 ja: '音声案内',               zh: '语音引导' },
    signGuide:     { ko: '수어 안내',                en: 'Sign Language',               ja: '手話案内',               zh: '手语引导' },
    close:         { ko: '닫기',                     en: 'Close',                       ja: '閉じる',                 zh: '关闭' },
    volumeTitle:   { ko: '음량 조절',                en: 'Volume',                      ja: '音量調整',               zh: '音量调节' },
    speedTitle:    { ko: '속도',                     en: 'Speed',                       ja: '速度',                   zh: '速度' },
    confirm:       { ko: '닫기',                     en: 'Close',                       ja: '閉じる',                 zh: '关闭' },
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 속도;
      utterance.volume = 음량 / 5;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGlobalClick = (event) => {
    세션타이머재시작(); // 어떤 클릭이든 터치가 있었으니 20초 세션 타이머 리셋
    const button = event.target.closest('button');
    if (!button) return;

    // 행동 패턴 기록 (배프모드 활성 시에만 내부적으로 동작)
    const behaviorKey = button.getAttribute('data-action') || button.getAttribute('aria-label')
      || (button.innerText ? button.innerText.trim() : '') || button.querySelector('img')?.getAttribute('alt') || 'unknown';
    행동기록(behaviorKey);

    if (!접근성?.음성안내) return;
    const optionName = button.getAttribute('data-option');
    const actionName = button.getAttribute('data-action');
    if (optionName && actionName) {
      speak(`${actionName} ${optionName} 버튼이 선택되었습니다.`);
      return;
    }
    let buttonText = button.getAttribute('aria-label') || (button.innerText ? button.innerText.trim() : '');
    if (!buttonText) {
      buttonText = button.querySelector('img')?.getAttribute('alt') || '';
    }
    if (buttonText === '+') buttonText = '더하기';
    if (buttonText === '−' || buttonText === '-') buttonText = '빼기';
    if (buttonText === '×' || buttonText === 'x') buttonText = '닫기';
    if (buttonText) {
      speak(`${buttonText} 버튼이 선택되었습니다.`);
    }
  };

  if (화면 === '관리자') return <AdminScreen />;

  let Screen = null;
  if (화면 === '초기') Screen = <MainScreen />;
  else if (화면 === '매장선택') Screen = <StoreSelectScreen />;
  else if (화면 === '메뉴') Screen = <MenuScreen />;
  else if (화면 === '주문확인') Screen = <OrderConfirmScreen />;
  else if (화면 === '결제') Screen = <PaymentScreen />;
  else if (화면 === '완료') Screen = <CompleteScreen />;
  else Screen = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', fontSize: '1.5em', color: 'white' }}>
      "{화면}" 화면을 찾을 수 없습니다.
    </div>
  );

  return (
    <div
      onClickCapture={handleGlobalClick}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}
    >
      {낮은화면 && 화면 !== '초기' && (
        <div style={{ flex: '0 0 40vh', background: '#000000', width: '100%' }} />
      )}

      <Header />

      {화면 === '초기' && (
        <div
          onClick={handleAdminTap}
          style={{ position: 'fixed', top: 0, left: 0, width: '72px', height: '72px', zIndex: 9999 }}
        />
      )}

      <div style={{ flex: 1, width: '100vw', position: 'relative', overflow: 'hidden' }}>
        {Screen}

        {/* 음량조절 버튼 */}
        {접근성?.음성안내 && (
          <button
            onClick={() => set음성안내팝업(true)}
            style={{
              position: 'fixed', right: '0',
              top: 낮은화면 ? '75%' : '20%',
              width: '85px', height: '120px',
              background: yellowColor,
              border: '1px solid #BBBBBB', borderRight: 'none',
              borderRadius: '20px 0 0 20px',
              boxShadow: '-3px 5px 12px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 999, padding: '0'
            }}>
            <div style={{ width: '46px', height: '46px', background: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '26px' }}>🔊</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', lineHeight: '1.2', textAlign: 'center', whiteSpace: 'pre-line' }}>{t.volumeBtn[언어]}</div>
          </button>
        )}

        {/* 배리어프리 모드 진입 버튼 */}
        {!낮은화면 && 모드 !== '쉬운' && 화면 !== '초기' && 화면 !== '매장선택' && (
          <button
            onClick={() => set배리어프리팝업(true)}
            style={{
              position: 'fixed', bottom: '20px', left: '20px',
              padding: `${14 * 배율}px ${32 * 배율}px`, borderRadius: '30px',
              background: '#FF9900', color: '#FFF',
              fontSize: `${22 * 배율}px`, fontWeight: 'bold',
              border: 'none', cursor: 'pointer', zIndex: 999,
            }}>
            {t.barrierBtn[언어]}
          </button>
        )}

        {/* 음량 조절 팝업 */}
        {음성안내팝업 && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 낮은화면 ? 'flex-end' : 'center', justifyContent: 'center', paddingBottom: 낮은화면 ? '5vh' : '0' }}>
            <div style={{ width: '572px', maxWidth: '92vw', background: '#E9DFD9', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #969696' }}>
              <div style={{ background: brownColor, height: '45px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px' }}>
                <button onClick={() => set음성안내팝업(false)} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '32px', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ padding: '30px 20px 20px', textAlign: 'center', color: '#000' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '26px', fontWeight: 'bold' }}>{t.volumeTitle[언어]}</h3>
                <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', height: '70px' }}>
                    <button onClick={() => set음량(Math.max(1, 음량 - 1))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: brownColor, color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '60px' }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div key={level} style={{ width: '16px', height: `${24 + level * 7}px`, background: level <= 음량 ? yellowColor : '#DDDDDD', borderRadius: '8px', transition: 'background 0.2s ease' }} />
                      ))}
                    </div>
                    <button onClick={() => set음량(Math.min(5, 음량 + 1))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: brownColor, color: '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: 'bold' }}>{t.speedTitle[언어]}</h3>
                  <div style={{ fontSize: '18px', color: '#666', marginBottom: '12px' }}>{속도.toFixed(1)}x</div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={속도} onChange={e => set속도(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: '16px' }} />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {[0.5, 1.0, 1.5].map(s => (
                      <button key={s} onClick={() => set속도(s)} style={{ padding: '8px 20px', borderRadius: '20px', background: 속도 === s ? brownColor : '#E0E0E0', color: 속도 === s ? '#FFF' : '#000', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => set음성안내팝업(false)} style={{ background: '#C0C0C0', color: '#000', border: 'none', padding: '16px 50px', borderRadius: '10px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  {t.confirm[언어]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 행동 패턴 기반 배프모드 제안 팝업 */}
        {/* 장바구니 담김 토스트 */}
        {장바구니토스트 && (
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFF0', borderRadius: '28px', padding: `${28 * 배율}px ${44 * 배율}px`,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)', border: `${4 * 배율}px solid #CDE000`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${14 * 배율}px`,
            zIndex: 3500, pointerEvents: 'none', textAlign: 'center',
          }}>
            <img src="bef4.png" alt="배프" style={{ width: `${100 * 배율}px`, height: `${100 * 배율}px`, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontSize: `${28 * 배율}px`, fontWeight: 'bold', color: '#333' }}>
              <span style={{ color: '#3D8C00' }}>{장바구니토스트.menuName}</span>이(가)<br />장바구니에 담겼어요!
            </span>
          </div>
        )}

        {/* 20초 무터치 세션 타임아웃 경고 (3초 후 초기화면 복귀) */}
        {세션경고 && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 4000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#FFF', borderRadius: '28px', padding: `${40 * 배율}px ${48 * 배율}px`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${16 * 배율}px`,
              width: `${440 * 배율}px`, maxWidth: '90vw',
            }}>
              <img src="bef1.png" alt="배프" style={{ width: `${90 * 배율}px`, height: 'auto' }} />
              <div style={{ fontSize: `${24 * 배율}px`, fontWeight: 'bold', color: '#222', lineHeight: 1.5 }}>
                초기 화면으로 돌아갑니다.<br />계속 주문하시려면 터치해주세요.
              </div>
            </div>
          </div>
        )}

        {쉬운모드제안 && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500 }}>
            <div style={{ background: '#FFF', borderRadius: '20px', padding: '36px 32px', width: `${420 * 배율}px`, maxWidth: '90vw', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <img src="bef1.png" alt="배프" style={{ width: `${70 * 배율}px`, height: 'auto', marginBottom: '12px' }} />
              <div style={{ fontSize: `${22 * 배율}px`, fontWeight: 'bold', color: '#222', marginBottom: '10px' }}>도움모드를 켜드릴까요?</div>
              <div style={{ fontSize: `${16 * 배율}px`, color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
                배프모드를 켜면 큰 글씨, 쉬운 안내,{'\n'}메뉴 추천을 받을 수 있어요.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => set쉬운모드제안(false)} style={{ flex: 1, padding: `${14 * 배율}px`, borderRadius: '12px', border: '1px solid #DDD', background: '#F5F5F5', color: '#666', fontSize: `${16 * 배율}px`, fontWeight: 'bold', cursor: 'pointer' }}>
                  괜찮아요
                </button>
                <button
                  onClick={() => {
                    set쉬운모드제안(false);
                    set배프모드(true);
                    안내('배프모드를 켰어요');
                  }}
                  style={{ flex: 1, padding: `${14 * 배율}px`, borderRadius: '12px', border: 'none', background: yellowColor, color: '#000', fontSize: `${16 * 배율}px`, fontWeight: 'bold', cursor: 'pointer' }}>
                  켜줄게요
                </button>
              </div>
            </div>
          </div>
        )}

        {배리어프리팝업 && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 낮은화면 ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 2000, paddingBottom: 낮은화면 ? '5vh' : '0' }}>
            <div style={{ background: '#FFF', borderRadius: '16px', width: `${480 * 배율}px`, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ background: '#3E2723', padding: '20px 24px', textAlign: 'center' }}>
                <span style={{ color: '#FFF', fontSize: `${24 * 배율}px`, fontWeight: 'bold' }}>{t.barrierTitle[언어]}</span>
              </div>
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={() => {
                    set배리어프리팝업(false);
                    set모드('쉬운');
                    접근성업데이트('휠체어', 낮은화면);
                    접근성업데이트('음성안내', true);
                    접근성업데이트('자막', false);
                    set음성안내팝업(true);
                    setTimeout(() => { 안내('음성 안내 배리어프리 모드로 전환합니다'); }, 50);
                  }}
                  style={{ width: '100%', padding: `${20 * 배율}px`, background: '#F5F5F5', border: '1px solid #DDD', borderRadius: '12px', fontSize: `${24 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
                  🔈 {t.voiceGuide[언어]}
                </button>
                <button
                  onClick={() => {
                    set배리어프리팝업(false);
                    set모드('쉬운');
                    접근성업데이트('휠체어', 낮은화면);
                    접근성업데이트('음성안내', false);
                    접근성업데이트('자막', true);
                    setTimeout(() => { 안내('수어 안내 배리어프리 모드로 전환합니다'); }, 50);
                  }}
                  style={{ width: '100%', padding: `${20 * 배율}px`, background: '#F5F5F5', border: '1px solid #DDD', borderRadius: '12px', fontSize: `${24 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
                  🤟 {t.signGuide[언어]}
                </button>
                <button
                  onClick={() => set배리어프리팝업(false)}
                  style={{ width: '100%', padding: `${14 * 배율}px`, background: '#E0E0E0', border: 'none', borderRadius: '12px', fontSize: `${20 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
                  {t.close[언어]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <KioskProvider>
      <라우터 />
    </KioskProvider>
  );
}