# 머지 결과 (1단계 완료)

## 무엇을 합쳤나
- **베이스**: `kiosk-electron` (Electron 껍데기 + 백엔드)
- **renderer(UI)**: 친구 프로젝트 `kiosk-m-main`의 화면·컴포넌트로 교체
- **관리자**: `AdminScreen.jsx` 복원 + App.jsx에 라우팅 연결

## 유지된 내 백엔드
- `src/main/` — DB(SQLite), IPC, services(menu/order/payment/printer/analytics/admin) 전부
- `src/preload/` — `window.api` 브릿지
- `package.json` — better-sqlite3, recharts, electron 등

## 가져온 친구 UI
- 모든 화면 (`HomeScreen`, `StoreSelectScreen`, `MenuScreen`, `OrderConfirmScreen`, `PaymentScreen`, `CompleteScreen`)
- `Header.jsx`, `Signlanguage.jsx`, `components/*`, `context/KioskContext.jsx`
- `public/` 메뉴 이미지 전체

## 실행 방법
```
npm install
npm run dev
```

## 관리자 진입
- 초기(홈) 화면 **좌측 상단 모서리를 2초 안에 5번 탭** → 관리자 화면
- PIN: `0000`

## 수정한 버그
- 고아 파일 `대기화면.jsx` 삭제 (깨진 import)
- `Signlanguage.jsx` 이미지 경로 `/public/sign.png` → `/Sign.png`

---

# ⚠️ 2단계 (아직 안 함 — DB 배선)
현재 **고객 화면들은 아직 정적 데이터(`src/renderer/src/data/menus.js`)를 사용**합니다.
백엔드 DB는 살아있지만(관리자 화면은 DB 사용) 고객 주문 흐름과는 아직 연결 안 됨.

2단계에서 할 일:
1. `KioskContext.jsx`에 IPC 메뉴 로딩 + 애널리틱스 추적 병합
2. 화면들이 정적 데이터 대신 `useKiosk()`의 DB 메뉴 사용하도록 배선
3. 주문 완료 시 `window.api.order` 호출 → DB 기록
4. 세션/이벤트 추적 연결

---

## 2단계 — DB 배선 + 결제 플로우 (완료)

### 바뀐 것
- **KioskContext** → 백엔드판으로 교체. DB에서 메뉴/카테고리 로드, 세션·이벤트 자동 기록(애널리틱스), `주문결과`/`sessionIdRef`/`track` 제공. `처음으로` 시 접근성 전체 초기화(다음 손님 새 화면).
- **PaymentScreen** → kiosk-electron판으로 교체. 카드/간편결제 단계별 진행 + 효과음(`utils/sound.js`) + 단말기 애니메이션. 결제 승인 → `order.create`(DB 저장·재고 차감) → 영수증 → 완료.
- **MenuScreen / OrderConfirmScreen** → 정적 `data/menus` 대신 컨텍스트(DB) 메뉴 사용. `formatPrice`만 `../data`에서 그대로.
- **utils/sound.js** 추가 (Web Audio 효과음).
- **db/seed.js** 메뉴 이미지 경로 수정: 이모지 8개·오타 2개 → 실제 파일 경로. `strawberry_latte .png` 공백 제거.
- **/public/ 경로 버그** 수정: Header.jsx, HomeScreen.jsx (Vite는 public/을 루트로 서빙).
- **앱 이름** `kiosk-electron` → `barrierfree-kiosk`. DB 경로가 바뀌어 첫 실행 시 새 시드 적용(옛 테스트 DB 영향 없음).

### 데이터 흐름
- 메뉴 ID(101~503)는 DB 시드 = 기존 정적 데이터와 동일 → 장바구니 `menuId` 그대로 호환.
- 옵션 문자열 `샷 추가(2)` 형식 → order.js가 파싱해 재료 차감.
- 결제 완료 → 세션 `completed`, 주문 연결 → 관리자 통계/런타임/주문 탭에 실데이터 반영.

### 안 건드린 것
- CompleteScreen, StoreSelectScreen, OptionModal, HomeScreen 레이아웃, 관리자 진입(좌상단 5탭).
- `data/menus.js`, `data/categories.js` — 이제 미사용(죽은 코드). `data/index.js`의 `formatPrice`만 사용.
