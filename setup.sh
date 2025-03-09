#!/bin/bash

# LucaM Camera System setup script

echo "Setting up LucaM Camera System..."

# Make sure npm is available
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create required directories if they don't exist
echo "Checking directory structure..."
mkdir -p src/styles

# Check if globals.css exists
if [ ! -f src/styles/globals.css ]; then
    echo "Creating globals.css..."
    # This will be filled in by our code changes
fi

echo "Setup completed successfully!"
echo ""
echo "To start the development server, run:"
echo "npm run dev"
echo ""
echo "Demo login credentials:"
echo "Admin: admin / admin123"
echo "User: user / user123" 