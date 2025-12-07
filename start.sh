#!/bin/bash
# Script để chạy Frontend trên cổng 8003

cd "$(dirname "$0")"

# Chạy Next.js trên cổng 8003
PORT=8003 npm start

