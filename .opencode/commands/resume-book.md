---
description: Resume book work globally or from a target chapter/paragraph
agent: build
---
Resume work on this Narrarium book.

Argument format:
- `/resume-book` for the latest overall book state
- `/resume-book chapter:002-ledger-suspicion` to resume before a target chapter
- `/resume-book chapter:002-ledger-suspicion 002-tense-exchange` to resume before a target paragraph
- Any remaining text after the target should be treated as the actual follow-up request.

Before doing anything else:
1. Parse `$ARGUMENTS`: if the first token starts with `chapter:`, use it as the chapter target; if the next token looks like a paragraph id or slug, use it as the paragraph target; everything after that is the follow-up request.
2. Call the `resume_book_context` MCP tool with the scoped `chapter` and optional `paragraph` when a target was provided; otherwise call it without scope.
3. Read the files it references, especially `context.md`, `story-design.md`, `notes.md`, any scoped chapter draft notes, the selected ghostwriter profile, scoped story summaries, `state/current.md`, `state/status.md` when present, and the latest files in `conversations/`.
4. Briefly restate where the book stands, what the latest conversation was doing, and the next best actions.
5. Then continue with the parsed follow-up request if one is present.
6. If no extra request is present, ask for the next book task only after giving the short status recap.

Prefer continuity over novelty. Respect `known_from`, `reveal_in`, and the selected ghostwriter profile.