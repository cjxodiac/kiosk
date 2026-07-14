import { useState } from 'react';
import { useKiosk } from '../context/KioskContext';

export function Header() {
  const { 화면, 처음으로, 접근성, 모드, set모드, 접근성업데이트, 안내, 언어, 배프모드, set배프모드 } = useKiosk();
  const [직원호출팝업, set직원호출팝업] = useState(false);
  const [배리어프리팝업, set배리어프리팝업] = useState(false);
  const [음성안내팝업, set음성안내팝업] = useState(false);
  const [음량, set음량] = useState(3);
  const [속도, set속도] = useState(1.0);

  const 배율맵 = { normal: 1, large: 1.3, xlarge: 1.6 };
  const 배율 = 배율맵[접근성?.글씨크기 || 'normal'];
  const 바배율 = 1; // 상단 헤더 바 자체는 글씨크기 설정과 무관하게 항상 고정 크기 유지
  const 고대비 = 접근성?.고대비 || false;
  const 낮은화면 = 접근성?.휠체어 || false;

  const yellowColor = '#CDE000';
  const brownColor = '#3E2723';

  const t = {
    barrierBtn:    { ko: '배리어프리 모드',          en: 'Accessibility',               ja: 'バリアフリー',           zh: '无障碍模式' },
    staffBtn:      { ko: '직원호출',                 en: 'Call Staff',                  ja: 'スタッフ呼出',           zh: '呼叫员工' },
    staffConfirm:  { ko: '직원을 호출하시겠습니까?', en: 'Call a staff member?',         ja: 'スタッフを呼びますか？', zh: '您要呼叫员工吗？' },
    yes:           { ko: '예',                       en: 'Yes',                         ja: 'はい',                   zh: '是' },
    no:            { ko: '아니오',                   en: 'No',                          ja: 'いいえ',                 zh: '否' },
    barrierTitle:  { ko: '어떤 안내가 필요하세요?',  en: 'What assistance do you need?', ja: 'どんなご案内が必要ですか？', zh: '您需要什么帮助？' },
    voiceGuide:    { ko: '음성 안내',                en: 'Voice Guide',                 ja: '音声案内',               zh: '语音引导' },
    signGuide:     { ko: '수어 안내',                en: 'Sign Language',               ja: '手話案内',               zh: '手语引导' },
    volumeTitle:   { ko: '음량 조절',                en: 'Volume',                      ja: '音量調整',               zh: '音量调节' },
    speedTitle:    { ko: '속도',                     en: 'Speed',                       ja: '速度',                   zh: '速度' },
    confirm:       { ko: '확인',                     en: 'Confirm',                     ja: '確認',                   zh: '确認' },
  };

  if (화면 === '초기') {
    return (
      <div style={{ width: '100%', background: 고대비 ? '#000000' : '#FFFFFF', flexShrink: 0 }} />
    );
  }

  return (
    <>
      {/* 헤더 바 */}
      <div style={{
        width: '100%',
        background: 고대비 ? '#000000' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${10 * 바배율}px ${20 * 바배율}px`,
        flexShrink: 0,
        height: 낮은화면 ? `${80 * 바배율}px` : `${149 * 바배율}px`,
        boxSizing: 'border-box',
        borderBottom: `1px solid ${고대비 ? '#FFEB3B' : '#CCC'}`,
        position: 'relative',
        zIndex: 100,
      }}>
        {/* 왼쪽: 홈버튼 */}
        <button onClick={처음으로} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '30px' }}>
          <img src="Icon.png" alt="홈" style={{ height: `${50 * 바배율}px`, objectFit: 'contain' }} />
        </button>

        {/* 가운데: 배프 토글 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: `${18 * 바배율}px`, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <img src="bef1.png" alt="배프" style={{ width: `${72 * 바배율}px`, height: `${72 * 바배율}px`, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontSize: `${26 * 바배율}px`, fontWeight: 'bold', color: 고대비 ? '#FFEB3B' : '#333', whiteSpace: 'nowrap' }}>
            배프가 도와드리고 있어요!
          </span>
          <div
            onClick={() => set배프모드(v => !v)}
            style={{
              width: `${104 * 바배율}px`,
              height: `${52 * 바배율}px`,
              borderRadius: '26px',
              background: 배프모드 ? '#CDE000' : '#CCC',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: `${42 * 바배율}px`,
              height: `${42 * 바배율}px`,
              borderRadius: '50%',
              background: '#FFF',
              position: 'absolute',
              left: 배프모드 ? `${57 * 바배율}px` : `${5 * 바배율}px`,
              transition: 'left 0.2s',
            }} />
            <span style={{
              position: 'absolute',
              left: 배프모드 ? '10px' : 'auto',
              right: 배프모드 ? 'auto' : '10px',
              fontSize: `${18 * 바배율}px`,
              fontWeight: 'bold',
              color: 배프모드 ? '#000' : '#FFF',
              userSelect: 'none',
            }}>
              {배프모드 ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* 오른쪽: 버튼들 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: `${12 * 바배율}px` }}>
          {낮은화면 && 모드 !== '쉬운' && (
            <button onClick={() => set배리어프리팝업(true)} style={{
              padding: `${14 * 바배율}px ${28 * 바배율}px`,
              borderRadius: '30px',
              background: '#FF9900',
              color: '#FFF',
              fontSize: `${22 * 바배율}px`,
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
            }}>
              {t.barrierBtn[언어]}
            </button>
          )}
          <button onClick={() => set직원호출팝업(true)} style={{
            padding: `${14 * 바배율}px ${28 * 바배율}px`,
            borderRadius: '30px',
            background: '#FF9900',
            color: '#FFF',
            fontSize: `${22 * 바배율}px`,
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}>
            {t.staffBtn[언어]}
          </button>
        </div>
      </div>

      {/* 직원호출 팝업 */}
      {직원호출팝업 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 낮은화면 ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 2000, paddingBottom: 낮은화면 ? '5vh' : '0' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: `${500 * 배율}px`, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ background: brownColor, padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => set직원호출팝업(false)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: `${28 * 배율}px`, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '40px 40px 50px', textAlign: 'center' }}>
              <p style={{ fontSize: `${26 * 배율}px`, fontWeight: 'bold', marginBottom: '40px', color: '#000' }}>
                {t.staffConfirm[언어]}
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => { set직원호출팝업(false); 안내('직원을 호출합니다'); }} style={{ width: `${160 * 배율}px`, height: `${80 * 배율}px`, background: '#FF7A00', border: 'none', borderRadius: '12px', fontSize: `${28 * 배율}px`, fontWeight: 'bold', cursor: 'pointer', color: '#FFF' }}>
                  {t.yes[언어]}
                </button>
                <button onClick={() => set직원호출팝업(false)} style={{ width: `${160 * 배율}px`, height: `${80 * 배율}px`, background: '#D0D0D0', border: 'none', borderRadius: '12px', fontSize: `${28 * 배율}px`, fontWeight: 'bold', cursor: 'pointer' }}>
                  {t.no[언어]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배리어프리 팝업 */}
      {배리어프리팝업 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 낮은화면 ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 2000, paddingBottom: 낮은화면 ? '5vh' : '0' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', minWidth: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: `${20 * 배율}px`, fontWeight: 'bold', color: '#000' }}>{t.barrierTitle[언어]}</span>
              <button onClick={() => set배리어프리팝업(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => { set배리어프리팝업(false); 안내('음성 안내 배리어프리 모드로 전환합니다'); }} style={{ flex: 1, padding: '24px 16px', background: '#F5F5F5', border: '2px solid #E0E0E0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: '#000' }}>
                <span style={{ fontSize: '40px' }}>🔈</span>
                {t.voiceGuide[언어]}
              </button>
              <button onClick={() => { set배리어프리팝업(false); 안내('수어 안내 배리어프리 모드로 전환합니다'); }} style={{ flex: 1, padding: '24px 16px', background: '#F5F5F5', border: '2px solid #E0E0E0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: `${16 * 배율}px`, fontWeight: 'bold', color: '#000' }}>
                <span style={{ fontSize: '40px' }}>🤟</span>
                {t.signGuide[언어]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 음성안내 팝업 */}
      {음성안내팝업 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 낮은화면 ? 'flex-end' : 'center', justifyContent: 'center', paddingBottom: 낮은화면 ? '5vh' : '0' }}>
          <div style={{ width: '600px', maxWidth: '92vw', background: '#E9DFD9', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #969696' }}>
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
    </>
  );
}