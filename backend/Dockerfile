FROM golang:1.22-alpine AS builder

WORKDIR /build

# Сначала зависимости: слой кэшируется, пока go.mod/go.sum не менялись
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Статический бинарник без glibc, чтобы он запускался в distroless/static
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/app ./main.go

# Финальный образ без shell и компилятора, запуск не от root
FROM gcr.io/distroless/static-debian12:nonroot

USER nonroot:nonroot

WORKDIR /app
COPY --from=builder /out/app /app/app

EXPOSE 8080

ENTRYPOINT ["/app/app"]