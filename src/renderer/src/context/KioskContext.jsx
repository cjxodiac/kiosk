import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { categories as rawCategories } from '../data/categories';
import { menus as rawMenus } from '../data/menus';
import { optionGroups } from '../data/options';

const KioskContext = createContext();

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

function getAccessibilityList(접근성) {
  const opts = [];
  if (!접근성) return opts;
  if (접근성.휠체어) opts.push('휠체어');
  if (접근성.고대비) opts.push('고대비');
  if (접근성.음성안내) opts.push('음성안내');
  if (접근성.수어모드) opts.push('수어');
  if (접근성.자막) opts.push('자막');
  if (접근성.글씨크기 && 접근성.글씨크기 !== 'normal') opts.push(`글씨${접근성.글씨크기}`);
  return opts;
}

function areOptionsEqual(opt1, opt2) {
  if (!opt1 && !opt2) return true;
  if (!opt1 || !opt2) return false;
  if (opt1.length !== opt2.length) return false;
  const ids1 = opt1.map(o => o.id).sort();
  const ids2 = opt2.map(o => o.id).sort();
  return ids1.every((id, index) => id === ids2[index]);
}

export function KioskProvider({ children }) {
  const [모드, set모드] = useState('일반');
  const [언어, set언어] = useState('ko');
  const [화면, set화면] = useState('초기');
  const [매장구분, set매장구분] = useState(null);
  const [배프모드, set배프모드] = useState(false);
  // 배프모드는 "일반주문" 모드 위에서만 실제로 작동함 (배리어프리/쉬운 모드 확장은 추후 진행)
  const 배프활성 = 배프모드 && 모드 === '일반';
  const [배프안내닫힘, set배프안내닫힘] = useState(false);
  const [쉬운모드제안, set쉬운모드제안] = useState(false);
  const [세션경고, set세션경고] = useState(false); // 20초 무터치 시 초기화면 복귀 경고 팝업
  const sessionIdleRef = useRef({ idleTimer: null, warnTimer: null });
  const behaviorRef = useRef({ clickLog: [], suggested: false, idleTimer: null });
  const [장바구니, set장바구니] = useState([]);
  const [주문결과, set주문결과] = useState(null);

  const [categories] = useState(rawCategories);
  const [menus] = useState(rawMenus);
  const [menusLoaded, setMenusLoaded] = useState(true);

  const getLocalizedName = useCallback((item) => {
    if (!item || !item.name) return '';
    return typeof item.name === 'object' ? (item.name[언어] || item.name.ko) : item.name;
  }, [언어]);

  const getLocalizedMenuName = useCallback((menu) => getLocalizedName(menu), [getLocalizedName]);
  const getLocalizedCategoryName = useCallback((cat) => getLocalizedName(cat), [getLocalizedName]);
  const getLocalizedOptionName = useCallback((opt) => getLocalizedName(opt), [getLocalizedName]);

  const refreshMenus = useCallback(async () => { }, []);
  const getMenuById = useCallback((id) => menus.find(m => m.id === id), [menus]);
  const getMenusByCategoryId = useCallback((catId) => menus.filter(m => m.categoryId === catId), [menus]);

  const [접근성, set접근성] = useState({
    글씨크기: 'normal', 고대비: false, 휠체어: false,
    음성안내: false, 수어모드: false, 자막: false,
    음량: 1.0, 속도: 0.9,
  });

  const 마지막텍스트 = useRef('');
  const [현재자막, set현재자막] = useState('');
  const sessionIdRef = useRef(null);
  const clickCountRef = useRef(0);
  const idleTimerRef = useRef(null);
  const firstModeRef = useRef(true);
  const firstAccRef = useRef(true);

  const startNewSession = useCallback((mode = '일반', accessibility = {}) => {
    const newId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionIdRef.current = newId;
    window.api?.analytics.startSession({ sessionId: newId, mode, accessibilityOptions: getAccessibilityList(accessibility), storeType: null });
  }, []);

  const endCurrentSession = useCallback((opts = {}) => {
    if (!sessionIdRef.current) return;
    window.api?.analytics.endSession({ sessionId: sessionIdRef.current, ...opts });
  }, []);

  const track = useCallback((type, screen, payload) => {
    if (!sessionIdRef.current) return;
    window.api?.analytics.trackEvent({ sessionId: sessionIdRef.current, type, screen: screen || null, payload: payload || {} });
  }, []);

  const 접근성업데이트 = useCallback((key, value) => { set접근성(prev => ({ ...prev, [key]: value })); }, []);

  const 안내 = useCallback((텍스트) => {
    마지막텍스트.current = 텍스트; set현재자막(텍스트);
    if (접근성.음성안내) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(텍스트);
      u.lang = 'ko-KR'; u.rate = 접근성.속도; u.volume = 접근성.음량;
      window.speechSynthesis.speak(u);
    }
    setTimeout(() => set현재자막(prev => prev === 텍스트 ? '' : prev), 5000);
  }, [접근성.음성안내, 접근성.속도, 접근성.음량]);

  const 다시듣기 = () => { if (마지막텍스트.current) 안내(마지막텍스트.current); };
  const 음성중지 = () => { window.speechSynthesis.cancel(); set현재자막(''); };

  const [장바구니토스트, set장바구니토스트] = useState(null); // { menuName } | null
  const 토스트타이머Ref = useRef(null);

  const 장바구니추가 = (item) => {
    set장바구니(p => {
      const existingItemIndex = p.findIndex(cartItem =>
        cartItem.menuId === item.menuId && areOptionsEqual(cartItem.options, item.options)
      );
      if (existingItemIndex > -1) {
        const newCart = [...p];
        const currentQty = newCart[existingItemIndex].qty || 1;
        const addQty = item.qty || 1;
        newCart[existingItemIndex] = { ...newCart[existingItemIndex], qty: currentQty + addQty };
        return newCart;
      } else {
        return [...p, { ...item, qty: item.qty || 1, uid: Date.now() }];
      }
    });
    track('cart_add', 화면, item);

    // 장바구니 담김 토스트 팝업
    const 메뉴 = menus.find(m => m.id === item.menuId);
    if (메뉴) {
      if (토스트타이머Ref.current) clearTimeout(토스트타이머Ref.current);
      set장바구니토스트({ menuName: getLocalizedMenuName(메뉴) });
      토스트타이머Ref.current = setTimeout(() => set장바구니토스트(null), 1800);
    }
  };

  const 장바구니수정 = (uid, qty) => { if (qty <= 0) set장바구니(p => p.filter(i => i.uid !== uid)); else set장바구니(p => p.map(i => i.uid === uid ? { ...i, qty } : i)); };
  const 장바구니제거 = (uid) => set장바구니(p => p.filter(i => i.uid !== uid));
  const 장바구니초기화 = () => set장바구니([]);

  const 처음으로 = useCallback(() => {
    endCurrentSession({ completed: 화면 === '완료', abandonedAtScreen: 화면 === '완료' ? null : 화면 });
    set화면('초기'); set매장구분(null); set모드('일반');
    장바구니초기화(); set주문결과(null); 음성중지();
    set접근성(prev => ({ ...prev, 글씨크기: 'normal' })); // 가장 작은(기본) 폰트로 초기화
    set배프모드(true); // 배프모드는 켜진 상태로 초기화
    startNewSession('일반', {});
  }, [화면, endCurrentSession, startNewSession]);

  // 20초 동안 아무 터치도 없으면 경고 팝업(3초) 후 초기화면으로 자동 복귀 - 배프모드/화면 종류와 무관하게 전역으로 동작
  const 세션타이머재시작 = useCallback(() => {
    if (sessionIdleRef.current.idleTimer) clearTimeout(sessionIdleRef.current.idleTimer);
    if (sessionIdleRef.current.warnTimer) clearTimeout(sessionIdleRef.current.warnTimer);
    set세션경고(false);
    if (화면 === '초기' || 화면 === '관리자') return; // 초기화면·관리자화면은 세션 타임아웃 불필요
    sessionIdleRef.current.idleTimer = setTimeout(() => {
      set세션경고(true);
      sessionIdleRef.current.warnTimer = setTimeout(() => {
        set세션경고(false);
        처음으로();
      }, 3000);
    }, 20000);
  }, [화면, 처음으로]);

  useEffect(() => {
    세션타이머재시작();
    return () => {
      if (sessionIdleRef.current.idleTimer) clearTimeout(sessionIdleRef.current.idleTimer);
      if (sessionIdleRef.current.warnTimer) clearTimeout(sessionIdleRef.current.warnTimer);
    };
  }, [화면, 세션타이머재시작]);

  useEffect(() => { startNewSession(모드, 접근성); return () => endCurrentSession({ completed: false }); }, []);

  // 화면이 바뀔 때, 또는 배프모드를 껐다가 다시 켤 때 안내 오버레이를 다시 보여줌
  useEffect(() => { set배프안내닫힘(false); }, [화면, 배프모드]);

  // 무반응 타이머 (재)시작 - 클릭이 있을 때마다, 화면이 바뀔 때마다 새로 10초를 잰다
  const 무반응타이머시작 = useCallback(() => {
    if (behaviorRef.current.idleTimer) clearTimeout(behaviorRef.current.idleTimer);
    if (화면 === '초기' || 모드 !== '일반' || 배프모드 || behaviorRef.current.suggested) return; // 메인화면(초기)은 제외 - 매장선택부터 적용
    behaviorRef.current.idleTimer = setTimeout(() => {
      if (!behaviorRef.current.suggested) {
        behaviorRef.current.suggested = true;
        set쉬운모드제안(true);
      }
    }, 10000);
  }, [화면, 모드, 배프모드]);

  // 화면 전환마다 행동 기록(반복클릭 로그) 초기화 + 무반응 타이머 재시작 + 제안 여부도 화면 단위로 리셋
  useEffect(() => {
    behaviorRef.current.clickLog = [];
    behaviorRef.current.suggested = false;
    무반응타이머시작();
    return () => { if (behaviorRef.current.idleTimer) clearTimeout(behaviorRef.current.idleTimer); };
  }, [화면, 모드, 배프모드, 무반응타이머시작]);

  // 클릭 패턴(반복 클릭) 기반으로도 어려움 신호를 감지 + 클릭이 있었으니 무반응 타이머는 리셋
  const 행동기록 = useCallback((key) => {
    무반응타이머시작(); // 뭔가 눌렀다 = 아직 반응이 있는 상태 → 무반응 타이머 리셋
    if (화면 === '초기' || 모드 !== '일반' || 배프모드) return; // 메인화면(초기) 제외, 일반모드에서 배프모드가 꺼져있을 때만 감지
    const log = behaviorRef.current;
    if (log.suggested) return;
    const now = Date.now();
    log.clickLog.push({ key, timestamp: now });
    log.clickLog = log.clickLog.filter(c => now - c.timestamp < 8000);

    const sameKeyCount = log.clickLog.filter(c => c.key === key).length;
    if (sameKeyCount >= 3) { // 8초 안에 같은 버튼 3번 이상 = 반복 입력 → 즉시 제안
      log.suggested = true;
      set쉬운모드제안(true);
    }
  }, [모드, 배프모드]);

  return (
    <KioskContext.Provider value={{
      모드, set모드, 언어, set언어, 화면, set화면,
      매장구분, set매장구분,
      배프모드, set배프모드, 배프활성, 배프안내닫힘, set배프안내닫힘,
      쉬운모드제안, set쉬운모드제안, 행동기록, 장바구니토스트, 세션경고, 세션타이머재시작,
      장바구니, 장바구니추가, 장바구니수정, 장바구니제거, 장바구니초기화,
      접근성, 접근성업데이트, 안내, 다시듣기, 음성중지, 현재자막, 처음으로,
      sessionIdRef, track, 주문결과, set주문결과,
      categories, menus, menusLoaded, refreshMenus,
      getMenuById, getMenusByCategoryId,
      getLocalizedMenuName, getLocalizedCategoryName, getLocalizedOptionName,
      optionGroups,
    }}>
      {children}
    </KioskContext.Provider>
  );
}

export const useKiosk = () => useContext(KioskContext);