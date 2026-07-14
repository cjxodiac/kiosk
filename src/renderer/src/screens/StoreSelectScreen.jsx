import React, { useState } from 'react';
import { useKiosk } from '../context/KioskContext';
import { COLORS } from '../components/tokens';
import { FLAGS } from '../components/Flags';
import { 수어영역 } from '../components/Signlanguage';
import { BefOverlay } from '../components/BefOverlay';

export function StoreSelectScreen() {
  const { set화면, set매장구분, 언어, set언어, 안내, 접근성, 접근성업데이트, 배프활성 } = useKiosk();
  const [a11yOpen, setA11yOpen] = useState(false);

  const 배율맵 = { normal: 1.3, large: 1.8, xlarge: 2.3 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'];
  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;

  const bg = 고대비 ? '#000000' : '#D9D9D9';
  const fg = 고대비 ? '#FFEB3B' : COLORS.black;
  const primaryColor = 고대비 ? '#FFEB3B' : COLORS.primary;
  const cardBg = 고대비 ? '#000000' : '#FFFFFF';

  const t = {
    title:   { ko: '드시고 가시나요?',       en: 'For here or to go?',  ja: 'お召し上がり方法',   zh: '请选择用餐方式' },
    takeout: { ko: '매장',                   en: 'Dine In',             ja: '店内',              zh: '堂食' },
    dinein:  { ko: '포장',                   en: 'Take Out',            ja: 'テイクアウト',      zh: '打包' },
    sign:    { ko: '매장에서 드시려면 \'매장\' 버튼을, 포장하시려면 \'포장\' 버튼을 눌러주세요.',
               en: 'Press \'Dine In\' to eat here, or \'Take Out\' to go.',
               ja: '店内の場合は\'店内\'、テイクアウトの場合は\'テイクアウト\'を押してください。',
               zh: '堂食请按\'堂食\'，打包请按\'打包\'。' },
  };

  const 선택 = (구분) => {
    set매장구분(구분);
    set화면('메뉴');
    안내(`${구분 === '매장' ? t.dinein[언어] : t.takeout[언어]} 선택. 메뉴를 선택해주세요`);
  };

  const 버튼크기 = 낮은화면 ? '180px' : '280px';

  return (
    <div style={{ width: '100vw', height: '100%', display: 'flex', flexDirection: 'column', background: bg, color: fg, overflow: 'hidden', boxSizing: 'border-box' }}>

      <BefOverlay bubbles={[
        {
          // 헤더 바로 아래 → 토글(중앙)을 가리키는 꼬리
          top: '10%', left: '50%',
          transform: 'translateX(-60%)',
          title: '배프가 도와드리고 있어요!',
          text: '도움모드 기능을\n켜고 끌 수 있어요!',
          direction: 'row',
          tail: 'top-right',
        },
        {
          // 버튼 두 개 아래 → 오른쪽으로 옮겨서 버튼 쪽을 정확히 가리키는 꼬리
          top: '62%', left: '50%',
          transform: 'translateX(-30%)',
          textNode: (
            <>
              <span style={{ color: '#CDE000', fontWeight: 'bold' }}>포장</span>
              {' 또는 '}
              <span style={{ color: '#CDE000', fontWeight: 'bold' }}>매장</span>
              {'을\n선택해주세요!\n원하는 주문 방식을\n선택할 수 있어요.'}
            </>
          ),
          image: 'bef2.png',
          imageSize: '100px',
          direction: 'row',
          tail: 'top-left',
        },
      ]} />

      {/* 수어 안내 영역 */}
      <수어영역 안내텍스트={t.sign[언어]} 영상="where_hand.mp4" />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 낮은화면 ? 'flex-end' : 'center',
        gap: '30px',
        padding: 낮은화면 ? '0 5% 40px' : '0 5%'
      }}>
        <h1 style={{ fontSize: `${(낮은화면 ? 24 : 32) * 배율}px`, fontWeight: 'bold', textAlign: 'center', color: fg }}>
          {t.title[언어]}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', width: '100%' }}>
          {/* 매장 버튼 - 배프활성일 때만 빛나는 효과 */}
          <button onClick={() => 선택('포장')} style={{
            width: 버튼크기, height: 버튼크기, flexShrink: 0,
            background: cardBg, borderRadius: '16px',
            border: 고대비 ? `4px solid ${primaryColor}` : `3px solid ${COLORS.primary}`,
            boxShadow: 배프활성 && !고대비 ? '0 0 0 4px rgba(205,224,0,0.5), 0 0 24px 8px rgba(205,224,0,0.35)' : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '12px', cursor: 'pointer', overflow: 'hidden',
          }}>
            <img src="store.png" style={{ width: 낮은화면 ? '80px' : '120px', height: 낮은화면 ? '80px' : '120px', objectFit: 'contain' }} />
            <div style={{ fontSize: `${(낮은화면 ? 18 : 28) * 배율}px`, fontWeight: 'bold', color: fg }}>{t.takeout[언어]}</div>
          </button>

          {/* 포장 버튼 - 배프활성일 때만 빛나는 효과 */}
          <button onClick={() => 선택('매장')} style={{
            width: 버튼크기, height: 버튼크기, flexShrink: 0,
            background: cardBg, borderRadius: '16px',
            border: 고대비 ? `4px solid ${primaryColor}` : `3px solid ${COLORS.primary}`,
            boxShadow: 배프활성 && !고대비 ? '0 0 0 4px rgba(205,224,0,0.5), 0 0 24px 8px rgba(205,224,0,0.35)' : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '12px', cursor: 'pointer', overflow: 'hidden',
          }}>
            <img src="takeout.png" style={{ width: 낮은화면 ? '80px' : '120px', height: 낮은화면 ? '80px' : '120px', objectFit: 'contain' }} />
            <div style={{ fontSize: `${(낮은화면 ? 18 : 28) * 배율}px`, fontWeight: 'bold', color: fg }}>{t.dinein[언어]}</div>
          </button>
        </div>
      </div>

      {/* 하단바 */}
      <div style={{
        flex: '0 0 auto',
        background: 고대비 ? '#000000' : '#3D2418',
        borderTop: 고대비 ? `0.15em solid ${primaryColor}` : 'none',
        padding: '12px 0.8em',
        display: 'flex', alignItems: 'center', gap: '0.6em',
        minHeight: '90px',
      }}>
        <button onClick={() => setA11yOpen(true)} style={{
          background: 'transparent', border: 'none', padding: '0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-label="접근성 설정">
          <img src="disabled.png" alt="접근성" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </button>

        <div style={{
          display: 'flex', gap: '0.25em',
          border: `0.12em solid ${고대비 ? primaryColor : COLORS.white}`,
          borderRadius: '0.45em', padding: '0.2em 0.3em',
          width: '323px', height: '66px', alignItems: 'center',
        }}>
          {Object.entries(FLAGS).map(([code, { Component, name }]) => (
            <button key={code} onClick={() => { set언어(code); 안내(name); }} style={{
              padding: '0.15em 0.3em', borderRadius: '0.3em',
              background: 언어 === code ? (고대비 ? 'rgba(255,235,59,0.35)' : 'rgba(209,224,0,0.35)') : 'transparent',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              width: '69px', height: '46px',
            }} aria-label={name}>
              <Component size="100%" />
            </button>
          ))}
        </div>
      </div>

      {a11yOpen && <A11yModal close={() => setA11yOpen(false)} />}
    </div>
  );
}

function A11yModal({ close }) {
  const { 접근성, 접근성업데이트, 안내 } = useKiosk();
  const 고대비 = 접근성.고대비;
  const 낮은화면 = 접근성.휠체어;

  const bg = 고대비 ? '#000000' : COLORS.white;
  const fg = 고대비 ? '#FFEB3B' : COLORS.black;
  const primaryColor = 고대비 ? '#FFEB3B' : COLORS.primary;

  const 글씨버튼스타일 = (active) => ({
    width: '140px', height: '140px', minWidth: '140px', maxWidth: '140px',
    minHeight: '140px', maxHeight: '140px', flexShrink: 0, flexGrow: 0,
    borderRadius: '16px',
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
    <div onClick={close} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 낮은화면 ? 'flex-end' : 'center',
      alignItems: 'center', paddingBottom: 낮은화면 ? '5vh' : '0', zIndex: 1000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: bg, color: fg, padding: '40px', borderRadius: '24px',
        width: 'min(92vw, 720px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        border: 고대비 ? `5px solid ${primaryColor}` : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>♿ 접근성 설정</h2>
          <button onClick={close} style={{ fontSize: '36px', padding: '8px 16px', color: fg, cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
        </div>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 고대비 ? primaryColor : '#374151' }}>글씨 크기</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'normal'), fontSize: '36px' }} onClick={() => { 접근성업데이트('글씨크기', 'normal'); 안내('기본 글씨'); }}>가</button>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'large'), fontSize: '52px' }} onClick={() => { 접근성업데이트('글씨크기', 'large'); 안내('큰 글씨'); }}>가</button>
            <button style={{ ...글씨버튼스타일(접근성.글씨크기 === 'xlarge'), fontSize: '70px' }} onClick={() => { 접근성업데이트('글씨크기', 'xlarge'); 안내('매우 큰 글씨'); }}>가</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 고대비 ? primaryColor : '#374151' }}>화면 모드</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button style={모드버튼스타일(접근성.고대비)} onClick={() => { 접근성업데이트('고대비', !접근성.고대비); 안내('고대비 모드'); }}>🌓 고대비</button>
            <button style={모드버튼스타일(접근성.휠체어)} onClick={() => { 접근성업데이트('휠체어', !접근성.휠체어); 안내('낮은 화면 모드'); }}>♿ 낮은 화면</button>
          </div>
        </div>
      </div>
    </div>
  );
}