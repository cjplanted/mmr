# GSD Integration: Plan Phase

How GSD's `/gsd:plan-phase` workflow uses MMR to route the `gsd-phase-researcher` agent during the research step of planning.

## Pattern

```bash
# MMR: Check which engine to use for research
ENGINE=$(node ~/.claude/mmr/router.js resolve gsd-phase-researcher plan-phase 2>/dev/null || echo "claude")
```

## Routing Logic

```
If ENGINE == "gemini":
  Build research prompt with phase context, requirements, and decisions
  gemini -p "$GEMINI_PROMPT" -y
  Verify: ls ${PHASE_DIR}/*-RESEARCH.md
  If file exists: continue to planning step
  If file missing: fall back to Claude

If ENGINE == "claude" (or Gemini fallback):
  Task(
    prompt=research_prompt,
    subagent_type="general-purpose",
    model="{researcher_model}"
  )
```

## Key Details

- Only the research step is routed through MMR; the planner and checker agents always use Claude
- The workflow argument (`plan-phase`) is passed as the second parameter to `resolve` for future per-workflow routing
- Research output is verified before proceeding to the planning step
- The planner agent (`gsd-planner`) is always routed to Claude because it needs file editing capabilities
