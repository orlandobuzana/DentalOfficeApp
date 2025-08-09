#!/bin/bash

# SmileCare Dental - Individual Test Runner
# Run specific test suites independently

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

if [ "$1" == "frontend" ]; then
    print_status "Running Frontend Tests..."
    node tests/frontend.test.js
elif [ "$1" == "backend" ]; then
    print_status "Running Backend Tests..."
    node tests/backend.test.js
elif [ "$1" == "integration" ]; then
    print_status "Running Integration Tests..."
    node tests/integration.test.js
elif [ "$1" == "database" ]; then
    print_status "Running Database Tests..."
    node tests/database.test.js
else
    echo "Usage: $0 [frontend|backend|integration|database]"
    echo ""
    echo "Examples:"
    echo "  $0 frontend    - Run only frontend tests"
    echo "  $0 backend     - Run only backend tests"
    echo "  $0 integration - Run only integration tests"
    echo "  $0 database    - Run only database tests"
fi