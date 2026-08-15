FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openjdk-21-jre-headless \
    nodejs \
    npm \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY server.js .
COPY start.sh .
COPY public ./public

RUN chmod +x start.sh

RUN mkdir -p /minecraft

EXPOSE 8080

CMD ["./start.sh"]
