# Список дел в Docker

Учебный проект для практического занятия №2 "Docker и Docker Compose" по дисциплине "Введение в девопс". Простое приложение "Список дел": можно добавлять задачи, отмечать их выполненными и удалять. Бэкенд на Go хранит задачи в PostgreSQL и раздаёт статичный фронтенд. Весь стек поднимается одной командой через Docker Compose.

## Состав

- **app** - бэкенд на Go (`backend/`). Возвращает статичную страницу `frontend/` и предоставляет REST API `/api/items`.
- **db** - PostgreSQL 16 (`postgres:16-alpine`). При первом старте выполняет `init/01_seed.sql` и создаёт таблицу с тремя начальными задачами.
- **frontend** - HTML, CSS и JS без сборки (`frontend/`). Форма добавления, список задач с чекбоксами и кнопки удаления.

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

Нужны Docker и Docker Compose. Создайте `.env` по примеру из `.env.example` и запустите compose.

```bash
cp .env.example .env
docker compose up -d --build
```

После старта приложение доступно на http://localhost:8080.

## API

| Метод    | Путь              | Что делает                              |
|----------|-------------------|-----------------------------------------|
| `GET`    | `/api/items`      | список задач                            |
| `POST`   | `/api/items`      | добавить задачу, тело `{"name": "..."}` |
| `PATCH`  | `/api/items/{id}` | переключить статус "выполнено"          |
| `DELETE` | `/api/items/{id}` | удалить задачу                          |

Примеры:

```bash
curl -s http://localhost:8080/api/items
curl -s -X POST -H "Content-Type: application/json" -d '{"name":"Купить молоко"}' http://localhost:8080/api/items
curl -s -X PATCH http://localhost:8080/api/items/1
curl -s -X DELETE http://localhost:8080/api/items/1
```

## Настройки

Параметры БД берутся из файла `.env` (в git он не попадает):

| Переменная    | Значение по умолчанию |
|---------------|-----------------------|
| `DB_USER`     | `app`                 |
| `DB_PASSWORD` | `secret`              |
| `DB_NAME`     | `appdb`               |

Пароль и схема таблицы записываются в том БД при первой инициализации. Если изменить пароль или `init/01_seed.sql` позже, пересоздайте том: `docker compose down -v`.

## Особенности реализации

- **Multi-stage сборка.** Бинарник собирается в `golang:1.22-alpine`, запускается в `distroless/static-debian12:nonroot`: без shell, компилятора и root-прав.
- **Кэширование слоёв.** Зависимости (`go.mod`, `go.sum`) копируются и скачиваются раньше исходников.
- **Готовность БД.** Healthcheck через `pg_isready` и `depends_on` с `condition: service_healthy`: приложение стартует, когда БД готова принимать соединения.
- **Сеть.** Сервисы общаются по имени через сеть `app_net`. Порт БД наружу не публикуется.
- **Секреты.** Пароль берётся из `.env`, файл добавлен в `.gitignore`.
- **Фронтенд.** Монтируется в контейнер как read-only том, поэтому правки в `frontend/` видны после обновления страницы без пересборки образа.