#!/bin/bash

# Replace in TypeScript/JavaScript files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" | while read file; do
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Replace Event with Shoot (case-sensitive, word boundaries)
  sed -i '' -E '
    s/\bEvent\b/Shoot/g
    s/\bevent\b/shoot/g
    s/\bEvents\b/Shoots/g
    s/\bevents\b/shoots/g
    s/\bEventManager\b/ShootManager/g
    s/\beventManager\b/shootManager/g
    s/\bEventContext\b/ShootContext/g
    s/\beventId\b/shootId/g
    s/\bEventSummary\b/ShootSummary/g
    s/\bEventManagerConfig\b/ShootManagerConfig/g
    s/event-manager/shoot-manager/g
    s/event-started/shoot-started/g
    s/event-updated/shoot-updated/g
    s/event-completed/shoot-completed/g
    s/event-overtime/shoot-overtime/g
  ' "$file"
  
  # Clean up backup if changes were made
  if ! diff -q "$file" "$file.bak" > /dev/null; then
    echo "Updated: $file"
    rm "$file.bak"
  else
    rm "$file.bak"
  fi
done

# Rename directories
if [ -d "./apps/studio-app/app/api/events" ]; then
  mv ./apps/studio-app/app/api/events ./apps/studio-app/app/api/shoots
  echo "Renamed: ./apps/studio-app/app/api/events -> ./apps/studio-app/app/api/shoots"
fi

if [ -d "./apps/studio-app/app/event" ]; then
  mv ./apps/studio-app/app/event ./apps/studio-app/app/shoot
  echo "Renamed: ./apps/studio-app/app/event -> ./apps/studio-app/app/shoot"
fi

# Rename EventContext.tsx to ShootContext.tsx
if [ -f "./apps/studio-app/contexts/EventContext.tsx" ]; then
  mv ./apps/studio-app/contexts/EventContext.tsx ./apps/studio-app/contexts/ShootContext.tsx
  echo "Renamed: EventContext.tsx -> ShootContext.tsx"
fi

echo "Refactoring complete!"