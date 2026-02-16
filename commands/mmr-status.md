Show the current MMR (Multi-Model Router) routing configuration.

Run this command and display the output:

```bash
node ~/.claude/mmr/router.js status
```

Then check if there are per-project overrides in the current project:

```bash
cat .planning/config.json 2>/dev/null | jq '.mmr // empty' 2>/dev/null
```

Display results in a clear table format. If no project overrides exist, note that all routing uses global defaults.
