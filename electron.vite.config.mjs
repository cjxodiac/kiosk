import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    base: './', // 패키징된 앱은 file:// 프로토콜로 로드되므로 절대경로(/xxx.png) 대신 상대경로로 리소스를 참조해야 함
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
