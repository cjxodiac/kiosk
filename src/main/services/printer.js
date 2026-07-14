import { BrowserWindow } from 'electron'

// 가게 정보 (이 부분만 수정하면 영수증 헤더 바뀜)
const STORE_INFO = {
  name: '01234 카페',
  address: '서울특별시 강남구 테헤란로 152',
  phone: '02-1234-5678',
  businessNo: '123-45-67890',
}

// 메인 출력 함수 - PaymentScreen에서 호출
export async function printReceipt(payload) {
  console.log('[PRINTER] 영수증 출력 요청:', payload?.orderNumber)
  
  const html = generateReceiptHTML(payload || {})
  return printHTML(html)
}

// 테스트용 - 관리자에서 호출
export async function testPrint() {
  console.log('[PRINTER] 테스트 출력')
  
  const fakePayload = {
    orderNumber: 999,
    items: [
      { name: '아메리카노', qty: 2, price: 4500, options: ['차가운(ICE)', '샷 추가(2)'], optionPrice: 1000 },
      { name: '카페라떼', qty: 1, price: 5000, options: ['따뜻한(HOT)', '바닐라 시럽 추가(1)'], optionPrice: 500 },
      { name: '치즈케이크', qty: 1, price: 6000, options: [], optionPrice: 0 },
    ],
    total: 22000,
    paymentMethod: 'card',
    paymentInfo: { approvalNumber: '12345678', terminalId: 'KIOSK-001' },
    mode: '일반',
    createdAt: new Date().toISOString(),
  }
  
  return printReceipt(fakePayload)
}

// HTML을 실제 인쇄
async function printHTML(html) {
  const printWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 800,
    webPreferences: { contextIsolation: true, sandbox: false },
  })
  
  try {
    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`)
    await new Promise(r => setTimeout(r, 300))  // 폰트 로드 대기
    
    const result = await new Promise((resolve) => {
      printWindow.webContents.print({
        silent: true,           // 다이얼로그 없이 바로 출력
        printBackground: false,
        margins: { marginType: 'none' },
      }, (success, errorType) => {
        resolve({ success, errorType: errorType || null })
      })
    })
    
    if (result.success) {
      console.log('[PRINTER] 출력 성공')
    } else {
      console.warn('[PRINTER] 출력 실패:', result.errorType)
    }
    return { success: result.success, error: result.errorType }
  } catch (e) {
    console.error('[PRINTER] 예외:', e)
    return { success: false, error: e.message }
  } finally {
    if (!printWindow.isDestroyed()) printWindow.close()
  }
}

// 영수증 HTML 생성
function generateReceiptHTML(payload) {
  const orderNumber = payload.orderNumber || '?'
  const items = payload.items || []
  const total = payload.total || 0
  const paymentMethod = payload.paymentMethod || 'card'
  const paymentInfo = payload.paymentInfo || {}
  const mode = payload.mode || '일반'
  
  const now = new Date(payload.createdAt || Date.now())
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.')
  const timeStr = now.toTimeString().slice(0, 5)
  
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0)
  
  const itemsHTML = items.map(item => {
    const itemPrice = ((item.price || 0) + (item.optionPrice || 0)) * (item.qty || 1)
    const opts = (item.options || []).filter(o => o && o !== '차가운(ICE)' && o !== '따뜻한(HOT)')
    const tempOpt = (item.options || []).find(o => o === '차가운(ICE)' || o === '따뜻한(HOT)')
    
    const tempHTML = tempOpt ? `<div class="opt">└ ${tempOpt}</div>` : ''
    const optionsHTML = opts.map(opt => `<div class="opt">└ ${opt}</div>`).join('')
    
    return `
      <div class="row">
        <span>${item.name || '?'} × ${item.qty || 1}</span>
        <span>₩${itemPrice.toLocaleString()}</span>
      </div>
      ${tempHTML}
      ${optionsHTML}
    `
  }).join('')
  
  const paymentLabel = paymentMethod === 'card' ? '카드' : '간편결제'
  const approvalHTML = paymentInfo.approvalNumber 
    ? `<div class="row"><span>승인번호</span><span>${paymentInfo.approvalNumber}</span></div>` 
    : ''
  const terminalHTML = paymentInfo.terminalId 
    ? `<div class="row"><span>단말기</span><span>${paymentInfo.terminalId}</span></div>` 
    : ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 0; size: 80mm auto; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Malgun Gothic', 'Courier New', monospace;
          width: 280px;
          margin: 0;
          padding: 16px 12px;
          font-size: 12px;
          color: #000;
          line-height: 1.5;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .big { font-size: 18px; letter-spacing: 1px; }
        .small { font-size: 10px; color: #444; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .double { border-top: 2px solid #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .opt { padding-left: 10px; font-size: 11px; color: #444; }
        .total { 
          display: flex; justify-content: space-between; 
          font-size: 16px; font-weight: bold; margin: 10px 0; 
        }
        .footer { 
          text-align: center; margin-top: 16px; 
          font-size: 13px; padding: 8px 0; 
        }
      </style>
    </head>
    <body>
      <div class="center bold big">${STORE_INFO.name}</div>
      <div class="center small" style="margin-top: 4px;">${STORE_INFO.address}</div>
      <div class="center small">TEL ${STORE_INFO.phone}</div>
      <div class="center small">사업자등록번호 ${STORE_INFO.businessNo}</div>
      
      <div class="double"></div>
      
      <div class="row">
        <span class="bold">주문 #${orderNumber}</span>
        <span>${dateStr} ${timeStr}</span>
      </div>
      
      <div class="divider"></div>
      
      ${itemsHTML}
      
      <div class="divider"></div>
      
      <div class="row">
        <span>총 수량</span>
        <span>${totalQty}</span>
      </div>
      
      <div class="double"></div>
      
      <div class="total">
        <span>합계</span>
        <span>₩${total.toLocaleString()}</span>
      </div>
      
      <div class="double"></div>
      
      <div class="row"><span>결제수단</span><span>${paymentLabel}</span></div>
      ${approvalHTML}
      ${terminalHTML}
      <div class="row"><span>주문모드</span><span>${mode === '쉬운' ? '배리어프리' : '일반'}</span></div>
      
      <div class="divider"></div>
      
      <div class="footer">
        이용해 주셔서 감사합니다 ♥
      </div>
      <div class="center small" style="margin-top: 4px;">
        ${STORE_INFO.name}
      </div>
    </body>
    </html>
  `
}