---
name: deep-research
description: Manage deep research sessions for the Narrarium book. Research historical facts, world-building topics, or any factual subject and save results to deepresearches/. Supports multi-phase research with outline, deep investigation, and final report.
---

# Skill: deep-research

## Purpose

Run structured multi-phase research sessions and save all results to `deepresearches/` inside the book repository.

Use this skill when:
- Researching historical events, people, or places for the book
- Comparing multiple topics (technologies, periods, concepts) systematically
- Building a well-sourced world-building document
- Any research that should be saved permanently in the book repo

## Quick workflow

1. `/research <topic>` — Generate outline and fields in `deepresearches/{topic}/`
2. (Optional) `/research-add-items` or `/research-add-fields` — Extend the outline
3. `/research-deep` — Run deep investigation (web search) for each item
4. `/research-report` — Generate final `report.md` in `deepresearches/{topic}/`

## Output folder

All results are stored in:

```
deepresearches/{topic}/
  ├── outline.yaml        # items list + execution config
  ├── fields.yaml         # field definitions
  ├── results/            # one JSON file per researched item
  │   └── {item}.json
  └── report.md           # final markdown report
```

## Web search requirement

Web search works in OpenCode when `OPENCODE_ENABLE_EXA=1` is set (see `opencode.jsonc` env section).
For Claude Code, the web-search-agent sub-agent must be installed in `~/.claude/agents/`.

See `.opencode/agents/web-search.md` and `.claude/agents/web-search-agent.md` for the configured sub-agents.

## Wikipedia research

For quick factual lookups, prefer the MCP tool `wikipedia_page` or `wikipedia_search` first.
Those save snapshots to `research/wikipedia/` and can be reused without re-fetching.

Use the deep-research skill when you need broader web sources beyond Wikipedia.

## Rule

Always save deep research output to `deepresearches/`, never to a temporary or arbitrary path.
