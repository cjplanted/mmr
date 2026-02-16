# Examples

These files show how GSD workflows integrate MMR routing. They are **reference documentation only** and are not installed by `install.sh`.

The actual GSD workflow files live in the [get-shit-done](https://github.com/glittercowboy/get-shit-done) repo. These examples are extracted snippets showing the MMR integration pattern.

## Files

| File | Shows |
|------|-------|
| `gsd-research-phase-patch.md` | MMR routing in `/gsd:research-phase` |
| `gsd-plan-phase-patch.md` | MMR routing in `/gsd:plan-phase` research step |

## The Pattern

Every GSD workflow that spawns a routable agent follows the same pattern:

```bash
ENGINE=$(node ~/.claude/mmr/router.js resolve <agent-type> 2>/dev/null || echo "claude")
```

Then branches on the result to invoke either `gemini` CLI or Claude's `Task()` tool.
