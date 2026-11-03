import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Веб-сборка Telegram Mini App (деплой на GitHub Pages, см. README-MINIAPP.md).
 *
 * Electron использует electron.vite.config.ts — этот конфиг десктоп не затрагивает.
 * Отличия веб-сборки:
 *   - относительный base: приложение живёт по адресу https://<user>.github.io/<repo>/;
 *   - в index.html добавляется SDK Telegram WebApp из src/renderer/public
 *     (самохостинг — доступность telegram.org не влияет на работу Mini App).
 */

/** Добавляет локально размещённый SDK Telegram в веб-сборку. */
function telegramSdk(): Plugin {
  return {
    name: 'inject-telegram-sdk',
    transformIndexHtml(html: string): string {
      return html.replace(
        '</head>',
        '  <script src="./telegram-web-app.js"></script>\n  </head>'
      )
    }
  }
}

export default defineConfig({
  root: resolve('src/renderer'),
  base: './',
  plugins: [react(), telegramSdk()],
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('src/shared')
    }
  },
  build: {
    outDir: resolve('dist-web'),
    emptyOutDir: true
  }
})
