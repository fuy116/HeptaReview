#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER heptareview WITH PASSWORD '${POSTGRES_PASSWORD}';
    CREATE DATABASE heptareview OWNER heptareview;
    GRANT ALL PRIVILEGES ON DATABASE heptareview TO heptareview;
EOSQL 