Set the engine for a specific agent type in the current project's MMR config.

Usage: /mmr-set <agent-type> <engine>

Examples:
- /mmr-set gsd-phase-researcher claude
- /mmr-set gsd-planner gemini

Arguments from $ARGUMENTS: first word is agent type, second word is engine (claude or gemini).

## Process

1. Parse $ARGUMENTS into AGENT_TYPE and ENGINE.

2. Validate ENGINE is "claude" or "gemini". If not, show error with valid options.

3. Validate AGENT_TYPE is a known GSD agent. Known agents:
   - gsd-phase-researcher, gsd-project-researcher, gsd-research-synthesizer
   - gsd-planner, gsd-executor, gsd-verifier, gsd-debugger
   - gsd-codebase-mapper, gsd-plan-checker, gsd-roadmapper

4. Ensure `.planning/config.json` exists. If not, create it with:
   ```json
   { "mmr": { "agent_overrides": {} } }
   ```

5. Read `.planning/config.json`, add/update the `mmr.agent_overrides.{AGENT_TYPE}` key to ENGINE.

6. Write back the updated config.

7. Verify by running:
   ```bash
   node ~/.claude/mmr/router.js resolve {AGENT_TYPE}
   ```

8. Display confirmation: `Set {AGENT_TYPE} -> {ENGINE} (project override)`
