import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { config as loadEnv } from 'dotenv'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc/index.js'
import { initDatabase } from './db/index.js'

// .env 로드: 개발모드에선 프로젝트 루트, 패키징된 앱에선 app.getAppPath() 기준으로 찾음
loadEnv({ path: join(app.getAppPath(), '.env') })

function createWindow() {
  // 실제 키오스크 목표 해상도 (세로형)
  const TARGET_W = 1080
  const TARGET_H = 1920

  // 개발 중엔 모니터의 80% 크기로 축소, 빌드(실 키오스크)에선 1배
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize
  const scale = is.dev
    ? Math.min((screenW * 0.8) / TARGET_W, (screenH * 0.8) / TARGET_H, 1)
    : 1

  const mainWindow = new BrowserWindow({
    width: Math.floor(TARGET_W * scale),
    height: Math.floor(TARGET_H * scale),
    show: false,
    autoHideMenuBar: true,
    fullscreen: !is.dev,
    kiosk: !is.dev,
    frame: is.dev,
    resizable: is.dev,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // UI는 1080x1920 기준, 축소된 창에선 자동 줌
  mainWindow.webContents.on('did-finish-load', () => {
    if (is.dev) mainWindow.webContents.setZoomFactor(scale)
  })

  // 우클릭 메뉴 차단 (프로덕션만)
  mainWindow.webContents.on('context-menu', (e) => {
    if (!is.dev) e.preventDefault()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC 핸들러 등록
  initDatabase()   
  registerIpcHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})