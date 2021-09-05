FROM alpine:latest
RUN apk add --no-cache nodejs npm


WORKDIR /server


COPY . /server

RUN npm install

CMD "npm" "start"