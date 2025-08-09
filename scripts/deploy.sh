#!/bin/bash

# =============================================================================
# EMARKET DEPLOYMENT SCRIPT
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    log_error "Usage: $0 <environment> [options]"
    echo "Environments: development, production"
    echo "Options:"
    echo "  --build-only    Only build images, don't start services"
    echo "  --no-cache      Build without cache"
    echo "  --force         Force recreate containers"
    exit 1
fi

ENVIRONMENT=$1
BUILD_ONLY=false
NO_CACHE=false
FORCE=false

# Parse additional options
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_info "Starting deployment for environment: $ENVIRONMENT"

# Set environment variables
export BUILD_TARGET=$ENVIRONMENT
export APP_ENV=$ENVIRONMENT
export NODE_ENV=$ENVIRONMENT

# Check if required files exist
if [ ! -f ".env" ]; then
    log_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    log_warning "Please update .env file with your configuration before running again."
    exit 1
fi

if [ ! -f "Backend/.env" ]; then
    log_warning "Backend/.env file not found. Creating from Backend/.env.example..."
    cp Backend/.env.example Backend/.env
    log_warning "Please update Backend/.env file with your configuration before running again."
    exit 1
fi

# Build arguments
BUILD_ARGS=""
if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS="$BUILD_ARGS --no-cache"
fi

COMPOSE_ARGS=""
if [ "$FORCE" = true ]; then
    COMPOSE_ARGS="$COMPOSE_ARGS --force-recreate"
fi

# Determine compose files
COMPOSE_FILES="-f docker-compose.yml"
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
fi

log_info "Building Docker images..."
if [ "$NO_CACHE" = true ]; then
    docker compose $COMPOSE_FILES build --no-cache
else
    docker compose $COMPOSE_FILES build
fi

if [ "$BUILD_ONLY" = true ]; then
    log_success "Build completed successfully!"
    exit 0
fi

log_info "Starting services..."
docker compose $COMPOSE_FILES up -d $COMPOSE_ARGS

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 10

# Check service health
log_info "Checking service health..."

# Check backend health
if curl -f http://localhost:${BACKEND_PORT:-8001}/api/health > /dev/null 2>&1; then
    log_success "Backend service is healthy"
else
    log_warning "Backend service health check failed"
fi

# Check frontend health
if curl -f http://localhost:${FRONTEND_PORT:-3000}/api/health > /dev/null 2>&1; then
    log_success "Frontend service is healthy"
else
    log_warning "Frontend service health check failed"
fi

# Run post-deployment tasks for production
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "Running production post-deployment tasks..."
    
    # Clear Laravel caches
    docker-compose $COMPOSE_FILES exec backend php artisan config:cache
    docker-compose $COMPOSE_FILES exec backend php artisan route:cache
    docker-compose $COMPOSE_FILES exec backend php artisan view:cache
    
    log_success "Production caches cleared and optimized"
fi

log_success "Deployment completed successfully!"
log_info "Services are running at:"
echo "  - Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "  - Backend API: http://localhost:${BACKEND_PORT:-8001}/api"
echo "  - Main Application: http://localhost:${NGINX_PORT:-80}"

if [ "$ENVIRONMENT" = "development" ]; then
    echo "  - phpMyAdmin: http://localhost:${PHPMYADMIN_PORT:-8081}"
    echo "  - Mongo Express: http://localhost:${MONGO_EXPRESS_PORT:-8082}"
fi