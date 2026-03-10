#!/bin/bash

# PostgreSQL Setup Script for E-Commerce Backend
# This script installs and configures PostgreSQL

set -e

echo "🔧 PostgreSQL Setup Script"
echo "=========================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt-get update
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql

# Get password from .env or use default
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env 2>/dev/null | cut -d '=' -f2 || echo "postgres")
DB_NAME=$(grep "^DB_NAME=" .env 2>/dev/null | cut -d '=' -f2 || echo "E-Commerce")
DB_USER=$(grep "^DB_USER=" .env 2>/dev/null | cut -d '=' -f2 || echo "postgres")

echo "🔐 Setting up database..."
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Switch to postgres user and create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE "$DB_NAME";

-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    ELSE
        ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO $DB_USER;
ALTER DATABASE "$DB_NAME" OWNER TO $DB_USER;

-- Exit
\q
EOF

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""
echo "🧪 Testing connection..."
sudo -u postgres psql -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1 && echo "✅ Connection test successful!" || echo "⚠️  Connection test failed"

echo ""
echo "🚀 You can now start your backend server!"

