# MMR (Multi-Model Router)

A lightweight routing layer for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that directs AI agent types to different backends. Research agents go to Gemini (1M context, web search), execution agents stay on Claude (file editing, code execution). 133 lines of Node.js, zero dependencies.

Built for [GSD](https://github.com/cjplanted/get-shit-done) but works with any Claude Code agent workflow.

## Architecture

```
                      ┌─────────────────────────────────┐
                      │        Resolution Order          │
                      │                                  │
                      │  1. Project agent override        │
                      │     .planning/config.json         │
                      │     → mmr.agent_overrides.{type}  │
                      │                                  │
                      │  2. Project default engine        │
                      │     .planning/config.json         │
                      │     → mmr.override_engine         │
                      │                                  │
                      │  3. Global routing rules          │
                      │     ~/.claude/mmr/config.json     │
                      │     → routing_rules.by_agent_type │
                      │                                  │
                      │  4. Fallback: "claude"            │
                      └─────────────────────────────────┘

  Workflow calls:
    ENGINE=$(node ~/.claude/mmr/router.js resolve <agent-type>)

  Returns: "claude" | "gemini"
```

## Default Routing Table

| Agent Type | Engine | Why |
|-----------|--------|-----|
| `gsd-phase-researcher` | gemini | 1M context, web search for research |
| `gsd-project-researcher` | gemini | Deep project research |
| `gsd-research-synthesizer` | gemini | Synthesize research outputs |
| `gsd-plan-checker` | gemini | Review plans (read-only) |
| `gsd-planner` | claude | Needs file editing |
| `gsd-executor` | claude | Needs file editing + bash |
| `gsd-verifier` | claude | Needs file reading |
| `gsd-debugger` | claude | Needs full tool access |
| `gsd-codebase-mapper` | claude | Needs file reading + writing |
| `gsd-roadmapper` | claude | Needs file editing |

## Quick Start

```bash
git clone https://github.com/cjplanted/mmr.git
cd mmr
./install.sh
```

That's it. Installs to `~/.claude/mmr/` and adds slash commands to `~/.claude/commands/`.

## Usage

### CLI

```bash
# Which engine should handle this agent?
node ~/.claude/mmr/router.js resolve gsd-phase-researcher
# → gemini

node ~/.claude/mmr/router.js resolve gsd-executor
# → claude

# View full routing table
node ~/.claude/mmr/router.js status
```

### Slash Commands (in Claude Code)

| Command | What it does |
|---------|-------------|
| `/mmr-status` | Show routing table and any project overrides |
| `/mmr-toggle` | Enable/disable MMR (disabled = all agents route to Claude) |
| `/mmr-set <agent> <engine>` | Override routing for an agent in the current project |

### In Workflows

```bash
# Standard integration pattern (with graceful fallback)
ENGINE=$(node ~/.claude/mmr/router.js resolve gsd-phase-researcher 2>/dev/null || echo "claude")

if [ "$ENGINE" = "gemini" ]; then
  gemini -p "$PROMPT" -y
else
  # Use Claude's Task() tool
fi
```

## Per-Project Overrides

Add an `mmr` key to `.planning/config.json` in any project:

```json
{
  "mmr": {
    "override_engine": "claude",
    "agent_overrides": {
      "gsd-phase-researcher": "claude"
    }
  }
}
```

- `override_engine` — routes ALL agents to this engine for this project
- `agent_overrides` — routes specific agents (takes priority over `override_engine`)

Or use the slash command:

```
/mmr-set gsd-phase-researcher claude
```

## Configuration

Global config lives at `~/.claude/mmr/config.json`:

```json
{
  "version": "1.0",
  "enabled": true,
  "default_engine": "claude",
  "engines": {
    "claude": {
      "cli": "claude",
      "description": "Claude Code - file editing, Task orchestration, code execution"
    },
    "gemini": {
      "cli": "gemini",
      "flags": ["-y"],
      "model": "gemini-3-preview-pro",
      "description": "Gemini CLI - 1M+ context, web search, research"
    }
  },
  "routing_rules": {
    "by_agent_type": {
      "gsd-phase-researcher": "gemini",
      "gsd-planner": "claude"
    }
  }
}
```

### Adding a New Engine

Add it to `engines` and reference it in routing rules:

```json
{
  "engines": {
    "openai": {
      "cli": "codex",
      "description": "OpenAI Codex CLI"
    }
  },
  "routing_rules": {
    "by_agent_type": {
      "gsd-phase-researcher": "openai"
    }
  }
}
```

The router just returns the engine name — the calling workflow decides how to invoke it.

## How It Works

1. Workflow calls `node router.js resolve <agent-type>`
2. Router checks 4 config layers in priority order (see Architecture above)
3. Returns an engine name string (`"claude"`, `"gemini"`, etc.)
4. Workflow branches on the result to invoke the right CLI

The router is stateless — it reads config files on each call, no daemon or cache.

## License

MIT
