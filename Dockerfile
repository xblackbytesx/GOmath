FROM golang:alpine

RUN apk update && \
    apk add --no-cache nodejs yarn

RUN mkdir /app
ADD . /app
WORKDIR /app

RUN go build -o main .

RUN yarn install && \
    yarn build

# Start the Go app
CMD ["/app/main"]
