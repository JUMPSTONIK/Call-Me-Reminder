#!/bin/bash
set -e

echo "=========================================="
echo "Starting Call Me Reminder Backend"
echo "=========================================="

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until python -c "
import psycopg2
import os
import time
import sys
from urllib.parse import urlparse

db_url = os.getenv('DATABASE_URL')
parsed = urlparse(db_url)

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        conn.close()
        print('PostgreSQL is ready!')
        sys.exit(0)
    except psycopg2.OperationalError:
        retry_count += 1
        print(f'PostgreSQL not ready yet, retrying ({retry_count}/{max_retries})...')
        time.sleep(1)

print('Could not connect to PostgreSQL after 30 seconds')
sys.exit(1)
"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready!"
echo "=========================================="

# Run database migrations
echo "Running database migrations..."
alembic upgrade head
echo "Migrations completed!"
echo "=========================================="

# Start the application
echo "Starting FastAPI server..."
exec "$@"
