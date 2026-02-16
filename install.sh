#!/bin/bash
# MMR (Multi-Model Router) installer
# Idempotent — safe to run multiple times.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MMR_DIR="$HOME/.claude/mmr"
CMD_DIR="$HOME/.claude/commands"

echo "Installing MMR..."
echo ""

# Create directories
mkdir -p "$MMR_DIR"
mkdir -p "$CMD_DIR"

# Always overwrite router.js (stateless code)
cp "$SCRIPT_DIR/router.js" "$MMR_DIR/router.js"
echo "  router.js  -> $MMR_DIR/router.js"

# Preserve existing config (user customizations)
if [ -f "$MMR_DIR/config.json" ]; then
  echo "  config.json -> SKIPPED (already exists)"
  echo "               Hint: diff $SCRIPT_DIR/config.json $MMR_DIR/config.json"
else
  cp "$SCRIPT_DIR/config.json" "$MMR_DIR/config.json"
  echo "  config.json -> $MMR_DIR/config.json"
fi

# Copy slash commands
for cmd in "$SCRIPT_DIR"/commands/*.md; do
  name="$(basename "$cmd")"
  cp "$cmd" "$CMD_DIR/$name"
  echo "  $name -> $CMD_DIR/$name"
done

echo ""
echo "Done! MMR installed to $MMR_DIR"
echo ""
echo "Quick start:"
echo "  node ~/.claude/mmr/router.js status        # View routing table"
echo "  node ~/.claude/mmr/router.js resolve gsd-phase-researcher"
echo ""
echo "Slash commands (in Claude Code):"
echo "  /mmr-status   Show routing table"
echo "  /mmr-toggle   Enable/disable MMR"
echo "  /mmr-set      Override routing per-project"
