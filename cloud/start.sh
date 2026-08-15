#!/bin/bash

set -e

echo "================================="
echo "       CloudCraft Server"
echo "================================="

echo ""
echo "Java:"
java -version

echo ""
echo "Iniciando servidor web..."

exec node server.js
