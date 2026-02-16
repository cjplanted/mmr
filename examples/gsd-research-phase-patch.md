# GSD Integration: Research Phase

How GSD's `/gsd:research-phase` workflow uses MMR to route the `gsd-phase-researcher` agent.

## Pattern

```bash
# Resolve which engine to use for the researcher agent
ENGINE=$(node ~/.claude/mmr/router.js resolve gsd-phase-researcher research-phase 2>/dev/null || echo "claude")
```

## Routing Logic

```
If ENGINE == "gemini":
  Write research prompt to variable
  gemini -p "$RESEARCH_PROMPT" -y
  Verify output file was created
  If file missing: fall back to Claude

If ENGINE == "claude" (or Gemini fallback):
  Task(
    prompt=research_prompt,
    subagent_type="gsd-phase-researcher",
    model="{researcher_model}"
  )
```

## Key Details

- The `2>/dev/null || echo "claude"` fallback ensures graceful degradation if MMR isn't installed
- Gemini is invoked via CLI with `-y` (auto-confirm) and `-p` (prompt string)
- Output verification catches cases where Gemini fails silently
- Claude path uses the standard Task tool with typed subagent
