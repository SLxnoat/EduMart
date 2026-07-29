#!/bin/bash

echo "Verifying EduMart project structure..."

# Check if essential directories exist
DIRS_TO_CHECK=(
  "client"
  "server"
  "docs"
  "sql"
  ".github/workflows"
)

for dir in "${DIRS_TO_CHECK[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ Directory $dir exists"
  else
    echo "✗ Directory $dir missing"
  fi
done

# Check if essential files exist
FILES_TO_CHECK=(
  "README.md"
  "docker-compose.yml"
  ".env.example"
  "client/package.json"
  "client/src/index.js"
  "client/src/App.js"
  "server/package.json"
  "server/server.js"
  "docs/README.md"
  "docs/SUMMARY.md"
  "docs/technical_architecture.md"
  "docs/sql_schema.md"
  "sql/database_schema.sql"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ File $file exists"
  else
    echo "✗ File $file missing"
  fi
done

echo "Verification complete!"