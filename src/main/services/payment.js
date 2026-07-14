export async function requestPayment({ amount, method }) {
  const brands = ['삼성', '국민', '신한', '현대', 'BC']
  const brand = brands[Math.floor(Math.random() * brands.length)]
  
  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
    approvalNumber: String(Math.floor(Math.random() * 89999999) + 10000000),
    approvedAt: new Date().toISOString(),
    cardBrand: brand,
    cardNumber: `${brand}카드 ****-****-****-${Math.floor(Math.random()*9000+1000)}`,
    amount,
    method,
    installment: '일시불',
    vanCompany: 'KIS정보통신',
  }
}