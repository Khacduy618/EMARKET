#!/bin/bash

# =============================================================================
# DEMO SCRIPT - EXPOSE LOCAL TO INTERNET VIA NGROK
# =============================================================================

echo "🌐 Setting up temporary public domain for demo..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   brew install ngrok  # macOS"
    echo "   Or download from: https://ngrok.com/download"
    exit 1
fi

# Start ngrok tunnel
echo "🚀 Starting ngrok tunnel for port 80..."
echo "📝 Your app will be available at a temporary public URL"
echo "⚠️  This is for DEMO only - not for production!"

ngrok http 80