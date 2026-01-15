#!/bin/bash

# MC Hub Development Server Startup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default port
DEV_PORT=${DEV_PORT:-3000}

echo -e "${BLUE}Starting MC Hub Development Server...${NC}"

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)

    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Found process running on port $port (PID: $pid). Killing it...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Kill any existing process on our port
kill_port $DEV_PORT

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down dev server...${NC}"
    jobs -p | xargs -r kill 2>/dev/null
    wait
    echo -e "${GREEN}Dev server stopped.${NC}"
    exit 0
}

# Trap EXIT, INT, and TERM signals
trap cleanup EXIT INT TERM

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Running npm install...${NC}"
    cd "$PROJECT_ROOT"
    npm install
fi

# Start Vite dev server
echo -e "${GREEN}Starting Vite dev server...${NC}"
cd "$PROJECT_ROOT"
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $DEV_PID 2>/dev/null; then
    echo -e "${RED}Dev server failed to start!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ MC Hub dev server started!${NC}"
echo -e "${BLUE}App: http://localhost:$DEV_PORT${NC}"
echo ""
echo "Press Ctrl+C to stop..."

# Wait for user to press Ctrl+C
wait
