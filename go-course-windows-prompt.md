# ПРОМПТ: Десктопное Windows-приложение «Курс по Go»

## РОЛЬ
Ты — senior product engineer и fullstack-разработчик с опытом создания образовательных приложений уровня Duolingo и дизайна уровня Apple. Твоя задача — спроектировать и написать полный код учебного **десктопного приложения для Windows** «Курс по Go (Golang)» с нуля: архитектура, дизайн-система, контент курса, геймификация, уведомления, Telegram-бот. Отвечай структурированно, пиши production-ready код, не пропускай ни одного раздела этого промпта.

---

## 1. ОБЩЕЕ ОПИСАНИЕ ПРИЛОЖЕНИЯ
Десктопное приложение для Windows 10/11 для изучения языка Go с нуля до уровня junior+/middle на основе официального роадмапа https://roadmap.sh/golang. Каждый урок = короткая теория (5–10 минут чтения) + практика к этому уроку. Приложение удерживает пользователя через стрик дней, опыт, уровни и уведомления в стиле Duolingo. Если пользователь не занимался и стрик вот-вот сгорит — приложение показывает нативное Windows-уведомление (toast) и отправляет сообщение в Telegram.

**Платформа: Windows 10/11, только desktop. Минимальный размер окна 1024×700, окно resizable, поведение окон стандартное для Windows (Snap Layouts совместимость).**

---

## 2. ДИЗАЙН-СИСТЕМА (СТРОГО)
Стиль — Apple (macOS/iOS Human Interface Guidelines): минимализм, много «воздуха», аккуратная типографика, деликатные анимации. Приложение выглядит «как Apple-приложение», но корректно себя ведёт в Windows (нативный title bar, стандартные кнопки окна справа, поддержка Snap).

### ЖЁСТКИЕ ЗАПРЕТЫ
- Ни одного эмодзи нигде: ни в UI, ни в текстах, ни в уведомлениях, ни в названиях достижений. Вместо них — иконки в стиле SF Symbols / Lucide (тонкие, монолинейные, вес 1.5–2pt).
- Ни одного фиолетового или розового градиента. Градиенты вообще не использовать, кроме одного тёмно-серого градиента на онбординге. Акценты — только плоские цвета.
- Никаких «пластиковых» Windows-скруглений и Aero-эффектов. Никаких теней вокруг окон.

### ТЕМНАЯ ТЕМА (единственная тема, светлой нет)
| Токен | Цвет | Назначение |
|---|---|---|
| background | `#000000` | основной фон |
| backgroundSecondary | `#1C1C1E` | карточки |
| backgroundTertiary | `#2C2C2E` | вложенные элементы |
| separator | `#3A3A3C` 60% | разделители |
| label | `#FFFFFF` | основной текст |
| labelSecondary | `#98989F` | подзаголовки, метаданные |
| labelTertiary | `#636366` | подсказки, disabled |
| accent | `#0A84FF` | кнопки, прогресс, ссылки |
| success | `#30D158` | верный ответ, стрик, кольцо XP |
| warning | `#FF9F0A` | сердечки, дедлайн стрика |
| danger | `#FF453A` | ошибка, сгорание стрика |

Стрик отображается иконкой `bolt` (молния) в оранжевом `#FF9F0A` — без эмодзи.

### ТИПОГРАФИКА
- Шрифт UI: **Inter** (primary, как fallback SF Pro на Windows) или системный Segoe UI Variable. Загрузить Inter локально, без внешних CDN.
- Моноширинный (код): **JetBrains Mono**, 14pt, фон блока кода `#1C1C1E`, радиус 12, кнопка «Скопировать» в углу блока.
- Заголовок окна/экрана: 26pt semibold. Заголовок урока: 21pt semibold. Основной текст: 15–16pt, line-height 1.4. Подписи: 12–13pt.

### КОМПОНЕНТЫ
- Радиусы: 10–12pt (карточки, кнопки), 16pt (dialogs), 12pt (code blocks).
- Кнопки primary: заливка `#0A84FF`, белый текст 15pt semibold, высота 44pt, нажатие — scale 0.97. Secondary: заливка `#2C2C2E`, текст `#FFFFFF`.
- Карточки: `#1C1C1E`, радиус 12, без теней.
- Навигация — **боковая колонка слева** (sidebar, как в Apple Mail/Notes на macOS), ширина 240pt, пункты: «Учиться», «Практика», «Рейтинг», «Профиль» + внизу «Настройки». Иконки 18pt с label 13pt. Выбранный пункт — `#2C2C2E` подложка, акцентная иконка.
- Hover-состояния обязательны: всё кликабельное приподнимается до `#2C2C2E` / `#3A3A3C`.
- Фокусные обводки для keyboard-навигации (Tab): акцентная обводка 2pt, радиус как у компонента. Полная поддержка клавиатуры: стрелки — навигация по спискам, Enter — открыть, 1–4 — варианты ответа в практике, Cmd/Ctrl+Enter — проверить код, Esc — закрыть диалог.
- Анимации: пружинная физика (spring damping ~0.8, duration 200–300ms). Верный ответ — карточка «пружинит» вверх и зеленеет; ошибка — лёгкий shake (±4px, 2 колебания).
- Scrollbars: тонкие (8pt), `#3A3A3C`, overlay-стиль, появляются при скролле.

---

## 3. ТЕХНОЛОГИЧЕСКИЙ СТЕК
Выбери и обоснуй один вариант, затем пиши код под него:
- **Вариант A (рекомендуется): Flutter 3.x (desktop Windows)** + Riverpod + go_router + drift (SQLite) для локального хранения + Dio. Одна кодовая база, отличная поддержка Windows, простые анимации.
- Вариант B: **Tauri 2.x** (Rust core) + фронт на React/Svelte + TypeScript + Tailwind. Лёгкий бинарник, нативные toast-уведомления Windows из коробки.

**Бэкенд** (облачный, для синхронизации, контента, проверки кода и бота): Go 1.22+ (chi или net/http ServeMux Go 1.22), PostgreSQL, Redis (кэш, очередь уведомлений), миграции golang-migrate.

**Telegram-бот**: библиотека go-telegram/bot.

**Уведомления на Windows**: нативные toast-уведомления (в Flutter — пакет `flutter_local_notifications` + `windows_notification`/`win_toast`; в Tauri — `tauri-plugin-notification` + Windows App SDK toast). Планировщик — фоновый сервис приложения (в связке с бэкендом: бэкенд решает «кому что слать», приложение/бот доставляют).

**Авторизация**: email/пароль (bcrypt) + JWT access/refresh. Telegram-привязка — через deep-link `https://t.me/<bot>?start=<user_token>`.

---

## 4. МОДЕЛЬ ДАННЫХ КУРСА
Спроектируй схему БД и локальные модели:
- `CourseBlock` (блок роадмапа) → `Module` → `Lesson` → `LessonContent` (упорядоченные блоки: `text` | `code` | `tip` | `quiz` | `task`).
- К каждому уроку обязательно привязана `Practice`: 5–10 заданий.

**Типы заданий практики:**
1. `single_choice` — выбор одного ответа;
2. `multiple_choice` — выбор нескольких ответов;
3. `code_output` — «что выведет этот код?» (моноширинный рендер кода);
4. `fill_code` — пропуск в коде: вставить строку/ключевое слово (варианты токенами-кнопками);
5. `find_bug` — найти ошибку в фрагменте (клик по строке);
6. `order_lines` — расставить строки кода в порядке (drag-and-drop + кнопки вверх/вниз для клавиатуры);
7. `write_code` — мини-задача с автопроверкой (см. раздел 7).

Каждое задание: текст вопроса, фрагмент кода (опционально), варианты, правильный ответ, объяснение (показывать после ответа).

`UserProgress`: lesson_completed, practice_score, xp, streak_days, streak_updated_at, last_activity_at, timezone (IANA), notification_time, telegram_chat_id.

---

## 5. ПОЛНАЯ ПРОГРАММА КУРСА (СОДЕРЖАНИЕ)
Встрой весь курс ниже как seed-контент (JSON-файлы миграции). Для КАЖДОЙ темы создай урок из блоков text/code/tip и практику из 5–10 заданий (все 7 типов равномерно по курсу). Код-примеры — валидный Go 1.22+, комментарии на русском.

### БЛОК 0. СТАРТ (1 модуль, 3 урока)
- **0.1 Зачем Go**: история (Google, 2009, Pike/Griesemer/Thompson), философия (простота, явность, компиляция в машинный код), где применяется (микросервисы, Docker и Kubernetes написаны на Go, CLI, обработка данных), причины популярности (горутины, быстрая компиляция, деплой одним бинарником).
- **0.2 Установка и настройка**: установка с go.dev, `go version`, команды toolchain (go run/build/install/get/mod), GOPATH/GOROOT/GOPROXY/GOSUMDB, настройка IDE (GoLand/VS Code + gopls), gofmt и goimports.
- **0.3 Первая программа**: package main, import "fmt", func main(), `go run` vs `go build`, анатомия go.mod (module path, go directive), package vs module.

### БЛОК 1. ОСНОВЫ GO (go-basics)
- **1.1 Переменные и константы**: var, краткое `:=`, zero values (0, "", false, nil), область видимости, const и iota (автоинкремент, побитовые сдвиги для флагов).
- **1.2 Типы данных**: int8..int64, uint, uintptr, float32/64, complex64/128, bool, string, byte = uint8, rune = int32 (Unicode-кодпоинт). Размеры, переполнение (uint8: 255+1). Нет неявных приведений — только явное T(v). Type inference.
- **1.3 Строки и руны**: UTF-8 по умолчанию, итерация по байтам vs по рунам (for...range), len() — байты, []rune(s), string(runes), сравнение, конкатенация, strings пакет (Contains, Split, Join, Replace, Trim, Builder).
- **1.4 Условия**: if с инициализацией (if x := f(); x > 0), switch со значением и tagless, fallthrough, type switch.
- **1.5 Циклы**: только for; 3 формы (C-подобная, условная, бесконечная с break), for...range по срезу/мапе/строке/каналу (индекс и копия значения — подводный камень с указателями), continue, break, метки циклов.
- **1.6 Массивы и срезы**: массив — значение фиксированной длины (присваивание копирует!), срез — дескриптор (pointer, len, cap), append и переаллокация, срезы срезов и общий backing array (подводный камень), make([]T, len, cap), copy, slices.Sort / sort.Slice, сортировка вставками руками в практике.
- **1.7 Map**: литералы и make, чтение/запись/удаление (delete), проверка (v, ok), итерация в случайном порядке, map как сет (map[T]struct{}), nil-map паникует при записи, sync.Map (упоминание).
- **1.8 Функции**: несколько возвращаемых значений, именованные результаты (return без аргументов — осторожно с defer), вариативные (...T и s...), функции первого класса, анонимные функции и замыкания, передача по значению (срезы и мапы — «по ссылке на backing data»).
- **1.9 defer**: LIFO-порядок, аргументы вычисляются сразу, типовые применения (закрытие файлов, Unlock), взаимодействие с именованными возвратами.
- **1.10 Указатели**: & и *, разыменование, указатели на структуры (авто-разыменование полей p.x), new(), указатель vs значение, escape analysis кратко (стек или куча — решает компилятор).
- **1.11 Структуры**: объявление, инициализация (всегда по именам полей), встраивание (embedding — композиция, продвижение полей/методов), теги (`json:"name,omitempty"`), анонимные структуры, сравнение (comparable если все поля comparable).
- **1.12 Методы**: receiver value vs pointer (изменяем — только pointer; consistency), методы на именованных типах, нельзя на чужих базовых типах.
- **1.13 Интерфейсы**: неявное удовлетворение, идиома io.Reader/io.Writer, any, type assertion с ok-формой, type switch, композиция интерфейсов (io.ReadWriter), интерфейсное значение = (тип, значение), nil-интерфейс vs интерфейс с nil-указателем (ловушка).
- **1.14 Ошибки**: error — интерфейс Error() string, errors.New и fmt.Errorf, оборачивание %w, errors.Is/As, sentinel-ошибки, кастомные типы ошибок, идиома «ошибка последним значением», обрабатывай или оборачивай.
- **1.15 panic и recover**: когда допустим (непоправимое состояние), recover только в defer, не как try/catch, panic в горутине убивает программу.
- **1.16 Generics**: type parameters [T any], constraints (constraints.Ordered, comparable, ~int|~string — тильда = underlying тип), generic-функции и типы, type inference, ограничения (нет методов с собственными type params), Map/Filter/Min/Max.
- **1.17 Пакеты и модули**: go mod init, go get @version, go.mod/go.sum, семантический импорт (/v2), replace, internal-пакеты, minimal version selection.
- **1.18 Рефлексия**: reflect.TypeOf/ValueOf, Kind vs Type, чтение полей по тегам (разбор JSON-тагов вручную), когда НЕ нужна (потеря типизации и перформанса).

### БЛОК 2. КОНКУРЕНТНОСТЬ (advanced-go)
- **2.1 Горутины**: go f(), лёгкие потоки (динамические стеки, от KB), GMP-модель (G — горутина, M — OS-поток, P — контекст), GOMAXPROCS, когда горутин слишком много.
- **2.2 Каналы**: make(chan T), буферизованные make(chan T, n), send/recv, close и range по каналу, v, ok := <-ch, nil-канал блокирует навсегда, «Share memory by communicating», буфер 0 vs n — семантика синхронизации.
- **2.3 select**: ожидание нескольких каналов, случайный выбор при готовности нескольких, default (non-blocking), select{} навсегда, таймаут через time.After, done-канал для отмены.
- **2.4 sync.WaitGroup**: Add/Done/Wait, передача по указателю, паттерн «дождаться пула воркеров», ошибка Add после Wait.
- **2.5 Mutex и RWMutex**: Lock/Unlock в defer, защита shared state, RWMutex для read-dominated, atomic.Int64 (Go 1.19+), race detector `go test -race`.
- **2.6 sync.Once, sync.Cond, sync.Pool**: ленивая однократная инициализация, переиспользование аллокаций (bytes.Buffer в воркерах).
- **2.7 context**: дедлайны/отмена/значения, Background/TODO, WithCancel, WithTimeout, WithDeadline, WithValue (только request-scoped: request-id, трейсы), проверка ctx.Err(), дочерние контексты, ctx — первый аргумент.
- **2.8 Паттерны**: worker pool, pipeline, fan-in/fan-out, errgroup (x/sync) — fan-out с первой ошибкой и отменой, rate limiting через токен-бакет и time.Ticker.
- **2.9 Race conditions и deadlocks**: как возникают, fatal error: all goroutines are asleep, -race, go vet, интеграция в CI.
- **2.10 Память и GC**: стек vs куча, escape analysis (`go build -gcflags=-m`), трёхцветный concurrent GC, паузы STW (GODEBUG=gctrace=1), GOGC и GOMEMLIMIT (Go 1.19+), pprof — heap/allocs/goroutine.

### БЛОК 3. СТАНДАРТНАЯ БИБЛИОТЕКА И ИНСТРУМЕНТЫ
- **3.1 fmt и ввод-вывод**: Print/Println/Printf и глаголы (%v %+v %#v %T %q %d %f %.2f), Sprintf, Fprintf, bufio.Scanner, io.Reader/Writer и io.Copy.
- **3.2 Файлы и директории**: os.Open/ReadFile/WriteFile, MkdirAll, filepath (Join, WalkDir), embed (//go:embed).
- **3.3 JSON**: json.Marshal/Unmarshal, Encoder/Decoder, теги, MarshalJSON, Decoder.UseNumber, xml и csv кратко.
- **3.4 Время**: time.Now, time.Time (UTC! всегда хранить в UTC), Parse/Format (layout 2006-01-02 15:04:05), Duration, NewTimer/NewTicker/AfterFunc, Sleep в проде — плохо.
- **3.5 Сортировки и утилиты**: sort.Ints/Slice/SliceStable, slices (Sort, Contains, BinarySearch, Clip, Grow) и maps (Keys, Values, Clone) Go 1.21+, cmp (Or, Compare).
- **3.6 Тестирование**: go test, *_test.go, TestXxx(t *testing.T), table-driven tests, t.Helper, t.Parallel, golden files, httptest, mocks через интерфейсы (sqlmock), fuzzing (FuzzXxx), бенчмарки (BenchmarkXxx + b.ReportAllocs), coverage, benchstat.
- **3.7 Инструменты качества**: gofmt, go vet, staticcheck, golangci-lint (.golangci.yml: errcheck, gosec, goimports, misspell), pre-commit, go generate, //go:build, ldflags (-s -w, -X main.version), кросс-компиляция GOOS/GOARCH.
- **3.8 Профилирование**: net/http/pprof, bench + профили cpu/mem, benchstat, pprof -http, execution tracer, правило «измеряй, не гадай».

### БЛОК 4. ВЕБ-РАЗРАБОТКА (go-and-web-development)
- **4.1 net/http сервер**: ListenAndServe, HandlerFunc vs Handler, ServeMux и паттерны Go 1.22 ("GET /users/{id}", {id...}), http.Server с таймаутами, graceful shutdown (signal.NotifyContext + Shutdown).
- **4.2 Запросы/ответы**: r.URL.Query, ParseForm, http.Error vs JSON {error}, статус-коды (201/204/400/401/403/404/409/422/500), заголовки, Content-Type, http.MaxBytesReader.
- **4.3 Маршрутизаторы**: chi (идиоматичный), gorilla/mux, gin, echo, fiber (fasthttp, НЕ совместим с net/http). Сравнительная таблица. Практика: CRUD на chi и на gin.
- **4.4 html/template**: {{define}}, range, if, auto-escaping (XSS-защита vs text/template), layout header/footer, air для hot-reload.
- **4.5 Middleware**: обёртка http.Handler, цепочка, логирование (recorder), recover (500), CORS, request-id, gzip, rate limit, auth. Порядок: recover → logger → auth → handler.
- **4.6 REST API**: ресурсы /api/v1/, идемпотентность GET/PUT/DELETE, PATCH vs PUT, пагинация (cursor vs offset), фильтры, версионирование, OpenAPI (swaggo, oapi-codegen).
- **4.7 Конфигурация**: 12-factor, os.Getenv, cleanenv/koanf/viper, flag, секреты не в git.
- **4.8 database/sql**: sql.Open, DSN, пул соединений (SetMaxOpenConns, SetMaxIdleConns, SetConnMaxLifetime), prepared statements, транзакции (Rollback в defer), sql.ErrNoRows, контекст.
- **4.9 PostgreSQL**: lib/pq vs pgx (pgx рекомендуется), UUID, jsonb, миграции (golang-migrate, goose), ACID и уровни изоляции кратко, pessimistic vs optimistic locking.
- **4.10 SQL-генераторы и ORM**: sqlx, GORM (модели, AutoMigrate, связи, preloading, хуки, сырые SQL через Exec), Ent (code generation). N+1 — обязательное предостережение.
- **4.11 Redis**: go-redis/v9, строки/хэши/сеты/zset, TTL, кэш с инвалидацией, сессии, rate limiting (INCR+EXPIRE / sliding window), distributed lock (SET NX PX, redlock кратко), pub/sub.
- **4.12 Аутентификация**: sessions (secure cookies, gorilla/sessions), bcrypt/argon2, JWT (header.payload.signature, HS256 vs RS256, httpOnly cookie vs localStorage, refresh с ротацией), OAuth2/OIDC, RBAC-мидлварь, OWASP top-10 в контексте Go.
- **4.13 gRPC**: protobuf и .proto (message, service, repeated, oneof), protoc-gen-go + protoc-gen-go-grpc, 4 вида RPC (unary, server/client/bidi streaming), metadata и interceptors, status.Error, deadline через context, grpc-gateway, Buf кратко.
- **4.14 WebSockets**: gorilla/websocket, хаб-паттерн (регистрация, fan-out), ping/pong и heartbeat, write pump (одно сообщение за раз), масштабирование через Redis pub/sub.
- **4.15 GraphQL кратко**: gqlgen, схема, resolvers, N+1 и dataloaders, когда REST / gRPC / GraphQL.
- **4.16 Фоновые задачи и очереди**: воркеры в процессе vs RabbitMQ (amqp091) / Kafka (kafka-go) / SQS, паттерн outbox, retries с backoff, dead letter queues, cron (robfig/cron), распределённые локи для cron.

### БЛОК 5. CLI-ПРИЛОЖЕНИЯ
- **5.1 flag-пакет**: строковые/числовые/булевы флаги, flag.Func, flag.Args().
- **5.2 cobra**: команды и сабкоманды (cobra-cli gen), persistent vs local флаги, RunE, init(), многоуровневый CLI (git-подобный).
- **5.3 urfave/cli v2**: альтернатива, сравнение.
- **5.4 TUI**: bubbletea (ELM: Init/Update/View), lipgloss, progress bars, диалоги.

### БЛОК 6. DEVOPS, СБОРКА, ДЕПЛОЙ
- **6.1 Релизы**: GOOS/GOARCH matrix, -trimpath, -ldflags "-s -w", goreleaser.
- **6.2 Docker**: multi-stage Dockerfile, distroless/scratch, non-root, .dockerignore, docker-compose (app+postgres+redis), healthcheck.
- **6.3 CI/CD**: GitHub Actions — golangci-lint → test -race с coverage → build → docker push → deploy, кэш модулей, matrix версий Go.
- **6.4 Kubernetes кратко**: Deployment/Service/Ingress, liveness vs readiness, HPA, requests/limits, graceful shutdown (preStop, terminationGracePeriodSeconds), ConfigMap/Secret.
- **6.5 Наблюдаемость**: log/slog (JSON-Handler, уровни, атрибуты), Prometheus (promhttp, RED), OpenTelemetry (span, baggage), correlation-id.

### БЛОК 7. ФИНАЛЬНЫЕ ПРОЕКТЫ (7 проектных модулей, у каждого чек-лист шагов)
- 7.1 Todo REST API на chi + PostgreSQL + миграции + Docker + тесты.
- 7.2 CLI менеджер заметок на cobra + шифрование + файл-хранилище.
- 7.3 Чат (websocket) с комнатами и историей в Redis.
- 7.4 URL shortener с rate limiting и счётчиком переходов.
- 7.5 Сервис gRPC + gateway + protobuf-контракт.
- 7.6 Скрапер с worker pool, очередью и CSV-экспортом.
- 7.7 Микросервисная пара users + orders через gRPC с tracing.

### БЛОК 8. ЧТО ДАЛЬШЕ (1 модуль, только материалы и ссылки)
- 8.1 Effective Go — главные идиомы.
- 8.2 100 Go Mistakes — 20 главных (копирование срезов, range-переменная и указатели, nil-map, time.Time ==, defer в цикле, append-ловушка).
- 8.3 Собеседование: map внутри (hmap/buckets), slice (backing array), порядок defer, goroutine vs поток, устройство интерфейса, escape analysis, GC, случайность select; live-coding (worker pool, merge каналов, rate limiter).
- 8.4 Ресурсы: go.dev/doc, Go Blog, gobyexample, exercism, Awesome Go.

**ИТОГО: 8 блоков, 57 тем-уроков + 7 проектных модулей ≈ 64 урока и 450–550 заданий практики.**

---

## 6. ГЕЙМИФИКАЦИЯ (СТИЛЬ DUOLINGO, БЕЗ ЭМОДЗИ)
- **Стрик**: серия календарных дней, каждый с ≥1 завершённым уроком/практикой. Иконка `bolt` (оранжевая). На главной — число дней под иконкой.
- **XP**: урок = 10 XP, практика без ошибок = +5 bonus, combo серии верных ответов до x2. Прогресс — кольцевой индикатор (как Activity Rings, одно плоское кольцо #30D158, без градиентов).
- **Ежедневная цель**: «Спокойный» 10 XP / «Серьёзный» 20 XP / «Интенсив» 30 XP.
- **Лиги**: еженедельный турнир ~30 пользователей: Бронза → Серебро → Золото → Сапфир → Рубин → Изумруд → Аметист → Жемчуг → Обсидиан → Бриллиант. Повышение/понижение по итогам недели. Экран «Рейтинг» — таблица из 30 строк, своя строка подсвечена.
- **Сердечки** (опционально, включаются в настройках): 5 ошибок в практике → конец сессии; восстановление по времени или за XP. Иконка `heart` в #FF9F0A.
- **Достижения** (все без эмодзи): «3 дня подряд», «7 дней», «30 дней», «Первая идеальная практика», «100 верных ответов», «Блок Основы завершён», «Блок Конкурентность завершён», «Первый проект». Сетка 3 колонки, заблокированные — #3A3A3C с иконкой `lock`.
- **Ежедневный бонус**: первый урок дня — сундук (иконка `gift`) с 5–15 XP, анимация открытия.

---

## 7. ПРАКТИКА И АВТОПРОВЕРКА КОДА
- `write_code`: мини-задача («напишите функцию, возвращающую сумму чётных чисел среза») с редактором кода: подсветка Go-синтаксиса, кнопки вставки символов { } ( ) := ; " на панели (для мыши), полная поддержка клавиатуры.
- Автопроверка на бэкенде в изолированном раннере:
  1. `go build`/`go vet` на код пользователя + скрытые тесты автора задачи;
  2. `go test` с таймаутом 5 сек, лимитом памяти, без сети;
  3. сравнение expected/actual;
  4. фидбэк: компилируется ли, какие тесты упали (названия, expected/actual), подсказка после 2-й неудачи.
- Контракт задачи: автор задаёт сигнатуры (имена функций/типов), скрытые тесты не показываются, при падении — только имена тестов.
- Офлайн: все задания кроме write_code работают без сети; прогресс синхронизируется позже (очередь мутаций, идемпотентные ключи).

---

## 8. УВЕДОМЛЕНИЯ
### Windows toast-уведомления (нативные, в стиле Windows 11, но без брендинга — тёмные, акцент #0A84FF)
- **Напоминание заниматься**: ежедневно в выбранное время (IANA-таймзона юзера). Тексты короткие, вариативные (≥10 вариантов на тип), примеры: «Время потренировать Go. Ваш стрик: 6 дней», «Всего 5 минут — и стрик жив. Урок уже ждёт», «Не дайте стрику погаснуть: осталось 3 часа».
- **Логика горящего стрика**: если за сегодняшний календарный день (локальная полночь юзера) нет ни одного урока и стрик ≥ 1 → за 6 часов до полуночи первое напоминание, за 2 часа — второе, при <30 минутах — критическое «Стрик сгорит через 30 минут».
- Пуш при достижении дневной цели.
- **Тихие часы** 22:00–08:00: обычные пуши не шлём; критическое о сгорании стрика шлём, если локальная полночь выпадает на тихие часы.
- Настройки: каждый тип уведомлений отключается отдельно. Если приложение закрыто — напоминания приходят через запланированные бэкендом пуши (FCM webpush нет — десктоп: локальный планировщик Windows Task Scheduler/фоновый агент приложения; предложи и обоснуй решение для закрытого приложения).

### Telegram-бот (обязательный функционал)
- Бот «Go Course». Привязка: в настройках кнопка «Привязать Telegram» → deep-link `https://t.me/<bot>?start=<токен>` → /start <токен> → сохраняем chat_id.
- Сообщения с inline-клавиатурой (кнопки «Открыть приложение» — deep-link, «Отложить на 1 час»):
  1. **«Стрик в опасности»** (< 6 часов до полуночи, урока не было): «Осторожно: ваш стрик из N дней сгорит сегодня в 23:59»;
  2. **«Финальный дедлайн»** (за 30 минут): «Осталось 30 минут, чтобы сохранить стрик N дней»;
  3. Утреннее напоминание (если включено);
  4. **«Стрик сгорел»** (следующим утром): «Стрик оборвался на N днях. Начните новый — сегодня отличный день»;
  5. Еженедельный отчёт лиги: «Вы заняли 3-е место в Золотой лиге, +40 XP».
- Анти-спам: ≤4 сообщений в день, дедупликация по (user_id, date, type), при block от юзера — отключать отправку.
- Команды: /start, /streak, /progress (XP, уровень, ASCII-прогресс кольца), /unlink.
- Без эмодзи. Форматирование: жирный `*текст*`, код в backquotes.

---

## 9. ЭКРАНЫ ПРИЛОЖЕНИЯ
1. **Онбординг** (3–4 окна): ценность приложения → выбор цели → выбор времени напоминаний → включение уведомлений. → Регистрация/логин.
2. **Главная «Учиться»**: боковая колонка слева; контент — большая карточка текущего урока (раздел, название, кольцо прогресса модуля), блок стрика сверху (молния + число), список блоков курса ниже, кнопка «Учить».
3. **Урок**: вертикальный скролл блоков (текст/код/tip), нижняя панель с кнопкой «К практике» (sticky).
4. **Практика**: одно окно, 1 задание = 1 экран, индикатор прогресса сверху, фидбэк-панель снизу (верно — зелёная, неверно — красная с объяснением), combo-счётчик, сердечки (если включены).
5. **Результат практики**: кольцо начисления XP, анимация, достижения, кнопка «Далее».
6. **«Практика»**: повторение ошибок, тренировка блока, ежедневный бонус.
7. **«Рейтинг»**: лига, таблица 30 юзеров, таймер до конца недели, своя позиция.
8. **«Профиль»**: стрик-календарь (месяц, дни точками/кружками), уровень и XP, достижения, настройки (дневная цель, время напоминаний, тихие часы, типы уведомлений, привязка Telegram со статусом), выход.
9. **Экран блока курса**: список уроков с состояниями (закрыт — `lock`, пройден — зелёный `check`, текущий — синяя подсветка).
10. **Экран проекта**: чек-лист шагов, «Отметить шаг», «Отправить на проверку».
11. Пустые состояния и скелетоны для всех списков.

---

## 10. ТРЕБОВАНИЯ К КОДУ И АРХИТЕКТУРЕ
- Чистая архитектура: UI → контроллер/bloc → repository → data source. Контракты через интерфейсы.
- Все строки UI — в файлах локализации (ru по умолчанию, en заготовка).
- Состояние: immutable state-классы; loading/error/empty для каждого экрана.
- Крашрепорты (Sentry), feature-флаги для сердечек.
- Тесты: unit бизнес-логики (стрик, XP, лиги, планировщик), golden-тесты экранов, интеграционный тест бота (mock Telegram API).
- Бэкенд: миграции, seed контента, Dockerfile, docker-compose (app, postgres, redis, bot), .env.example, README, GitHub Actions CI.
- Безопасность: bcrypt, JWT access 15 мин + refresh 30 дней с ротацией, rate limit на auth, валидация входов, секреты из env.

---

## 11. ФОРМАТ ВЫПОЛНЕНИЯ (ОТВЕТА)
Работай итеративно, после каждого этапа жди моего «ок»:
- **Этап 1**: подтверждение стека + структура репозитория.
- **Этап 2**: дизайн-токены, UI-kit и главные экраны (код + описание).
- **Этап 3**: доменная модель, БД-схемы, API-контракты (OpenAPI).
- **Этап 4**: seed-контент Блоков 0 и 1 целиком (все уроки + по 6–8 заданий практики на урок, все типы заданий).
- **Этап 5**: seed-контент блоков 2–8.
- **Этап 6**: геймификация (стрик, XP, кольцо, лиги, достижения).
- **Этап 7**: уведомления Windows (toast + планировщик, включая случай закрытого приложения).
- **Этап 8**: Telegram-бот полностью.
- **Этап 9**: write_code раннер + инфраструктура (Docker, CI, README).
- **Этап 10**: тесты и финальный чек-лист приёмки.

Если пункт неясен — задай уточняющие вопросы перед Этапом 1. Начинай с Этапа 1.
