import type { SystemDesignGuide } from "@/lib/types";

export const editorGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A collaborative rich text editor: headings, lists, links, and two people in the same document. Comments and permissions can wait. Convergence cannot.

What “works” means:

- Each client has a local document that stays responsive while offline for a moment. Keystrokes do not round-trip before they paint.
- When two people type, both edits survive unless they changed the same characters, and even then the rule is defined. You do not drop a paragraph because a second socket message arrived.
- Reload restores the document. Cursors of other people do not need to survive reload.
- Undo undoes your own edits, not the other person’s last paragraph. That distinction is the staff-level fork in the road.
- The editor is accessible: it is a real editing host, headings are headings, and a toolbar button has a name and a pressed state.

Out of scope for the first design: suggesting edits, version history UI beyond a snapshot id, and exporting to PDF.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Separate three things that teams glue together and then cannot debug.

The editor model holds a document tree (blocks and inline marks) and a selection. This is what paint and the toolbar read. A mature approach is a structured document, not a \`contentEditable\` blob you diff as HTML. HTML inside \`contentEditable\` will diverge between browsers. A document model with a view layer will not.

The sync layer turns local transactions into operations and merges remote operations into the model. Two families exist. Operational transformation rewrites an operation against concurrent ones so the server can keep one canonical history. CRDTs (a sequence CRDT or a rich-text Yjs-style structure) merge without a single server ordering, at the cost of metadata and tombstones. For a hosted editor with a server, either works if you pick one and keep the server as the persistence log. Do not invent a third scheme that diffs HTML strings.

Presence is a side channel: cursors and selections in document positions, throttled, dropped on timeout. A cursor is not an operation in the document log.

The server stores a snapshot plus a log of updates after that snapshot. A client that connects asks for the snapshot and the tail, applies them, then streams. If the tail is gone, it takes a new snapshot.

Undo is a stack of inverse steps on the local client, tagged with the client id, so remote updates are not popped when you press undo.`,
      diagram: {
        caption: "The document model paints. Sync merges updates. Presence never enters the log.",
        mermaid: `flowchart TB
  View[Editor view]
  Model[Document model]
  Sync[Sync layer]
  Log[Snapshot and update log]
  Presence[Cursor channel]
  View --> Model
  Model --> Sync
  Sync --> Log
  View --> Presence`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Document: a list of blocks. A block has an id, a type (paragraph, heading, list item), and inline text with marks (bold, link). Ids on blocks let a remote paragraph move without you matching strings.

An update is an opaque blob produced by the sync library, or an explicit op:

\`\`\`
insertText { blockId, index, text, clientId }
deleteText { blockId, index, length, clientId }
addMark { range, mark }
\`\`\`

If you use a CRDT, the stored form is the CRDT state, and these ops are how you explain it, not necessarily the wire format. Say that. Interviewers want the merge rule more than the byte layout.

Positions for cursors are \`{ blockId, offset }\` plus a client id and a color. They are invalid after an edit at that offset, so the sync layer maps them through the same transform as the text. A cursor stored as a raw index into a string that someone else edited will point at the wrong character.

Snapshot id plus update sequence lets a client resume. Compaction rewrites a snapshot and drops the prefix of the log on a schedule, so a document opened for a year does not replay a million keystrokes.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /docs/{id}
→ { snapshot, updatesAfter }

WS /docs/{id}
client → update { blob }
server → update { blob, seq }

presence { clientId, blockId, offset }
\`\`\`

The websocket is not the only way to save. A periodic POST of the latest snapshot covers a client that cannot hold the socket, and the server rejects it if \`seq\` is behind, forcing a reload of the tail. That prevents a stale tab from overwriting the doc with an old HTML dump. If your design allows that overwrite, it is the wrong design.

Toolbar commands go through the model (toggle mark on the selection) and produce the same kind of update as typing. Do not special-case the network for the bold button.

Permissions: the socket authenticates as a user who can edit or only view. A view-only client ignores local transactions and does not send updates. The check is on the server for every update, not only when the page loads.`,
      diagram: {
        caption: "Local typing paints first, then ships an update. A behind snapshot is rejected.",
        mermaid: `sequenceDiagram
  participant Editor
  participant Model
  participant Server
  Editor->>Model: insert text
  Model->>Server: update blob
  Server-->>Model: seq
  Note over Server: stale snapshot POST is rejected
  Server-->>Editor: remote update
  Editor->>Model: merge`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Why not contentEditable as the source of truth

Browsers disagree on the markup they produce for the same gesture. Collaboration on that markup means you are merging accidents. Keep \`contentEditable\` or a custom view as a projection of the model. The model is what you sync. When the view and the model disagree, the model wins and the view rerenders the selection carefully so the caret does not jump.

## Undo with two authors

Local undo inverts your last transaction. Remote transactions are rebased onto the document but not pushed as your undo steps. If you undo across a remote insert in a naive string, you will delete their text. The inverse must be defined on your operation, mapped through concurrent ops the same way the sync layer maps everything else. If you cannot explain that mapping, say you ship per-client undo and you have tested the overlapping case. Hand-waving “we use a library” is acceptable only if you can name what the library guarantees.

## Cursors and selection

Send presence on a throttle of about 50–100ms, not per key. Map the position through incoming updates before you paint the other caret. Drop it if no sample arrives for a few seconds. Never write cursors into the snapshot. A document that grows because it saved carets is a document you will regret.

## Offline

Queue outbound updates in order while the socket is down. Do not let the user think the server has them. A visible “offline, changes local” state is part of the editor chrome. On reconnect, send the queue, then pull any remote tail you missed, and merge. If the server compacted past your base snapshot, fetch a new snapshot and rebase or ask the user to reload if you cannot. State the reload case. Hiding it is how you lose text.`,
    },
  ],
};
