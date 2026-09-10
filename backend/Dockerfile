FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o 2kitchen ./cmd/main.go

FROM alpine:3.21

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/2kitchen /2kitchen

EXPOSE 8080

CMD ["/2kitchen"]
