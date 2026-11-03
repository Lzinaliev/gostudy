import { defineConfig } from 'vitest/config'

// Vitest использует этот конфиг, а не vite.config.ts (у того root = src/renderer
// для веб-сборки Mini App). Тесты лежат в src/shared — доменная логика и контент.
export default defineConfig({
  test: {
    include: ['src/shared/**/*.test.{ts,tsx}']
  }
})
