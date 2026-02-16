#!/usr/bin/env node
/**
 * MMR (Multi-Model Router) - Routes GSD agent types to CLI engines.
 *
 * Usage:
 *   node router.js resolve <agent-type>   - Returns engine name
 *   node router.js status                 - Prints routing table
 *   node router.js --help                 - Show usage
 *
 * Resolution priority:
 *   1. Per-project override (.planning/config.json -> mmr.agent_overrides)
 *   2. Per-project default engine (.planning/config.json -> mmr.override_engine)
 *   3. Global routing rules (~/.claude/mmr/config.json)
 *   4. Fallback: "claude"
 */

const fs = require('fs');
const path = require('path');

const GLOBAL_CONFIG = path.join(require('os').homedir(), '.claude', 'mmr', 'config.json');
const PROJECT_CONFIG = path.join(process.cwd(), '.planning', 'config.json');

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

function loadGlobalConfig() {
  const config = loadJSON(GLOBAL_CONFIG);
  if (!config) {
    console.error(`MMR: Global config not found at ${GLOBAL_CONFIG}`);
    process.exit(1);
  }
  return config;
}

function loadProjectConfig() {
  return loadJSON(PROJECT_CONFIG);
}

function knownEngines(globalConfig) {
  return new Set(Object.keys(globalConfig.engines || {}));
}

function validateEngine(engine, globalConfig) {
  const known = knownEngines(globalConfig);
  if (!known.has(engine)) {
    console.error(`MMR: Unknown engine "${engine}" (known: ${[...known].join(', ')})`);
    return false;
  }
  return true;
}

function resolve(agentType) {
  const global = loadGlobalConfig();

  // MMR disabled -> always claude
  if (global.enabled === false) {
    console.log('claude');
    return;
  }

  const fallback = global.default_engine || 'claude';

  // Priority 1: Per-project agent override
  const project = loadProjectConfig();
  if (project?.mmr?.agent_overrides?.[agentType]) {
    const engine = project.mmr.agent_overrides[agentType];
    if (validateEngine(engine, global)) { console.log(engine); return; }
    console.log(fallback);
    return;
  }

  // Priority 2: Per-project default engine
  if (project?.mmr?.override_engine) {
    const engine = project.mmr.override_engine;
    if (validateEngine(engine, global)) { console.log(engine); return; }
    console.log(fallback);
    return;
  }

  // Priority 3: Global routing rules
  const engine = global.routing_rules?.by_agent_type?.[agentType];
  if (engine) {
    if (validateEngine(engine, global)) { console.log(engine); return; }
    console.log(fallback);
    return;
  }

  // Priority 4: Fallback
  console.log(fallback);
}

function status() {
  const global = loadGlobalConfig();
  const project = loadProjectConfig();

  console.log('=== MMR Routing Status ===');
  console.log(`Enabled: ${global.enabled !== false ? 'YES' : 'NO'}`);
  console.log(`Default engine: ${global.default_engine}`);
  console.log(`Config: ${GLOBAL_CONFIG}`);
  console.log('');

  console.log('Engines:');
  for (const [name, eng] of Object.entries(global.engines)) {
    console.log(`  ${name}: ${eng.cli}${eng.model ? ` (${eng.model})` : ''} - ${eng.description || ''}`);
  }
  console.log('');

  console.log('Routing Rules (by agent type):');
  const rules = global.routing_rules?.by_agent_type || {};
  const maxLen = Math.max(...Object.keys(rules).map(k => k.length));
  for (const [agent, engine] of Object.entries(rules)) {
    const override = project?.mmr?.agent_overrides?.[agent];
    const suffix = override ? ` [PROJECT OVERRIDE: ${override}]` : '';
    console.log(`  ${agent.padEnd(maxLen)}  -> ${engine}${suffix}`);
  }

  if (project?.mmr) {
    console.log('');
    console.log('Project Overrides:');
    if (project.mmr.override_engine) {
      console.log(`  Default engine: ${project.mmr.override_engine}`);
    }
    if (project.mmr.agent_overrides) {
      for (const [agent, engine] of Object.entries(project.mmr.agent_overrides)) {
        console.log(`  ${agent} -> ${engine}`);
      }
    }
  }
}

function help() {
  console.log(`MMR (Multi-Model Router) — route AI agents to different backends.

Usage:
  node router.js resolve <agent-type>   Returns the engine name for an agent
  node router.js status                 Show routing table and config
  node router.js --help                 Show this help

Examples:
  node router.js resolve gsd-phase-researcher    # → gemini
  node router.js resolve gsd-executor            # → claude

Integration (with graceful fallback):
  ENGINE=$(node ~/.claude/mmr/router.js resolve <agent-type> 2>/dev/null || echo "claude")

Requires: Node.js 16+`);
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'resolve':
    if (!args[0]) {
      console.error('Usage: node router.js resolve <agent-type>');
      process.exit(1);
    }
    resolve(args[0]);
    break;
  case 'status':
    status();
    break;
  case '--help':
  case '-h':
  case 'help':
    help();
    break;
  default:
    help();
    process.exit(1);
}
