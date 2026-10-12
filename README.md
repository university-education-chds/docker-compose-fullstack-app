# Fullstack-приложение в Docker

Учебный проект для практического занятия №2 "Docker и Docker Compose" по дисциплине "Введение в девопс". Небольшое приложение: Go-бэкенд возвращает статичный фронтенд и отдаёт записи из PostgreSQL в ручке `api/items`. Весь стек поднимается одной командой через Docker Compose.

## Состав

- **app** - бэкенд на Go (`backend/`). Возвращает статичную страницу `frontend/` и отдаёт `GET /api/items`.
- **db** - PostgreSQL 16 (`postgres:16-alpine`). При первом старте выполняет `init/01_seed.sql`.
- **frontend** - HTML, CSS и JS без сборки (`frontend/`). Запрашивает `/api/items` и показывает список записей.

## Структура

```
.
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── main.go
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── init/
│   └── 01_seed.sql
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Запуск

Нужны Docker и Docker Compose. Создаем и заполняем `.env` по примеру из `.env.example`, после чего запускаем compose.

```bash
cp .env.example .env
docker compose up -d --build
```

После старта:

- страница: http://localhost:8080
- API: http://localhost:8080/api/items

Пример ответа API:

```json
[{"id":1,"name":"first item"},{"id":2,"name":"second item"}]
```

## Настройки

Параметры БД берутся из файла `.env` (в git он не попадает):

| Переменная    | Значение по умолчанию |
|---------------|-----------------------|
| `DB_USER`     | `app`                 |
| `DB_PASSWORD` | `secret`              |
| `DB_NAME`     | `appdb`               |

Пароль записывается в том БД при первой инициализации. Если потребуется изменить его позже, пересоздайте том сбросив volumes: `docker compose down -v`.

## Особенности реализации

- **Multi-stage сборка.** Бинарник собирается в `golang:1.22-alpine`, запускается в `distroless/static-debian12:nonroot`: без shell, компилятора и root-прав.
- **Кэширование слоёв.** Зависимости (`go.mod`, `go.sum`) копируются и скачиваются раньше исходников.
- **Готовность БД.** Healthcheck через `pg_isready` и `depends_on` с `condition: service_healthy`: приложение стартует, когда БД готова принимать соединения.
- **Сеть.** Сервисы общаются по имени через сеть `app_net`. Порт БД наружу не публикуется.
- **Секреты.** Пароль берётся из `.env`, файл добавлен в `.gitignore`.
- **Фронтенд.** Монтируется в контейнер как read-only том, поэтому правки в `frontend/` видны после обновления страницы без пересборки образа.