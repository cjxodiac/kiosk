import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  ping: () => ipcRenderer.invoke('app:ping'),
  payment: { request: (p) => ipcRenderer.invoke('payment:request', p) },
  printer: { 
    receipt: (p) => ipcRenderer.invoke('printer:receipt', p),
    test: () => ipcRenderer.invoke('printer:test'),
  },
  order: { create: (p) => ipcRenderer.invoke('order:create', p) },
  recommendation: { get: (cartMenuIds) => ipcRenderer.invoke('recommendation:get', cartMenuIds), getDebugStats: () => ipcRenderer.invoke('recommendation:getDebugStats') },
  analytics: {
    startSession: (p) => ipcRenderer.invoke('analytics:startSession', p),
    trackEvent: (p) => ipcRenderer.invoke('analytics:trackEvent', p),
    endSession: (p) => ipcRenderer.invoke('analytics:endSession', p),
  },
  admin: {
    getTodayStats: () => ipcRenderer.invoke('admin:getTodayStats'),
    getAllTimeStats: () => ipcRenderer.invoke('admin:getAllTimeStats'),
    getRecentOrders: (l) => ipcRenderer.invoke('admin:getRecentOrders', l),
    exportCsv: () => ipcRenderer.invoke('admin:exportCsv'),
    clearAllData: () => ipcRenderer.invoke('admin:clearAllData'),
    getRuntimeStats: () => ipcRenderer.invoke('admin:getRuntimeStats'),
    getRuntimeDistribution: () => ipcRenderer.invoke('admin:getRuntimeDistribution'),
    getAbandonmentStats: () => ipcRenderer.invoke('admin:getAbandonmentStats'),
    getOrderRuntimes: (limit) => ipcRenderer.invoke('admin:getOrderRuntimes', limit),
    seedDemoData: () => ipcRenderer.invoke('admin:seedDemoData'),
  },
  menu: {
    getCategories: () => ipcRenderer.invoke('menu:getCategories'),
    getMenus: () => ipcRenderer.invoke('menu:getMenus'),
    getIngredients: () => ipcRenderer.invoke('menu:getIngredients'),
    adjustStock: (id, delta) => ipcRenderer.invoke('menu:adjustStock', id, delta),
    setStock: (id, stock) => ipcRenderer.invoke('menu:setStock', id, stock),
    createIngredient: (data) => ipcRenderer.invoke('menu:createIngredient', data),
    toggleSoldOut: (id, soldOut) => ipcRenderer.invoke('menu:toggleSoldOut', id, soldOut),
    getRecipe: (menuId) => ipcRenderer.invoke('menu:getRecipe', menuId),
    setRecipeIngredient: (menuId, ingId, qty) => ipcRenderer.invoke('menu:setRecipeIngredient', menuId, ingId, qty),
    removeRecipeIngredient: (menuId, ingId) => ipcRenderer.invoke('menu:removeRecipeIngredient', menuId, ingId),
    create: (data) => ipcRenderer.invoke('menu:create', data),
    update: (id, data) => ipcRenderer.invoke('menu:update', id, data),
    delete: (id) => ipcRenderer.invoke('menu:delete', id),
    
    // 🔽 [여기에 추가됨] 재료 수정 및 삭제 브릿지 통로 개설
    updateIngredient: (id, data) => ipcRenderer.invoke('menu:updateIngredient', id, data),
    deleteIngredient: (id) => ipcRenderer.invoke('menu:deleteIngredient', id),
  },
  dialog: {
    pickImage: () => ipcRenderer.invoke('dialog:pickImage'),
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) { console.error(error) }
} else {
  window.electron = electronAPI
  window.api = api
}