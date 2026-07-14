import React, { useState, useEffect } from 'react';
import { useKiosk } from '../context/KioskContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ADMIN_PIN = '0000';

export function AdminScreen() {
  const { set화면 } = useKiosk();
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (input) => {
    if (input === ADMIN_PIN) { setUnlocked(true); setPinError(false); }
    else {
      setPinError(true); setPinInput('');
      setTimeout(() => setPinError(false), 1500);
    }
  };

  if (!unlocked) {
    return <PinPad value={pinInput} setValue={setPinInput} onSubmit={handlePinSubmit} error={pinError} onExit={() => set화면('초기')} />;
  }
  return <Dashboard onExit={() => set화면('초기')} />;
}

// =================== PIN 입력 ===================
function PinPad({ value, setValue, onSubmit, error, onExit }) {
  const handleNum = (n) => {
    const next = (value + n).slice(0, 4);
    setValue(next);
    if (next.length === 4) onSubmit(next);
  };
  const handleBack = () => setValue(value.slice(0, -1));
  const handleClear = () => setValue('');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a', color: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
      <button onClick={onExit} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#FFF', fontSize: '32px', cursor: 'pointer' }}>✕</button>
      <h1 style={{ fontSize: '36px', margin: 0 }}>관리자 모드</h1>
      <p style={{ fontSize: '20px', color: '#aaa', margin: 0 }}>비밀번호 4자리를 입력하세요</p>
      <div style={{ display: 'flex', gap: '20px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: '60px', height: '60px', borderRadius: '50%', background: i < value.length ? (error ? '#ff5555' : '#9eef00') : '#333', transition: 'background 0.2s' }} />
        ))}
      </div>
      {error && <div style={{ color: '#ff5555', fontSize: '18px' }}>비밀번호가 일치하지 않습니다</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '12px', marginTop: '20px' }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (<button key={n} onClick={() => handleNum(String(n))} style={pinBtnStyle}>{n}</button>))}
        <button onClick={handleClear} style={{...pinBtnStyle, fontSize: '18px'}}>CLR</button>
        <button onClick={() => handleNum('0')} style={pinBtnStyle}>0</button>
        <button onClick={handleBack} style={{...pinBtnStyle, fontSize: '24px'}}>←</button>
      </div>
    </div>
  );
}

const pinBtnStyle = { width: '100px', height: '100px', borderRadius: '50%', background: '#333', color: '#FFF', fontSize: '32px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };

// =================== 대시보드 ===================
function Dashboard({ onExit }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [allTime, setAllTime] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);
  const [recipeModalMenu, setRecipeModalMenu] = useState(null);
  const [testPrinting, setTestPrinting] = useState(false);
  const [menuEditorMenu, setMenuEditorMenu] = useState(null);

  const loadAll = async () => {
    try {
      const [s, a, o, ing, mns, cats] = await Promise.all([
        window.api.admin.getTodayStats(),
        window.api.admin.getAllTimeStats(),
        window.api.admin.getRecentOrders(20),
        window.api.menu.getIngredients(),
        window.api.menu.getMenus(),
        window.api.menu.getCategories(),
      ]);
      setStats(s); setAllTime(a); setOrders(o); setIngredients(ing); setMenus(mns); setCategories(cats);
    } catch (e) { console.error(e); }
  };

  const reloadIngredients = async () => {
    try {
      const [ing, mns] = await Promise.all([window.api.menu.getIngredients(), window.api.menu.getMenus()]);
      setIngredients(ing); setMenus(mns);
    } catch (e) { console.error(e); }
  };

  const reloadMenus = async () => {
    try { setMenus(await window.api.menu.getMenus()); } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAdjustStock = async (id, delta) => {
    try { await window.api.menu.adjustStock(id, delta); reloadIngredients(); }
    catch (e) { setMessage('❌ 재고 조정 실패: ' + e.message); }
  };

  const handleSetStock = async (id, value) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) { setMessage('❌ 0 이상의 숫자를 입력하세요'); return; }
    try { await window.api.menu.setStock(id, n); reloadIngredients(); }
    catch (e) { setMessage('❌ 재고 설정 실패: ' + e.message); }
  };

  const handleCreateIngredient = async (data) => {
    if (!data.name?.trim()) { setMessage('❌ 재료 이름을 입력하세요'); return; }
    try {
      const res = await window.api.menu.createIngredient(data);
      if (res?.success) { setMessage('✅ 재료가 추가되었습니다'); reloadIngredients(); }
      else { setMessage('❌ ' + (res?.error || '추가 실패')); }
    } catch (e) { setMessage('❌ 재료 추가 실패: ' + e.message); }
  };

  const handleDeleteIngredient = async (id, name) => {
  if (!window.confirm(`'${name}' 재료를 삭제하시겠습니까?\n이 재료를 사용하는 메뉴의 레시피에 영향을 줄 수 있습니다.`)) return;
  try {
    // 백엔드 API에 재료 삭제 요청 (API 명칭은 환경에 맞게 확인 필요)
    await window.api.menu.deleteIngredient(id);
    setMessage('✅ 재료가 삭제되었습니다');
    reloadIngredients();
  } catch (e) { setMessage('❌ 재료 삭제 실패: ' + e.message); }
};

  const handleUpdateIngredient = async (id, data) => {
    try {
      // 백엔드 API에 재료 정보 업데이트 요청
     await window.api.menu.updateIngredient(id, data);
      setMessage('✅ 재료 정보가 수정되었습니다');
      reloadIngredients();
      } catch (e) { setMessage('❌ 재료 수정 실패: ' + e.message); }
};

  const handleToggleSoldOut = async (id, newValue) => {
    try { await window.api.menu.toggleSoldOut(id, newValue); reloadMenus(); }
    catch (e) { setMessage('❌ 품절 변경 실패: ' + e.message); }
  };

  const handleDeleteMenu = async (menu) => {
    if (!window.confirm(`'${menu.name}' 메뉴를 삭제하시겠습니까?\n레시피도 함께 삭제됩니다.`)) return;
    try {
      await window.api.menu.delete(menu.id);
      setMessage('✅ 메뉴가 삭제되었습니다');
      reloadIngredients();
    } catch (e) { setMessage('❌ 삭제 실패: ' + e.message); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await window.api.admin.exportCsv();
      if (result.success) {
        setMessage(`✅ 저장 완료!\n${result.dir}\n\nsessions: ${result.counts.sessions}건\nevents: ${result.counts.events}건\norders: ${result.counts.orders}건`);
      } else if (!result.canceled) setMessage('❌ 저장 실패');
    } catch (e) { setMessage('❌ 오류: ' + e.message); }
    setExporting(false);
  };

  const handleClear = async () => {
    if (!window.confirm('정말로 모든 분석 데이터(세션/이벤트/주문)를 삭제하시겠습니까?\n복구할 수 없습니다.')) return;
    if (!window.confirm('한 번 더 확인합니다. 진짜 삭제할까요?')) return;
    try {
      await window.api.admin.clearAllData();
      setMessage('✅ 데이터가 모두 삭제되었습니다');
      loadAll();
    } catch (e) { setMessage('❌ 삭제 실패: ' + e.message); }
  };

  const handleTestPrint = async () => {
    setTestPrinting(true);
    try {
      const result = await window.api.printer.test();
      if (result.success) setMessage('✅ 영수증 출력 성공!\n프린터를 확인하세요.');
      else setMessage(`❌ 출력 실패: ${result.error || '알 수 없는 오류'}`);
    } catch (e) { setMessage('❌ 출력 오류: ' + e.message); }
    setTestPrinting(false);
  };

  const handleSeedDemo = async () => {
    if (!window.confirm('데모용 가짜 세션/주문 30건을 생성합니다.\n계속할까요?')) return;
    try {
      const r = await window.api.admin.seedDemoData();
      setMessage(`✅ 데모 데이터 ${r.count}건 생성 완료!\n런타임 탭에서 확인하세요.`);
      loadAll();
    } catch (e) { setMessage('❌ 데모 생성 실패: ' + e.message); }
  };

  const modeStats = { 일반: { count: 0, total: 0 }, 쉬운: { count: 0, total: 0 } };
  stats?.byMode?.forEach(r => { if (modeStats[r.mode]) modeStats[r.mode] = { count: r.count, total: r.total }; });
  const accStats = { 안씀: 0, 씀: 0 };
  stats?.byAccessibility?.forEach(r => { if (r.used_accessibility === 1) accStats.씀 = r.count; else accStats.안씀 = r.count; });

  const lowStockCount = ingredients.filter(i => i.isLowStock).length;
  const manualSoldOutCount = menus.filter(m => m.manualSoldOut).length;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: '#FFF', borderBottom: '1px solid #DDD' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>관리자 대시보드</h1>
        <button onClick={onExit} style={{ padding: '10px 24px', background: '#666', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>홈으로 ✕</button>
      </div>

      <div style={{ display: 'flex', background: '#FFF', borderBottom: '1px solid #DDD', padding: '0 30px', gap: '4px', overflowX: 'auto' }}>
        <TabBtn label="📊 통계" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <TabBtn label="🕐 런타임" active={activeTab === 'runtime'} onClick={() => setActiveTab('runtime')} />
        <TabBtn label="🤖 추천" active={activeTab === 'recommend'} onClick={() => setActiveTab('recommend')} />
        <TabBtn label="📦 재료" active={activeTab === 'ingredients'} onClick={() => setActiveTab('ingredients')} badge={lowStockCount > 0 ? lowStockCount : null} />
        <TabBtn label="☕ 메뉴" active={activeTab === 'menus'} onClick={() => setActiveTab('menus')} badge={manualSoldOutCount > 0 ? manualSoldOutCount : null} />
        <TabBtn label="📋 주문" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <TabBtn label="💾 데이터" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        <TabBtn label="⚙️ 설정" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '30px' }}>
        
        {activeTab === 'stats' && (
          <>
            <Section title={`오늘 매출 (${stats?.today || '...'})`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <StatCard label="주문 건수" value={stats?.orders?.count ?? 0} unit="건" />
                <StatCard label="총 매출" value={stats?.orders?.total ?? 0} unit="원" big />
              </div>
            </Section>
            <Section title="모드별 비교 (오늘)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <ModeCard label="일반 모드" count={modeStats.일반.count} total={modeStats.일반.total} color="#666" />
                <ModeCard label="배리어프리 모드" count={modeStats.쉬운.count} total={modeStats.쉬운.total} color="#CDE000" />
              </div>
              <div style={{ marginTop: '16px', fontSize: '15px', color: '#666' }}>
                배리어프리 옵션 사용: <strong>{accStats.씀}건</strong> / 미사용: <strong>{accStats.안씀}건</strong>
              </div>
            </Section>
            <Section title="오늘 세션">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <StatCard label="총 세션" value={stats?.sessions?.total ?? 0} unit="회" />
                <StatCard label="완료한 주문" value={stats?.sessions?.completed ?? 0} unit="회" />
                <StatCard label="배리어프리 사용" value={stats?.sessions?.withAccessibility ?? 0} unit="회" />
              </div>
            </Section>
            <Section title="누적 통계 (전체 기간)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <StatCard label="누적 주문" value={allTime?.orders?.count ?? 0} unit="건" />
                <StatCard label="누적 매출" value={allTime?.orders?.total ?? 0} unit="원" />
                <StatCard label="누적 세션" value={allTime?.sessions?.total ?? 0} unit="회" />
              </div>
            </Section>
          </>
        )}

        {activeTab === 'runtime' && <RuntimeTab />}
        {activeTab === 'recommend' && <RecommendTab />}

        {activeTab === 'ingredients' && (
      <Section title={`재료 재고 관리 ${lowStockCount > 0 ? `(${lowStockCount}개 부족!)` : ''}`}>
       <IngredientCreateForm onCreate={handleCreateIngredient} />
        <div style={{ background: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
          {ingredients.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>재료가 없습니다.</div>}
          {ingredients.slice().sort((a, b) => (b.isLowStock ? 1 : 0) - (a.isLowStock ? 1 : 0)).map(ing => (
            <IngredientRow 
             key={ing.id} 
             ingredient={ing} 
             onAdjust={handleAdjustStock} 
             onSet={handleSetStock} 
             onDelete={handleDeleteIngredient} // ◀ 추가됨
              onUpdate={handleUpdateIngredient} // ◀ 추가됨
            />
          ))}
        </div>
        </Section>
        )}

        {activeTab === 'menus' && (
          <Section title="메뉴 관리">
            <button onClick={() => setMenuEditorMenu({})}
              style={{ marginBottom: '16px', padding: '12px 24px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              ＋ 새 메뉴 추가
            </button>
            <div style={{ background: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
              {menus.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>메뉴가 없습니다.</div>}
              {menus.map(menu => (
                <MenuRow key={menu.id} menu={menu} 
                  onToggleSoldOut={handleToggleSoldOut} 
                  onEditRecipe={() => setRecipeModalMenu(menu)}
                  onEditMenu={() => setMenuEditorMenu(menu)}
                  onDeleteMenu={() => handleDeleteMenu(menu)} />
              ))}
            </div>
          </Section>
        )}

        {activeTab === 'orders' && (
          <Section title="최근 주문 20건">
            <div style={{ background: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#EEE' }}>
                  <tr>
                    <th style={thStyle}>주문#</th><th style={thStyle}>날짜</th><th style={thStyle}>금액</th>
                    <th style={thStyle}>수량</th><th style={thStyle}>결제</th><th style={thStyle}>모드</th><th style={thStyle}>배리어프리</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>주문 없음</td></tr>}
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderTop: '1px solid #EEE' }}>
                      <td style={tdStyle}>#{o.order_number}</td>
                      <td style={tdStyle}>{o.order_date}</td>
                      <td style={tdStyle}>₩{(o.total ?? 0).toLocaleString()}</td>
                      <td style={tdStyle}>{o.item_count}</td>
                      <td style={tdStyle}>{o.payment_method === 'card' ? '카드' : '간편'}</td>
                      <td style={tdStyle}>{o.mode}</td>
                      <td style={tdStyle}>{o.used_accessibility ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {activeTab === 'data' && (
          <>
            <Section title="데이터 내보내기">
              <button onClick={handleExport} disabled={exporting} style={{ padding: '20px 40px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', opacity: exporting ? 0.5 : 1 }}>
                {exporting ? '저장 중...' : '📥 CSV 3개 파일로 저장'}
              </button>
            </Section>
            <Section title="🎲 데모용 가짜 데이터">
              <button onClick={handleSeedDemo} style={{ padding: '16px 32px', background: '#FF9800', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                🎲 가짜 세션·주문 30건 생성 (발표 시연용)
              </button>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                일반/배리어프리 모드 섞어서 30건 생성. 런타임 탭에서 차트로 확인 가능.
              </div>
            </Section>
            <Section title="⚠️ 위험 영역">
              <button onClick={handleClear} style={{ padding: '16px 32px', background: '#ff5555', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                🗑️ 모든 분석 데이터 초기화
              </button>
            </Section>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <Section title="🖨️ 영수증 프린터">
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px' }}>
                <button onClick={handleTestPrint} disabled={testPrinting} style={{ padding: '16px 32px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', opacity: testPrinting ? 0.5 : 1 }}>
                  {testPrinting ? '출력 중...' : '🖨️ 테스트 영수증 출력'}
                </button>
              </div>
            </Section>
            <Section title="🏪 가게 정보">
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px', fontSize: '14px', color: '#444', lineHeight: 1.8 }}>
                <div><strong>상호:</strong> BLOOM 카페</div>
                <div><strong>주소:</strong> 서울특별시 강남구 테헤란로 152</div>
                <div><strong>전화:</strong> 02-1234-5678</div>
              </div>
            </Section>
          </>
        )}
      </div>

      {recipeModalMenu && <RecipeEditorModal menu={recipeModalMenu} ingredients={ingredients} onClose={() => { setRecipeModalMenu(null); reloadIngredients(); }} />}
      {menuEditorMenu !== null && <MenuEditorModal menu={menuEditorMenu} categories={categories} onClose={() => { setMenuEditorMenu(null); reloadIngredients(); }} onSaved={(msg) => setMessage(msg)} />}

      {message && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#FFF', padding: '20px 30px', borderRadius: '8px', whiteSpace: 'pre-wrap', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 9999, maxWidth: '500px' }}>
          {message}
          <button onClick={() => setMessage(null)} style={{ marginLeft: '20px', background: 'transparent', color: '#FFF', border: '1px solid #FFF', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>확인</button>
        </div>
      )}
    </div>
  );
}

// =================== 🕐 런타임 탭 ===================
function RuntimeTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, dist, aband, orders] = await Promise.all([
        window.api.admin.getRuntimeStats(),
        window.api.admin.getRuntimeDistribution(),
        window.api.admin.getAbandonmentStats(),
        window.api.admin.getOrderRuntimes(50),
      ]);
      setData({ stats, dist, aband, orders });
    } catch (e) { console.error('런타임 로드 실패:', e); }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>로딩 중...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>데이터 로드 실패</div>;

  // 모드별 통계
  const normalStat = data.stats.byMode.find(s => s.mode === '일반') || {};
  const bfStat = data.stats.byMode.find(s => s.mode === '쉬운') || {};
  const normalAvg = normalStat.avg_seconds || 0;
  const bfAvg = bfStat.avg_seconds || 0;
  const diffPct = normalAvg > 0 ? ((bfAvg - normalAvg) / normalAvg * 100).toFixed(1) : '0';

  // 모드 비교 막대그래프
  const modeChartData = [
    { name: '일반', '평균 시간(초)': Number(normalAvg.toFixed(1)), '평균 클릭수': Number((normalStat.avg_clicks || 0).toFixed(1)) },
    { name: '배리어프리', '평균 시간(초)': Number(bfAvg.toFixed(1)), '평균 클릭수': Number((bfStat.avg_clicks || 0).toFixed(1)) },
  ];

  // 시간 분포 히스토그램
  const buckets = {};
  data.dist.forEach(d => {
    const key = d.bucket;
    if (!buckets[key]) buckets[key] = { bucket: `${d.bucket}-${d.bucket+15}초`, sortKey: d.bucket };
    buckets[key][d.mode === '쉬운' ? '배리어프리' : '일반'] = d.count;
  });
  const distData = Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey);

  // 이탈 화면 분석
  const abandByScreen = {};
  data.aband.forEach(a => {
    if (!abandByScreen[a.abandoned_at_screen]) abandByScreen[a.abandoned_at_screen] = { screen: a.abandoned_at_screen };
    abandByScreen[a.abandoned_at_screen][a.mode === '쉬운' ? '배리어프리' : '일반'] = a.count;
  });
  const abandData = Object.values(abandByScreen);

  // 완료율
  const normalComp = data.stats.completionRate.find(r => r.mode === '일반') || { total_sessions: 0, completed_count: 0 };
  const bfComp = data.stats.completionRate.find(r => r.mode === '쉬운') || { total_sessions: 0, completed_count: 0 };
  const normalRate = normalComp.total_sessions ? (normalComp.completed_count / normalComp.total_sessions * 100).toFixed(1) : '0';
  const bfRate = bfComp.total_sessions ? (bfComp.completed_count / bfComp.total_sessions * 100).toFixed(1) : '0';

  const hasData = (normalStat.total_completed || bfStat.total_completed || 0) > 0;

  return (
    <>
      {!hasData && (
        <div style={{ padding: '20px', background: '#FFF3CD', color: '#856404', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠ 완료된 세션 데이터가 없습니다. <strong>💾 데이터 탭 → "🎲 가짜 데이터 30건 생성"</strong> 클릭해서 데모 데이터를 만드세요.
        </div>
      )}

      <Section title="🎯 모드별 핵심 지표">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <BigStatCard label="일반 평균 시간" value={formatDuration(normalAvg)} sub={`${normalStat.total_completed || 0}건 완료`} color="#888" />
          <BigStatCard label="배리어프리 평균" value={formatDuration(bfAvg)} sub={`${bfStat.total_completed || 0}건 완료`} color="#9eef00" />
          <BigStatCard label="시간 차이" value={`${diffPct >= 0 ? '+' : ''}${diffPct}%`} sub={diffPct > 0 ? "배리어프리가 더 걸림" : "일반이 더 걸림"} color={Math.abs(diffPct) > 30 ? '#FF9800' : '#4CAF50'} />
        </div>
      </Section>

      <Section title="모드별 평균 비교 (완료 시간 + 클릭수)">
        <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: '초', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: '클릭', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="평균 시간(초)" fill="#9eef00" />
              <Bar yAxisId="right" dataKey="평균 클릭수" fill="#0077CC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="완료 시간 분포 (15초 단위)">
        <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px' }}>
          {distData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>완료된 주문이 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis label={{ value: '세션 수', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="일반" fill="#888" />
                <Bar dataKey="배리어프리" fill="#9eef00" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Section>

      <Section title="완료율 비교">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <CompletionCard mode="일반 모드" rate={normalRate} total={normalComp.total_sessions} completed={normalComp.completed_count} color="#888" />
          <CompletionCard mode="배리어프리 모드" rate={bfRate} total={bfComp.total_sessions} completed={bfComp.completed_count} color="#9eef00" />
        </div>
      </Section>

      {abandData.length > 0 && (
        <Section title="이탈 화면 분석 (완료하지 못한 세션)">
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={abandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="screen" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="일반" fill="#888" />
                <Bar dataKey="배리어프리" fill="#FF5555" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      <Section title="주문별 상세 (최근 50건)">
        <div style={{ background: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#EEE' }}>
              <tr>
                <th style={thStyle}>주문#</th><th style={thStyle}>시각</th><th style={thStyle}>모드</th>
                <th style={thStyle}>배리어프리</th><th style={thStyle}>클릭수</th><th style={thStyle}>소요시간</th><th style={thStyle}>금액</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>주문 없음</td></tr>
              ) : (
                data.orders.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid #EEE' }}>
                    <td style={tdStyle}>#{o.order_number}</td>
                    <td style={tdStyle}>{o.created_at ? new Date(o.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td style={{...tdStyle, fontWeight: o.mode === '쉬운' ? 'bold' : 'normal', color: o.mode === '쉬운' ? '#558B00' : '#666' }}>{o.mode}</td>
                    <td style={tdStyle}>{o.used_accessibility ? '✓' : ''}</td>
                    <td style={tdStyle}>{o.click_count ?? '-'}</td>
                    <td style={{...tdStyle, fontWeight: 'bold', color: '#0077CC' }}>{formatDuration(o.duration_seconds)}</td>
                    <td style={tdStyle}>₩{(o.total ?? 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {hasData && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#E3F2FD', borderRadius: '8px', fontSize: '13px', color: '#1565C0', lineHeight: 1.6 }}>
          💡 <strong>발표 포인트:</strong> 배리어프리 모드는 평균 {diffPct}% 시간이 더 걸리지만 (일반 {formatDuration(normalAvg)} vs 배리어프리 {formatDuration(bfAvg)}), 시각/청각/지체 장애인이 키오스크 사용 자체가 가능해집니다. 시간 비용 대비 접근성 가치를 측정한 것이 이 데이터의 의의입니다.
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={loadData} style={{ padding: '10px 20px', background: '#666', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>🔄 새로고침</button>
      </div>
    </>
  );
}

// =================== 🤖 추천 탭 ===================
function RecommendTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await window.api.recommendation.getDebugStats();
      setData(stats);
    } catch (e) { console.error('추천 통계 로드 실패:', e); }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>로딩 중...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>데이터 로드 실패</div>;

  const hasData = data.orderCount > 0;

  return (
    <>
      {!hasData && (
        <div style={{ padding: '20px', background: '#FFF3CD', color: '#856404', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠ 집계할 주문 데이터가 없습니다. <strong>💾 데이터 탭 → "🎲 가짜 데이터 30건 생성"</strong> 클릭해서 데모 데이터를 만드세요.
        </div>
      )}

      <Section title="🎯 추천 엔진 상태">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <BigStatCard label="집계에 사용된 주문 수" value={`${data.orderCount}건`} sub="최근 최대 500건 기준" color="#888" />
          <BigStatCard
            label="LLM 재랭킹"
            value={data.llmEnabled ? 'ON' : 'OFF (하이브리드만 사용)'}
            sub={data.llmEnabled ? 'ANTHROPIC_API_KEY 감지됨' : 'API 키 없음 → 통계 순위 그대로 사용'}
            color={data.llmEnabled ? '#4CAF50' : '#FF9800'}
          />
          <BigStatCard
            label="날씨 반영"
            value={data.weatherEnabled ? 'ON' : 'OFF'}
            sub={data.weatherEnabled ? 'OPENWEATHER_API_KEY 감지됨' : 'API 키 없음 → 날씨 카테고리 필터만 기본값으로 동작'}
            color={data.weatherEnabled ? '#4CAF50' : '#FF9800'}
          />
          <BigStatCard label="하이브리드 가중치(α)" value="0.35" sub="인기도 35% + 연관성 65%, 두 세트 동일 적용" color="#9eef00" />
        </div>
      </Section>

      <Section title="⏰ 지금 이 순간의 날씨 컨텍스트">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <BigStatCard
            label="날씨 추천 카테고리"
            value={data.context?.weatherLabel || '날씨정보 없음(기본값)'}
            sub={`인기 3개 + 날씨 3개, 항상 함께 표시`}
            color="#2E7CD6"
          />
          {data.context?.weather && (
            <BigStatCard
              label="현재 날씨"
              value={`${Math.round(data.context.weather.temp)}°C`}
              sub={data.context.weather.description || data.context.weather.condition || ''}
              color="#2E7CD6"
            />
          )}
        </div>
      </Section>

      <Section title="🏆 전체 인기 메뉴 TOP 10 (popScore 기준)">
        {data.topPopular.length === 0 ? (
          <div style={{ color: '#999', padding: '20px' }}>데이터 없음</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.topPopular.map(m => ({ name: m.name, '주문 횟수': m.count }))} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="주문 횟수" fill="#9eef00" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      <Section title="🔗 함께 많이 주문된 조합 TOP 10 (연관성 점수의 기반)">
        {data.topPairs.length === 0 ? (
          <div style={{ color: '#999', padding: '20px' }}>아직 두 개 이상 담긴 주문이 없어서 연관 데이터가 비어있어요. 주문이 쌓이면 여기 채워집니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.topPairs.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '14px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '15px', color: '#333' }}>
                  <strong>{p.a}</strong> + <strong>{p.b}</strong>
                </span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#9eef00' }}>{p.count}회 동시 주문</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={loadData} style={{ padding: '10px 20px', background: '#666', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>🔄 새로고침</button>
      </div>
    </>
  );
}

// =================== 보조 컴포넌트 ===================
function TabBtn({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 24px', background: 'transparent', border: 'none',
      borderBottom: active ? '3px solid #9eef00' : '3px solid transparent',
      color: active ? '#000' : '#888', fontSize: '17px', fontWeight: 'bold',
      cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap',
    }}>
      {label}
      {badge != null && (
        <span style={{ marginLeft: '6px', background: '#ff5555', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{badge}</span>
      )}
    </button>
  );
}

function IngredientCreateForm({ onCreate }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('개');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('');

  const submit = () => {
    onCreate({
      name: name.trim(),
      unit: unit.trim() || '개',
      stock: parseFloat(stock) || 0,
      lowStockThreshold: parseFloat(threshold) || 10,
    });
    setName(''); setStock(''); setThreshold(''); setUnit('개');
  };

  const inp = { padding: '10px', fontSize: '14px', border: '1px solid #CCC', borderRadius: '6px' };
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#FFF', padding: '14px', borderRadius: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#3D2418' }}>＋ 재료 추가</span>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="재료 이름" style={{ ...inp, width: '150px' }} />
      <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="단위 (ml, g, 개...)" style={{ ...inp, width: '130px' }} />
      <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="초기 재고" style={{ ...inp, width: '100px' }} />
      <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="부족 임계값" style={{ ...inp, width: '110px' }} />
      <button onClick={submit} disabled={!name.trim()}
        style={{ padding: '10px 22px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : 0.5 }}>
        추가
      </button>
    </div>
  );
}

function IngredientRow({ ingredient, onAdjust, onSet, onDelete, onUpdate }) {
  const [inputVal, setInputVal] = useState('');
  
  // 수정 모드 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(ingredient.name);
  const [editUnit, setEditUnit] = useState(ingredient.unit);
  const [editThreshold, setEditThreshold] = useState(ingredient.low_stock_threshold);

  const isLow = ingredient.isLowStock;

  const handleSave = () => {
    if (!editName.trim()) { alert('재료 이름을 입력해주세요.'); return; }
    onUpdate(ingredient.id, {
      name: editName.trim(),
      unit: editUnit.trim() || '개',
      lowStockThreshold: parseFloat(editThreshold) || 0
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // 원상 복구 후 닫기
    setEditName(ingredient.name);
    setEditUnit(ingredient.unit);
    setEditThreshold(ingredient.low_stock_threshold);
    setIsEditing(false);
  };

  const adjBtnStyle = (type) => ({
    padding: '6px 10px',
    border: '1px solid #CCC',
    background: type === 'plus' ? '#E8F5E9' : '#FFEBEE',
    color: type === 'plus' ? '#2E7D32' : '#C62828',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });

  // 버튼 배치를 위해 그리드 레이아웃 비율 조정 (원래 4칸 -> 5칸 확장)
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '2.5fr 1fr 1.5fr 3fr 1.5fr', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '16px 20px', 
      borderTop: '1px solid #EEE', 
      background: isLow ? '#FFF5F5' : 'transparent' 
    }}>
      
      {/* 1열: 이름 및 설정 정보 (수정 모드 분기) */}
      <div>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input 
              value={editName} 
              onChange={e => setEditName(e.target.value)} 
              placeholder="재료명" 
              style={{ padding: '4px 8px', fontSize: '14px', width: '90%' }} 
            />
            <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
              경고값: 
              <input 
                type="number" 
                value={editThreshold} 
                onChange={e => setEditThreshold(e.target.value)} 
                style={{ padding: '2px 4px', fontSize: '12px', width: '50px' }} 
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#222' }}>
              {ingredient.name} {isLow && <span style={{ color: '#ff5555', fontSize: '14px' }}>⚠ 부족</span>}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>경고 임계값: {ingredient.low_stock_threshold} {ingredient.unit}</div>
          </>
        )}
      </div>

      {/* 2열: 현재 재고 수량 */}
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: isLow ? '#ff5555' : '#333' }}>
        {ingredient.stock}{' '}
        {isEditing ? (
          <input 
            value={editUnit} 
            onChange={e => setEditUnit(e.target.value)} 
            placeholder="단위" 
            style={{ padding: '2px 4px', fontSize: '12px', width: '40px', marginLeft: '4px' }} 
          />
        ) : (
          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>{ingredient.unit}</span>
        )}
      </div>

      {/* 3열: 퀵 재고 조정 버튼 */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button onClick={() => onAdjust(ingredient.id, -10)} style={adjBtnStyle('minus')}>-10</button>
        <button onClick={() => onAdjust(ingredient.id, -1)} style={adjBtnStyle('minus')}>-1</button>
        <button onClick={() => onAdjust(ingredient.id, 1)} style={adjBtnStyle('plus')}>+1</button>
        <button onClick={() => onAdjust(ingredient.id, 10)} style={adjBtnStyle('plus')}>+10</button>
        <button onClick={() => onAdjust(ingredient.id, 100)} style={adjBtnStyle('plus')}>+100</button>
      </div>

      {/* 4열: 직접 입력 설정 */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input 
          type="number" 
          value={inputVal} 
          onChange={e => setInputVal(e.target.value)} 
          placeholder="직접 설정" 
          style={{ width: '70px', padding: '8px', fontSize: '14px', border: '1px solid #CCC', borderRadius: '4px' }} 
        />
        <button 
          onClick={() => { onSet(ingredient.id, inputVal); setInputVal(''); }} 
          disabled={!inputVal} 
          style={{ padding: '8px 12px', background: '#666', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', opacity: inputVal ? 1 : 0.5 }}
        >
          설정
        </button>
      </div>

      {/* 5열: 관리 기능 (수정/삭제/저장/취소 버튼 대폭 보완) */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} style={{ padding: '6px 12px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>저장</button>
            <button onClick={handleCancel} style={{ padding: '6px 12px', background: '#DDD', color: '#333', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>취소</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ padding: '6px 12px', background: '#ECEFF1', color: '#37474F', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>수정</button>
            <button onClick={() => onDelete(ingredient.id, ingredient.name)} style={{ padding: '6px 12px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>삭제</button>
          </>
        )}
      </div>

    </div>
  );
}

function MenuRow({ menu, onToggleSoldOut, onEditRecipe, onEditMenu, onDeleteMenu }) {
  let statusLabel, statusColor, soldOutButton;
  if (menu.manualSoldOut) {
    statusLabel = '🚫 수동 품절'; statusColor = '#ff5555';
    soldOutButton = <button onClick={() => onToggleSoldOut(menu.id, false)} style={btnSmall('#9eef00', '#000')}>품절 해제</button>;
  } else if (menu.soldOut) {
    statusLabel = '⚠ 재료부족'; statusColor = '#FF9800';
    soldOutButton = <span style={{ color: '#999', fontSize: '11px' }}>재료 보충 필요</span>;
  } else {
    statusLabel = '● 정상'; statusColor = '#4CAF50';
    soldOutButton = <button onClick={() => onToggleSoldOut(menu.id, true)} style={btnSmall('#666', '#FFF')}>품절</button>;
  }
  
  const isImagePath = menu.image && (menu.image.startsWith('data:') || menu.image.startsWith('/'));
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 0.8fr 1.3fr 0.8fr 0.8fr 0.8fr 1fr', alignItems: 'center', gap: '8px', padding: '10px 16px', borderTop: '1px solid #EEE' }}>
      <div style={{ width: '40px', height: '40px', background: '#F5F5F5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {isImagePath ? <img src={menu.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '24px' }}>{menu.image || '?'}</span>}
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#222' }}>
        {menu.name}<span style={{ marginLeft: '6px', fontSize: '11px', color: '#999' }}>#{menu.id}</span>
      </div>
      <div style={{ fontSize: '13px', color: '#333' }}>₩{menu.price.toLocaleString()}</div>
      <div style={{ fontSize: '12px', color: statusColor, fontWeight: 'bold' }}>{statusLabel}</div>
      <button onClick={onEditRecipe} style={btnSmall('#3D2418', '#FFF')}>재료</button>
      <button onClick={onEditMenu} style={btnSmall('#0077CC', '#FFF')}>수정</button>
      <button onClick={onDeleteMenu} style={btnSmall('#FF5555', '#FFF')}>삭제</button>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{soldOutButton}</div>
    </div>
  );
}

const btnSmall = (bg, fg) => ({ padding: '6px 8px', background: bg, color: fg, border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' });

function RecipeEditorModal({ menu, ingredients, onClose }) {
  const [recipe, setRecipe] = useState([]);
  const [selectedIng, setSelectedIng] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState(null);

  const loadRecipe = async () => {
    try { setRecipe(await window.api.menu.getRecipe(menu.id)); } catch (e) { console.error(e); }
  };
  useEffect(() => { loadRecipe(); }, [menu.id]);

  const handleAdd = async () => {
    if (!selectedIng || !qty) { setMsg('재료와 수량 모두 입력하세요'); return; }
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) { setMsg('수량은 0보다 커야 합니다'); return; }
    try {
      await window.api.menu.setRecipeIngredient(menu.id, parseInt(selectedIng), q);
      setSelectedIng(''); setQty(''); setMsg(null); loadRecipe();
    } catch (e) { setMsg('추가 실패: ' + e.message); }
  };

  const handleRemove = async (ingId, name) => {
    if (!window.confirm(`'${name}' 재료를 레시피에서 제거할까요?`)) return;
    try { await window.api.menu.removeRecipeIngredient(menu.id, ingId); loadRecipe(); }
    catch (e) { setMsg('제거 실패: ' + e.message); }
  };

  const handleQtyChange = async (ingId, newQty) => {
    const q = parseFloat(newQty);
    if (isNaN(q) || q <= 0) return;
    try { await window.api.menu.setRecipeIngredient(menu.id, ingId, q); loadRecipe(); }
    catch (e) { console.error(e); }
  };

  const availableIngredients = ingredients.filter(ing => !recipe.find(r => r.ingredient_id === ing.id));

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '12px', width: '600px', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#3D2418', color: '#FFF', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🧪 {menu.name} 재료 편집</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '15px', color: '#666', marginTop: 0, marginBottom: '12px' }}>현재 레시피</h3>
          {recipe.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#999', background: '#F9F9F9', borderRadius: '8px' }}>등록된 재료가 없습니다</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recipe.map(r => (
              <div key={r.ingredient_id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.6fr 0.5fr', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F5F5F5', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold', color: '#222' }}>{r.ingredient_name}</div>
                <input type="number" defaultValue={r.quantity} onBlur={e => handleQtyChange(r.ingredient_id, e.target.value)} style={{ padding: '6px 10px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '14px' }} />
                <div style={{ fontSize: '13px', color: '#666' }}>{r.unit}</div>
                <button onClick={() => handleRemove(r.ingredient_id, r.ingredient_name)} style={{ padding: '6px 10px', background: '#ff5555', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>×</button>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: '15px', color: '#666', marginTop: '24px', marginBottom: '12px' }}>+ 재료 추가</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr', gap: '10px' }}>
            <select value={selectedIng} onChange={e => setSelectedIng(e.target.value)} style={{ padding: '10px', border: '1px solid #CCC', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">-- 재료 선택 --</option>
              {availableIngredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
            </select>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="수량" style={{ padding: '10px', border: '1px solid #CCC', borderRadius: '6px', fontSize: '14px' }} />
            <button onClick={handleAdd} disabled={!selectedIng || !qty} style={{ padding: '10px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', opacity: (!selectedIng || !qty) ? 0.4 : 1 }}>추가</button>
          </div>
          {msg && <div style={{ marginTop: '10px', padding: '10px', background: '#FFF3CD', color: '#856404', borderRadius: '4px', fontSize: '13px' }}>{msg}</div>}
        </div>
        <div style={{ borderTop: '1px solid #EEE', padding: '16px 24px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '12px 32px', background: '#666', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>완료</button>
        </div>
      </div>
    </div>
  );
}

function MenuEditorModal({ menu, categories, onClose, onSaved }) {
  const isNew = !menu.id;
  const [name, setName] = useState(menu.name || '');
  const [price, setPrice] = useState(menu.price || '');
  const [categoryId, setCategoryId] = useState(menu.categoryId || (categories[0]?.id || 1));
  const [description, setDescription] = useState(menu.description || '');
  const [image, setImage] = useState(menu.image || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const pickImage = async () => {
    try {
      const dataUrl = await window.api.dialog.pickImage();
      if (!dataUrl) return;
      const resized = await resizeImage(dataUrl, 600);
      setImage(resized);
    } catch (e) { setErr('이미지 불러오기 실패: ' + e.message); }
  };

  const handleSave = async () => {
    if (!name.trim()) return setErr('메뉴명을 입력하세요');
    const p = parseInt(price, 10);
    if (isNaN(p) || p < 0) return setErr('가격을 올바르게 입력하세요');
    setSaving(true); setErr(null);
    try {
      const data = { categoryId: parseInt(categoryId), name: name.trim(), price: p, image, description: description.trim() };
      if (isNew) { await window.api.menu.create(data); onSaved('✅ 메뉴가 추가되었습니다'); }
      else { await window.api.menu.update(menu.id, data); onSaved('✅ 메뉴가 수정되었습니다'); }
      onClose();
    } catch (e) { setErr('저장 실패: ' + e.message); }
    setSaving(false);
  };

  const isImagePath = image && (image.startsWith('data:') || image.startsWith('/'));

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '12px', width: '500px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#3D2418', color: '#FFF', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{isNew ? '＋ 새 메뉴 추가' : `🖉 ${menu.name} 수정`}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="카테고리"><select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inpStyle}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="메뉴명"><input value={name} onChange={e => setName(e.target.value)} placeholder="예: 아메리카노" style={inpStyle} /></Field>
          <Field label="가격 (원)"><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="4500" style={inpStyle} /></Field>
          <Field label="설명"><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="에스프레소와 물의 조화" rows={2} style={{...inpStyle, resize: 'vertical'}} /></Field>
          <Field label="이미지">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', background: '#F5F5F5', border: '1px dashed #CCC', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {image ? (isImagePath ? <img src={image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '40px' }}>{image}</span>) : <span style={{ color: '#999', fontSize: '12px' }}>없음</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <button onClick={pickImage} style={{ padding: '8px 16px', background: '#0077CC', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>이미지 선택</button>
                {image && <button onClick={() => setImage('')} style={{ padding: '6px 12px', background: '#999', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>제거</button>}
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>또는 이모지 입력:</div>
                <input value={isImagePath ? '' : image} onChange={e => setImage(e.target.value)} placeholder="🍰" style={{ width: '80px', padding: '6px', fontSize: '14px', border: '1px solid #CCC', borderRadius: '4px' }} />
              </div>
            </div>
          </Field>
          {err && <div style={{ padding: '10px', background: '#FFE0E0', color: '#C62828', borderRadius: '4px', fontSize: '13px' }}>{err}</div>}
        </div>
        <div style={{ borderTop: '1px solid #EEE', padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: '#999', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>취소</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#9eef00', color: '#000', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
            {saving ? '저장 중...' : (isNew ? '추가' : '저장')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><div style={{ fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '6px' }}>{label}</div>{children}</div>;
}

function resizeImage(dataUrl, maxWidth = 600) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '12px', borderLeft: '4px solid #9eef00', paddingLeft: '12px' }}>{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value, unit, big }) {
  return (
    <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: big ? '32px' : '26px', fontWeight: 'bold', color: '#333' }}>
        {typeof value === 'number' ? value.toLocaleString() : value} <span style={{ fontSize: '16px', color: '#666' }}>{unit}</span>
      </div>
    </div>
  );
}

function ModeCard({ label, count, total, color }) {
  return (
    <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{count}건</div>
      <div style={{ fontSize: '16px', color: '#666', marginTop: '4px' }}>₩{(total ?? 0).toLocaleString()}</div>
    </div>
  );
}

function BigStatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: '#FFF', padding: '24px', borderRadius: '8px', borderTop: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#222' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

function CompletionCard({ mode, rate, total, completed, color }) {
  return (
    <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>{mode} 완료율</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#222' }}>{rate}%</div>
      <div style={{ marginTop: '12px', height: '8px', background: '#EEE', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${rate}%`, background: color, transition: 'width 0.5s' }} />
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>{completed}건 완료 / {total}건 전체</div>
    </div>
  );
}

function formatDuration(seconds) {
  if (seconds == null || seconds < 0) return '-';
  if (seconds < 60) return `${Math.round(seconds)}초`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}분 ${s}초`;
}

const inpStyle = { width: '100%', padding: '10px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };

const adjBtnStyle = (type) => ({
  padding: '8px 12px', minWidth: '48px',
  background: type === 'plus' ? '#E8F5E9' : '#FFEBEE',
  color: type === 'plus' ? '#2E7D32' : '#C62828',
  border: `1px solid ${type === 'plus' ? '#A5D6A7' : '#FFCDD2'}`,
  borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
});

const thStyle = { padding: '10px', textAlign: 'left', fontSize: '13px', color: '#666' };
const tdStyle = { padding: '10px', fontSize: '14px' };