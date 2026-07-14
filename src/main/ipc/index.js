import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import * as payment from '../services/payment.js'
import * as printer from '../services/printer.js'
import * as order from '../services/order.js'
import * as analytics from '../services/analytics.js'
import * as admin from '../services/admin.js'
import * as menu from '../services/menu.js'
import * as recommendation from '../services/recommendation.js'

export function registerIpcHandlers() {
  ipcMain.handle('app:ping', () => 'pong')
  
  ipcMain.handle('payment:request', (event, payload) => payment.requestPayment(payload))
  ipcMain.handle('printer:receipt', (event, payload) => printer.printReceipt(payload))
  ipcMain.handle('printer:test', () => printer.testPrint())
  ipcMain.handle('order:create', (event, payload) => order.createOrder(payload))
  ipcMain.handle('recommendation:get', (event, cartMenuIds) => recommendation.getRecommendations(cartMenuIds))
  ipcMain.handle('recommendation:getDebugStats', () => recommendation.getDebugStats())
  
  ipcMain.handle('analytics:startSession', (event, payload) => analytics.startSession(payload))
  ipcMain.handle('analytics:trackEvent', (event, payload) => analytics.trackEvent(payload))
  ipcMain.handle('analytics:endSession', (event, payload) => analytics.endSession(payload))
  
  // 관리자(Admin) 통계 데이터 
  ipcMain.handle('admin:getTodayStats', () => admin.getTodayStats())
  ipcMain.handle('admin:getAllTimeStats', () => admin.getAllTimeStats())
  ipcMain.handle('admin:getRecentOrders', (event, limit) => admin.getRecentOrders(limit))
  ipcMain.handle('admin:exportCsv', () => admin.exportCsv())
  ipcMain.handle('admin:clearAllData', () => admin.clearAllData())
  
  // 새로 추가된 Admin 통계 및 테스트 데이터 핸들러
  ipcMain.handle('admin:getRuntimeStats', () => admin.getRuntimeStats())
  ipcMain.handle('admin:getRuntimeDistribution', () => admin.getRuntimeDistribution())
  ipcMain.handle('admin:getAbandonmentStats', () => admin.getAbandonmentStats())
  ipcMain.handle('admin:getOrderRuntimes', (event, limit) => admin.getOrderRuntimes(limit))
  ipcMain.handle('admin:seedDemoData', () => admin.seedDemoData())
  
  // 메뉴 관련 
  ipcMain.handle('menu:getCategories', () => menu.getCategories())
  ipcMain.handle('menu:getMenus', () => menu.getMenus())
  ipcMain.handle('menu:getIngredients', () => menu.getIngredients())
  ipcMain.handle('menu:adjustStock', (event, id, delta) => menu.adjustIngredientStock(id, delta))
  ipcMain.handle('menu:setStock', (event, id, stock) => menu.setIngredientStock(id, stock))
  ipcMain.handle('menu:createIngredient', (event, data) => menu.createIngredient(data))
  ipcMain.handle('menu:toggleSoldOut', (event, id, soldOut) => menu.toggleMenuSoldOut(id, soldOut))
  ipcMain.handle('menu:getRecipe', (event, menuId) => menu.getRecipe(menuId))
  ipcMain.handle('menu:setRecipeIngredient', (event, menuId, ingId, qty) => menu.setRecipeIngredient(menuId, ingId, qty))
  ipcMain.handle('menu:removeRecipeIngredient', (event, menuId, ingId) => menu.removeRecipeIngredient(menuId, ingId))
  ipcMain.handle('menu:create', (event, data) => menu.createMenu(data))
  ipcMain.handle('menu:update', (event, id, data) => menu.updateMenu(id, data))
  ipcMain.handle('menu:delete', (event, id) => menu.deleteMenu(id))

  // 🔽 여기에 새로 추가되었습니다! (재료 수정 및 삭제 연결)
  ipcMain.handle('menu:updateIngredient', (event, id, data) => menu.updateIngredient(id, data))
  ipcMain.handle('menu:deleteIngredient', (event, id) => menu.deleteIngredient(id))
  
  // 이미지 파일 선택 → base64 반환
  ipcMain.handle('dialog:pickImage', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
    })
    if (result.canceled || !result.filePaths.length) return null
    
    const filePath = result.filePaths[0]
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    return `data:image/${mime};base64,${buffer.toString('base64')}`
  })
}