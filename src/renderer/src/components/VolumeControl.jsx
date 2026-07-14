import React, { useState } from 'react';
import { useKiosk } from '../context/KioskContext';

export function VolumeControl() {
  const { 화면, 접근성 } = useKiosk();
  
  if (!['초기', '접근성', '매장선택'].includes(화면)) return null;

  const 고대비 = 접근성?.고대비 || false;
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(3); // 음량 1~5단계 (기본 3)
  const 낮은화면 = 접근성?.휠체어 || false;

  const bg = 고대비 ? '#000000' : '#F5F5F5';
  const fg = 고대비 ? '#FFEB3B' : '#000000';
  const yellowColor = 고대비 ? '#FFEB3B' : '#CDE000';
  const brownColor = 고대비 ? '#FFEB3B' : '#3E2723';
  const grayBtnColor = 고대비 ? '#444' : '#D0D0D0';

  return (
    <>
      {/* ─── 우측 상단 플로팅 음량 조절 버튼 (크기 대폭 확대!) ─── */}
      <button
        onClick={() => setIsOpen(true)}
          style={{
          position: 'fixed',
          right: '0',
          top: 낮은화면 ? '60%' : '20%', // 👈 수정
          width: '85px',       // 기존 54px -> 85px로 확대
          height: '120px',     // 기존 84px -> 120px로 확대
          background: yellowColor,
          border: '1px solid #BBBBBB',
          borderRight: 'none',
          borderRadius: '20px 0 0 20px', // 곡률도 살짝 키움
          boxShadow: '-3px 5px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          padding: '0'
        }}
      >
        {/* 스피커 아이콘 배경 및 이모지 크기 확대 */}
        <div style={{ 
          width: '46px', height: '46px', background: '#FFF', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          marginBottom: '10px', fontSize: '26px' 
        }}>
          🔊
        </div>
        {/* 글자 크기 확대 */}
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', lineHeight: '1.2', textAlign: 'center' }}>
          음량<br/>조절
        </div>
      </button>

      {/* ─── 음량 조절 모달 팝업창 ─── */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '85%', maxWidth: '360px', background: bg,
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: 고대비 ? `2px solid ${yellowColor}` : 'none'
          }}>
            
            <div style={{ background: brownColor, height: '45px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px' }}>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 고대비 ? '#000' : '#FFF', fontSize: '32px', cursor: 'pointer', lineHeight: 1 }}>
                ×
              </button>
            </div>
            
            <div style={{ padding: '30px 20px 40px', textAlign: 'center', color: fg }}>
              <h3 style={{ margin: '0 0 35px 0', fontSize: '26px', fontWeight: 'bold' }}>음량 조절</h3>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '50px', height: '70px' }}>
                
                <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px', opacity: 0.08, fontSize: '60px', pointerEvents: 'none', zIndex: 0 }}>
                  <span>🍽️</span>
                  <span>🛍️</span>
                </div>

                <button 
                  onClick={() => setVolume(Math.max(1, volume - 1))} 
                  style={{ width: '44px', height: '44px', borderRadius: '50%', background: brownColor, color: 고대비 ? '#000' : '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '60px', zIndex: 1 }}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} style={{
                      width: '16px',
                      height: `${24 + level * 7}px`, 
                      background: level <= volume ? yellowColor : (고대비 ? '#333' : '#DDDDDD'),
                      borderRadius: '8px',
                      transition: 'background 0.2s ease'
                    }} />
                  ))}
                </div>

                <button 
                  onClick={() => setVolume(Math.min(5, volume + 1))} 
                  style={{ width: '44px', height: '44px', borderRadius: '50%', background: brownColor, color: 고대비 ? '#000' : '#FFF', fontSize: '28px', fontWeight: 'bold', border: 'none', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>

              <button onClick={() => setIsOpen(false)} style={{ background: grayBtnColor, color: '#000', border: 'none', padding: '16px 50px', borderRadius: '10px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}