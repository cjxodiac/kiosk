import { useState } from 'react';
import { useKiosk } from '../context/KioskContext';
import { COLORS } from '../components/tokens';
import { FLAGS } from '../components/Flags';

// main_image.png 원본 기준 좌표 (0~1 비율) - 실측 픽셀 분석으로 뽑은 값
const 토글좌표 = { left: '68.7%', top: '71.2%', width: '17.1%', height: '4.7%' };
const 일반버튼좌표 = { left: '7.4%', top: '83.0%', width: '41.2%', height: '11.6%' };
const 배리어버튼좌표 = { left: '51.4%', top: '83.0%', width: '41.2%', height: '11.6%' };
const 토글ON색 = '#8E9231'; // main_image.png 토글에서 실측한 초록색

export function MainScreen() {
  const { set모드, set화면, 언어, set언어, 안내, 접근성, 접근성업데이트, 배프모드, set배프모드 } = useKiosk();
  const [a11yOpen, setA11yOpen] = useState(false);
  const [배리어프리팝업, set배리어프리팝업] = useState(false);
  const [음성안내팝업, set음성안내팝업] = useState(false);
  const [음량, set음량] = useState(3);
  const [속도, set속도] = useState(1.0);

  const 고대비 = 접근성?.고대비 || false;
  const brownColor = '#3E2723';
  const yellowColor = '#CDE000';

  const t = {
    barrierTitle: { ko: '어떤 안내가 필요하세요?', en: 'What assistance do you need?', ja: 'どんなご案内が必要ですか？', zh: '您需要什么帮助？' },
    voiceGuide:   { ko: '음성 안내', en: 'Voice Guide', ja: '音声案内', zh: '语音引导' },
    signGuide:    { ko: '수어 안내', en: 'Sign Language', ja: '手話案内', zh: '手语引导' },
    volumeTitle:  { ko: '음량 조절', en: 'Volume', ja: '音量調整', zh: '音量调节' },
    speedTitle:   { ko: '속도', en: 'Speed', ja: '速度', zh: '速度' },
    confirm:      { ko: '확인', en: 'Confirm', ja: '確認', zh: '确认' },
    a11yTitle:    { ko: '♿ 접근성 설정', en: '♿ Accessibility', ja: '♿ アクセシビリティ設定', zh: '♿ 无障碍设置' },
    fontSize:     { ko: '글씨 크기', en: 'Font Size', ja: '文字サイズ', zh: '字体大小' },
    screenMode:   { ko: '화면 모드', en: 'Display Mode', ja: '画面모드', zh: '显示模式' },
    highContrast: { ko: '🌓 고대비', en: '🌓 High Contrast', ja: '🌓 高コントラスト', zh: '🌓 高对比度' },
    lowScreen:    { ko: '♿ 낮은 화면', en: '♿ Low Screen', ja: '♿ 低い画면', zh: '♿ 低屏模式' },
  };

  const 일반시작 = () => { set모드('일반'); 접근성업데이트('음성안내', false); 접근성업데이트('자막', false); set화면('매장선택'); 안내('일반 주문을 시작합니다'); };
  const 쉬운시작 = () => set배리어프리팝업(true);
  const 음성안내시작 = () => { set배리어프리팝업(false); set모드('쉬운'); 접근성업데이트('음성안내', true); 접근성업데이트('자막', false); set화면('매장선택'); setTimeout(() => 안내('음성 안내 배리어프리 모드입니다'), 300); };
  const 수어안내시작 = () => { set배리어프리팝업(false); set모드('쉬운'); 접근성업데이트('음성안내', false); 접근성업데이트('자막', true); set화면('매장선택'); setTimeout(() => 안내('수어 안내 배리어프리 모드입니다'), 300); };
  const 음성안내완료 = () => { set음성안내팝업(false); set화면('매장선택'); setTimeout(() => 안내('음성 안내 배리어프리 모드입니다'), 300); };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* 이미지 영역 - 하단 툴바 높이만큼 제외하고 화면에 꽉 채움 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <img
          src="main_image.png"
          alt="배프"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
        />

        {/* 배프 ON/OFF 토글 - 실제로 슬라이드되는 진짜 토글 (여유 패딩 포함, 원본 이미지 토글을 완전히 덮음) */}
        <div
          onClick={() => set배프모드(v => !v)}
          style={{
            position: 'absolute',
            left: 'calc(68.55% - 0.6%)', top: 'calc(71.1% - 0.8%)',
            width: 'calc(17.2% + 1.2%)', height: 'calc(4.85% + 1.6%)',
            borderRadius: '999px',
            background: 배프모드 ? 토글ON색 : '#BBBBBB',
            cursor: 'pointer',
            transition: 'background 0.25s',
            boxSizing: 'border-box',
            boxShadow: '0 0 0 3px #F3ECDD',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10%',
            left: 배프모드 ? '55%' : '6%',
            width: '39%',
            height: '80%',
            borderRadius: '50%',
            background: '#FFF',
            transition: 'left 0.25s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }} />
          <span style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            left: 배프모드 ? '12%' : 'auto',
            right: 배프모드 ? 'auto' : '12%',
            fontSize: 'min(1.6vw, 20px)', fontWeight: 'bold', color: '#FFF', userSelect: 'none',
          }}>
            {배프모드 ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* 토글 위에 걸터앉은 캐릭터 - 토글 흰 원 위치를 따라 같이 슬라이드 */}
        <img
          src="bef7.png"
          alt=""
          style={{
            position: 'absolute',
            left: 배프모드 ? '81.7%' : '72.6%',
            top: 토글좌표.top,
            transform: 'translate(-50%, -78%)',
            width: '6.5%',
            height: 'auto',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'left 0.25s',
          }}
        />

        {/* 일반주문 버튼 (투명 클릭영역) */}
        <button onClick={일반시작} style={{
          position: 'absolute',
          left: 일반버튼좌표.left, top: 일반버튼좌표.top,
          width: 일반버튼좌표.width, height: 일반버튼좌표.height,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        }} />

        {/* 배리어프리 모드 버튼 (투명 클릭영역) */}
        <button onClick={쉬운시작} style={{
          position: 'absolute',
          left: 배리어버튼좌표.left, top: 배리어버튼좌표.top,
          width: 배리어버튼좌표.width, height: 배리어버튼좌표.height,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        }} />
      </div>

      {/* 하단 툴바 - 접근성 설정 + 언어선택 (기존 HomeScreen 로직 그대로, 비율 기반 확대) */}
      <div style={{
        flexShrink: 0,
        background: 고대비 ? '#000' : brownColor,
        padding: '1.4vh 2vw',
        display: 'flex', alignItems: 'center', gap: '1.4vw',
        height: '12vh',
        minHeight: '92px',
        boxSizing: 'border-box',
      }}>
        <button onClick={() => setA11yOpen(true)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
          <img src="disabled.png" alt="접근성" style={{ width: 'min(11vh, 100px)', height: 'min(11vh, 100px)', objectFit: 'contain' }} />
        </button>
        <div style={{ display: 'flex', gap: '0.6vw', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '10px', padding: '0.5vh 0.7vw', alignItems: 'center' }}>
          {Object.entries(FLAGS).map(([code, { Component, name }]) => (
            <button key={code} onClick={() => { set언어(code); 안내(name); }} style={{
              padding: '0.4vh 0.5vw', borderRadius: '6px',
              background: 언어 === code ? 'rgba(209,224,0,0.4)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 'min(7vh, 68px)', height: 'min(5.2vh, 50px)',
            }} aria-label={name}>
              <Component size="100%" />
            </button>
          ))}
        </div>
      </div>

      {/* 배리어프리 팝업 */}
      {배리어프리팝업 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '40px 44px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', minWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>{t.barrierTitle[언어]}</span>
              <button onClick={() => set배리어프리팝업(false)} style={{ background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button onClick={음성안내시작} style={{ flex: 1, padding: '36px 20px', background: '#F5F5F5', border: '2px solid #E0E0E0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#000' }}>
                <span style={{ fontSize: '60px' }}>🔈</span>{t.voiceGuide[언어]}
              </button>
              <button onClick={수어안내시작} style={{ flex: 1, padding: '36px 20px', background: '#F5F5F5', border: '2px solid #E0E0E0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#000' }}>
                <span style={{ fontSize: '60px' }}>🤟</span>{t.signGuide[언어]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 음성안내 팝업 (음량/속도) */}
      {음성안내팝업 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '600px', maxWidth: '92vw', background: '#E9DFD9', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ background: brownColor, height: '45px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px' }}>
              <button onClick={() => set음성안내팝업(false)} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '32px', cursor: 'pointer' }}>×</button>
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
                    <button key={s} onClick={() => set속도(s)} style={{ padding: '8px 20px', borderRadius: '20px', background: 속도 === s ? brownColor : '#E0E0E0', color: 속도 === s ? '#FFF' : '#000', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>{s}x</button>
                  ))}
                </div>
              </div>
              <button onClick={음성안내완료} style={{ background: '#C0C0C0', color: '#000', border: 'none', padding: '16px 50px', borderRadius: '10px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }}>{t.confirm[언어]}</button>
            </div>
          </div>
        </div>
      )}

      {a11yOpen && <A11yModal close={() => setA11yOpen(false)} 언어={언어} t={t} />}
    </div>
  );
}

function A11yModal({ close, 언어, t }) {
  const { 접근성, 접근성업데이트, 안내 } = useKiosk();
  const 고대비 = 접근성.고대비;
  const 낮은화면 = 접근성.휠체어;
  const bg = 고대비 ? '#000000' : COLORS.white;
  const fg = 고대비 ? '#FFEB3B' : COLORS.black;
  const primaryColor = 고대비 ? '#FFEB3B' : COLORS.primary;

  const 글씨버튼스타일 = (active) => ({
    width: '140px', height: '140px', minWidth: '140px', maxWidth: '140px', minHeight: '140px', maxHeight: '140px',
    flexShrink: 0, flexGrow: 0, borderRadius: '16px',
    border: `5px solid ${active ? (고대비 ? primaryColor : '#A8B400') : '#9CA3AF'}`,
    background: active ? primaryColor : bg,
    color: active && 고대비 ? '#000000' : fg,
    fontWeight: 'bold', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
  });

  const 모드버튼스타일 = (active) => ({
    minWidth: '200px', height: '90px', padding: '0 24px', borderRadius: '16px',
    border: `5px solid ${active ? (고대비 ? primaryColor : '#A8B400') : '#9CA3AF'}`,
    background: active ? primaryColor : bg,
    color: active && 고대비 ? '#000000' : fg,
    fontSize: '28px', fontWeight: 'bold', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  });

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 낮은화면 ? 'flex-end' : 'center', alignItems: 'center', paddingBottom: 낮은화면 ? '5vh' : '0', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, color: fg, padding: '40px', borderRadius: '24px', width: 'min(92vw, 720px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', border: 고대비 ? `5px solid ${primaryColor}` : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{t.a11yTitle[언어]}</h2>
          <button onClick={close} style={{ fontSize: '36px', padding: '8px 16px', color: fg, cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
        </div>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 고대비 ? primaryColor : '#374151' }}>{t.fontSize[언어]}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'normal'), fontSize: '24px' }} onClick={() => { 접근성업데이트('글씨크기', 'normal'); 안내('기본 글씨'); }}>가</button>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'large'), fontSize: '32px' }} onClick={() => { 접근성업데이트('글씨크기', 'large'); 안내('큰 글씨'); }}>가</button>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'xlarge'), fontSize: '40px' }} onClick={() => { 접근성업데이트('글씨크기', 'xlarge'); 안내('매우 큰 글씨'); }}>가</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 고대비 ? primaryColor : '#374151' }}>{t.screenMode[언어]}</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button style={모드버튼스타일(접근성.고대비)} onClick={() => { 접근성업데이트('고대비', !접근성.고대비); 안내('고대비 모드'); }}>{t.highContrast[언어]}</button>
            <button style={모드버튼스타일(접근성.휠체어)} onClick={() => { 접근성업데이트('휠체어', !접근성.휠체어); 안내('낮은 화면 모드'); }}>{t.lowScreen[언어]}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
