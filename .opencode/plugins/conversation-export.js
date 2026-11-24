import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_RESUME_LENGTH = 900;
const MAX_CONTINUATION_LENGTH = 1400;
const pending = new Map();

export const ConversationExportPlugin = async ({ client, worktree, directory }) => {
  const root = worktree || directory;
  const conversationsDir = path.join(root, "conversations");
  const sessionsDir = path.join(conversationsDir, "sessions");

  return {
    event: async ({ event }) => {
      if (!event || (event.type !== "session.idle" && event.type !== "session.updated")) {
        return;
      }

      const sessionId = extractSessionId(event);
      if (!sessionId) {
        return;
      }

      if (pending.has(sessionId)) {
        clearTimeout(pending.get(sessionId));
      }

      const timer = setTimeout(() => {
        void exportConversation(client, conversationsDir, sessionsDir, sessionId);
        pending.delete(sessionId);
      }, event.type === "session.updated" ? 1200 : 250);

      pending.set(sessionId, timer);
    },
  };
};

async function exportConversation(client, conversationsDir, sessionsDir, sessionId) {
  const config = await loadConversationsConfig(conversationsDir);
  const saveSessionFiles = config.saveSessionFiles !== false;

  const session = unwrap(await client.session.get({ path: { id: sessionId } }));
  const messages = unwrap(await client.session.messages({ path: { id: sessionId } }));

  if (!session || !Array.isArray(messages)) {
    return;
  }

  const title = session.title || `session-${sessionId}`;
  const stamp = formatDateForFile(session.updatedAt || session.createdAt || Date.now());
  const slug = slugify(title);
  const baseName = `${stamp}--${slug}--${sessionId}`;

  const structuredMessages = messages.map((entry) => ({
    id: entry.info?.id || "",
    role: entry.info?.role || entry.info?.type || "assistant",
    createdAt: entry.info?.createdAt || null,
    parts: Array.isArray(entry.parts) ? entry.parts : [],
    text: messageText(Array.isArray(entry.parts) ? entry.parts : []),
  }));

  let sessionFilePath = null;

  if (saveSessionFiles) {
    await mkdir(sessionsDir, { recursive: true });
    const markdownPath = path.join(sessionsDir, `${baseName}.md`);
    const jsonPath = path.join(sessionsDir, `${baseName}.json`);
    const markdown = renderConversationMarkdown({
      sessionId,
      title,
      createdAt: session.createdAt || null,
      updatedAt: session.updatedAt || null,
      messages: structuredMessages,
    });
    await writeFile(markdownPath, markdown, "utf8");
    await writeFile(jsonPath, JSON.stringify({ session, messages: structuredMessages }, null, 2) + "\n", "utf8");
    sessionFilePath = markdownPath;
  }

  const latestUser = findLatestMessage(structuredMessages, "user");
  const latestAssistant = findLatestMessage(structuredMessages, "assistant");
  const latestExcerpt = summarizeText(latestAssistant?.text || latestUser?.text || "", MAX_RESUME_LENGTH);
  const resumeExportLine = sessionFilePath
    ? `- Export: ${toPosix(path.relative(conversationsDir, sessionFilePath))}`
    : null;
  await writeFile(
    path.join(conversationsDir, "RESUME.md"),
    [
      "# Conversation Resume",
      "",
      `- Latest session: ${title}` ,
      `- Session id: ${sessionId}` ,
      `- Updated: ${formatDateForDisplay(session.updatedAt || session.createdAt || Date.now())}` ,
      ...(resumeExportLine ? [resumeExportLine] : []),
      "",
      "## Latest user intent",
      "",
      summarizeText(latestUser?.text || "No user message captured yet.", MAX_RESUME_LENGTH),
      "",
      "## Latest assistant state",
      "",
      latestExcerpt || "No assistant response captured yet.",
    ].join("\n"),
    "utf8",
  );

  const continuationSessionLine = sessionFilePath
    ? `7. conversations/sessions/${baseName}.md`
    : null;
  await writeFile(
    path.join(conversationsDir, "CONTINUATION.md"),
    [
      "# Continuation",
      "",
      "Use this file when restarting work in a fresh OpenCode session.",
      "",
      "## Read first",
      "",
      "1. The selected ghostwriters/<slug>.md profile",
      "2. plot.md",
      "3. resumes/total.md",
      "4. state/current.md",
      "5. state/status.md if it shows dirty: true",
      "6. Any matching files in drafts/",
      ...(continuationSessionLine ? [continuationSessionLine] : []),
      "",
      "## Current conversation snapshot",
      "",
      `- Session: ${title}` ,
      `- Session id: ${sessionId}` ,
      `- Updated: ${formatDateForDisplay(session.updatedAt || session.createdAt || Date.now())}` ,
      "",
      "## Latest user request",
      "",
      summarizeText(latestUser?.text || "No user request captured yet.", MAX_CONTINUATION_LENGTH),
      "",
      "## Latest assistant response",
      "",
      summarizeText(latestAssistant?.text || "No assistant response captured yet.", MAX_CONTINUATION_LENGTH),
      "",
      "## Resume prompt",
      "",
      "Run `/resume-book` or ask OpenCode to resume work from repository state, exported conversations, plot, resumes, state snapshots, and drafts before continuing.",
    ].join("\n"),
    "utf8",
  );
}

async function loadConversationsConfig(conversationsDir) {
  try {
    const raw = await readFile(path.join(conversationsDir, "config.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function renderConversationMarkdown({ sessionId, title, createdAt, updatedAt, messages }) {
  return [
    "---",
    "type: conversation-export",
    `id: conversation:${sessionId}` ,
    `title: ${escapeYaml(title)}` ,
    `created_at: ${createdAt || ""}` ,
    `updated_at: ${updatedAt || ""}` ,
    "---",
    "",
    "# Conversation Export",
    "",
    ...messages.flatMap((message, index) => [
      `## ${index + 1}. ${capitalize(message.role)}` ,
      "",
      message.text || "No plain-text content.",
      "",
    ]),
  ].join("\n");
}

function findLatestMessage(messages, role) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === role) return messages[index];
  }
  return null;
}

function extractSessionId(event) {
  const props = event.properties || {};
  return props.id || props.sessionID || props.sessionId || props.session?.id || props.info?.id || null;
}

function unwrap(result) {
  return result && typeof result === "object" && "data" in result ? result.data : result;
}

function formatDateForFile(value) {
  const date = new Date(value);
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return [
    safe.getUTCFullYear(),
    String(safe.getUTCMonth() + 1).padStart(2, "0"),
    String(safe.getUTCDate()).padStart(2, "0"),
    "-",
    String(safe.getUTCHours()).padStart(2, "0"),
    String(safe.getUTCMinutes()).padStart(2, "0"),
  ].join("");
}

function formatDateForDisplay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function slugify(value) {
  return String(value || "conversation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "conversation";
}

function summarizeText(value, maxLength) {
  const text = String(value || "").replace(/s+/g, " ").trim();
  if (!text) return "";
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3).trim()}...`;
}

function messageText(parts) {
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      if (part.type === "text") return part.text || "";
      if (typeof part.text === "string") return part.text;
      try {
        return JSON.stringify(part, null, 2);
      } catch {
        return String(part.type || "part");
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function escapeYaml(value) {
  return JSON.stringify(String(value || ""));
}

function capitalize(value) {
  const text = String(value || "message");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
