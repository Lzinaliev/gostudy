# Telegram Mini App «Курс по Go»

Та же кодовая база, что и десктопное приложение, собранная как веб-приложение и открытая
внутри Telegram. Работает и с телефона, и с ПК (Telegram Desktop / Web), прогресс
синхронизируется между устройствами через Cloudflare.

```
┌ Telegram (телефон или ПК) ┐      ┌ GitHub Pages ─┐      ┌ Cloudflare Worker + KV ┐
│  Mini App (React 19)      │ ←──▶ │  ститика UI   │      │  прогресс пользователей │
│  window.Telegram.WebApp   │      │  бесплатно    │      │  бесплатно (Free plan)  │
└───────────────────────────┘      └───────────────┘      └───────────────────────────┘
```

* **Фронтенд** — GitHub Pages (бесплатно, HTTPS уже включён).
* **Синхронизация** — Cloudflare Worker + KV (Free plan: 100 000 запросов/день,
  1 000 записей в KV/день — с запасом для личного использования).
* **Авторизация** — сервер проверяет подпись `initData` (HMAC-SHA256 с токеном бота),
  поэтому доступ к прогрессу есть только у владельца Telegram-аккаунта.

Прогресс хранится одновременно в `localStorage` устройства и в облаке; при конфликте
побеждает версия с более поздним `progress.updatedAt` (last-write-wins).

---

## Шаг 1. Cloudflare Worker (бэкенд синхронизации)

Требуется бесплатный аккаунт [Cloudflare](https://dash.cloudflare.com/sign-up).

```bash
cd worker
npm install
npx wrangler login                      # откроет браузер для авторизации
npx wrangler kv namespace create STATE  # создаст KV и выведет его id
```

Вставьте выведенный `id` в `worker/wrangler.toml` вместо `ЗАМЕНИТЕ_НА_ID`,
затем задайте токен бота и разверните:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN   # вставьте токен от @BotFather
npm run deploy
```

Wrangler напечатает адрес воркера, например:
`https://go-course-sync.yourname.workers.dev`

Проверка: открыть `https://go-course-sync.yourname.workers.dev/health` — должен
вернуться `{"ok":true}`.

## Шаг 2. Репозиторий GitHub и Pages (фронтенд)

1. Запушьте проект в репозиторий GitHub (ветка `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → Variables → New repository variable**:
   - Name: `VITE_API_URL`
   - Value: URL воркера из шага 1 (без слэша на конце).

Пуш в `main` запускает `.github/workflows/deploy-web.yml`: typecheck, сборка,
деплой. Mini App будет доступна по адресу
`https://<username>.github.io/<repo>/` (см. вкладку Pages).

## Шаг 3. Подключение Mini App к боту (BotFather)

1. Откройте @BotFather → `/mybots` → выберите вашего бота.
2. **Bot Settings → Menu Button → URL** — вставьте
   `https://<username>.github.io/<repo>/` и название, например «Курс по Go».
3. Готово: кнопка меню бота открывает курс. С телефона и ПК.

Дополнительно можно закрепить кнопку в чате: `/setchatmenu` у BotFather.

---

## Локальная разработка

```bash
npm run dev:web        # фронтенд на http://localhost:5173 (без Telegram — веб-режим)
cd worker && npm run dev   # API воркера на http://localhost:8787
```

Для облачной синхронизации локально заполните `VITE_API_URL` в `.env`
(см. `.env.example`) — Vite подхватит переменную при сборке.

Отладка именно Telegram-окружения: временно замените адрес в BotFather на
туннель к localhost (например, `ngrok http 5173`) — initData и хаптика будут
работать так же, как в продакшене.

## Проверка после деплоя

| Что проверяем | Как |
|---|---|
| Mini App открывается | Кнопка меню бота в Telegram |
| Прогресс сохраняется | Пройти урок → закрыть → открыть снова |
| Синхронизация | Пройти урок на телефоне → открыть на ПК |
| Кнопка «Назад» Telegram | Внутри урока/практики возвращается на экран назад |

## Обновление Telegram WebApp SDK

SDK встроен в сборку (`src/renderer/public/telegram-web-app.js`), поэтому Mini App не зависит
от доступности telegram.org. Чтобы обновить версию:

```bash
curl -L -o src/renderer/public/telegram-web-app.js https://telegram.org/js/telegram-web-app.js
```

## Ограничения

* **Задания `write_code`** требуют локального Go toolchain — в Mini App они
  помечены как доступные только в десктопном приложении (фолбэк встроен в `bridge.ts`).
* **Конфликт устройств** решается по времени последнего изменения: при
  одновременной работе на двух устройствах побеждает поздняя сессия.
* **Часы устройства** должны идти правильно — `updatedAt` генерируется клиентом.
* **Напоминания бота 24/7** (как в десктоп-версии) требуют постоянно работающего
  процесса: либо оставьте локальный `npm run bot`, либо перенесите бота на
  Cloudflare Workers в webhook-режиме (следующий этап развития).

## Структура

```
vite.config.ts               конфиг веб-сборки (Electron его не использует)
src/renderer/src/telegram.ts адаптер Telegram WebApp SDK (готовность, BackButton, MainButton, хаптика)
src/renderer/src/sync.ts     облачная синхронизация (debounce-push, last-write-wins)
src/renderer/src/bridge.ts   веб-режим: localStorage + облако, фолбэки десктоп-фич
src/renderer/src/components/BottomNav.tsx   нижняя навигация для телефона
worker/                      Cloudflare Worker: GET/PUT/DELETE /state, проверка initData
.github/workflows/deploy-web.yml            автодеплой на GitHub Pages
```

## Что сделано в Mini App

* Автоматическое определение имени и языка из Telegram-аккаунта.
* Онбординг адаптируется под Mini App: шаг Windows-уведомлений заменён на информацию об облачной синхронизации.
* Telegram BackButton и MainButton управляются из приложения: BackButton — навигация назад, MainButton — «К практике» / «Проверить» / «Продолжить».
* Статус синхронизации отображается в профиле.
