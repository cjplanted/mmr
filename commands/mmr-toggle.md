Toggle MMR (Multi-Model Router) on or off. When disabled, all agents route to Claude.

## Process

1. Read the global config:
   ```bash
   cat ~/.claude/mmr/config.json
   ```

2. Check the current `enabled` field value.

3. Toggle it:
   - If `enabled` is `true` (or missing): set to `false`
   - If `enabled` is `false`: set to `true`

4. Update `~/.claude/mmr/config.json` with the new value (preserve all other fields).

5. Verify the new state:
   ```bash
   node ~/.claude/mmr/router.js resolve gsd-phase-researcher
   ```

6. Display result:
   - If now enabled: "MMR enabled. Research agents route to Gemini, execution agents to Claude."
   - If now disabled: "MMR disabled. All agents route to Claude."
