#!/bin/bash

set -e

echo "================================"
echo " CloudCraft Container"
echo "================================"

node /app/server.js &

echo "WebSocket iniciado na porta 9000"

exec nginx -g "daemon off;"
