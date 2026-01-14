#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 SDM APE LAB - Full Stack Development        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# 백그라운드 서버 시작
echo -e "${GREEN}📡 Starting Backend Server (port 3001)...${NC}"
node server.js &
BACKEND_PID=$!

# 잠시 대기
sleep 2

# 프론트엔드 서버 시작
echo -e "${GREEN}🎨 Starting Frontend Server (port 3000)...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Servers started successfully!${NC}"
echo -e "${YELLOW}📡 Backend:  http://localhost:3001${NC}"
echo -e "${YELLOW}🎨 Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"

# Ctrl+C 트랩
trap "echo -e '${YELLOW}\n\n🛑 Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 대기
wait
