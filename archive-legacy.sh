#!/bin/bash

# archive-legacy.sh - Archive the legacy JavaScript codebase
# Run this after confirming the modern TypeScript game works correctly

echo "🗃️  Archiving Legacy JavaScript Codebase..."

# Create archive directory
mkdir -p archive

# Move legacy folder to archive
if [ -d "src/legacy" ]; then
    mv src/legacy archive/legacy-$(date +%Y%m%d)
    echo "✅ Legacy code archived to: archive/legacy-$(date +%Y%m%d)"
    echo "🎯 Migration to TypeScript complete!"
    echo ""
    echo "The modern TypeScript game is now the only active codebase."
    echo "All scenes use modern architecture with service layer integration."
    echo ""
    echo "To restore legacy code if needed:"
    echo "mv archive/legacy-$(date +%Y%m%d) src/legacy"
else
    echo "❌ Legacy folder not found - may have been already archived"
fi

echo ""
echo "🚀 Modern TypeScript Ashen Dawn ready for production!"
