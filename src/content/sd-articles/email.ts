import type { SystemDesignGuide } from "@/lib/types";

export const emailGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `An email client: folders, a large inbox, threaded reading, search, and a composer whose draft survives refresh.

Constraints that make it a system rather than a list:

- A folder can hold far more messages than you can put in the DOM. The list is a window of summaries.
- Opening a thread loads bodies. The list does not carry HTML.
- New mail does not move the selection or jump the scroll. It sets a “new mail” hint.
- Search is its own query across the mailbox, not a filter of the currently loaded page.
- Send is idempotent. A retry does not deliver twice.
- Drafts persist locally and on the server. Refresh keeps the newer of the two.
- Offline shows the last synced window. Sends either queue with a visible pending state or stay failed until the network returns. Design the queue. Do not imply mail was sent.

Keyboard: move in the list, open, reply, and send without a pointer. The message body is readable text, not a key-trap of nested click handlers.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Three panes: folders, a virtualized thread list, and the open thread. The composer is a layer that can sit over the thread or replace it, and it is keyed by draft id so a route change does not unmount the text into oblivion.

The list virtualizer asks for a page of summaries by cursor. Selection is a thread id, not an index, so an insert at the top does not open a different message.

Sync uses a token per folder. Poll or a push channel returns changes since the token: new ids, flag changes, deletes. Apply them to the entity cache. If the reader is scrolled into the list, do not reorder their viewport. Append the hint instead.

The body fetch is separate and cached by message id. Quoted replies can be collapsed.

Search hits an index endpoint and renders a result list that looks like the folder list but is a different query, with a banner that says these are results. Reusing the folder cursor for search is how you miss mail that was not loaded.

Send posts a client id. The draft remains until the ack. Then it is deleted. Attachments upload first and the send references their ids.`,
      diagram: {
        caption: "Summaries, bodies, and search are different reads. Send acknowledges a client id before the draft is dropped.",
        mermaid: `flowchart LR
  Folders[Folders]
  List[Virtualized summaries]
  Thread[Thread bodies]
  Search[Search index]
  Send[Send command]
  API[Mail API]
  Folders --> List
  List --> API
  Thread --> API
  Search --> API
  Send --> API`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
ThreadSummary { id, subject, from, snippet, unread, date, folderId }
Message { id, threadId, from, to, date, body, unread }
Draft { id, threadId?, to, subject, body, attachmentIds, updatedAt }
FolderWindow { folderId, ids, cursor, syncToken }
\`\`\`

Unread is a property you can change optimistically and reconcile from sync. Do not derive it by counting messages you have not loaded.

The sync token is opaque. If the server rejects it, you refetch the first page and say the view was refreshed. Guessing deltas from dates will skip mail.

Drafts: local copy and server copy, each with \`updatedAt\`. On load, the newer body wins, and you still keep the attachment ids from the server if the local copy lost them. Sign-out clears local drafts.

Outgoing queue: drafts in \`sending\` with a stable client message id. They are not removed because a folder sync came back without them. They were never in the folder yet.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /folders/{id}/threads?cursor=
→ { threads, nextCursor, syncToken }

GET /threads/{id}
→ { messages }

GET /search?q=
→ { threads, nextCursor }

PUT /drafts/{id}
{ body, to, subject, updatedAt }

POST /messages
{ clientId, draftId }
→ { messageId }
\`\`\`

Sync:

\`\`\`
GET /folders/{id}/changes?syncToken=
→ { upserts, deletes, syncToken }
\`\`\`

\`clientId\` makes send retry-safe. The server stores it. A second POST returns the original message id.

Bodies are HTML sanitized on the server before they reach the client, or sanitized in a hardened viewer. You do not assign unsanitized HTML into the page. Say that out loud. Mail is a hostile format.

Mark-read is a PATCH on the thread when it is opened, debounced so merely moving selection does not generate a write per row if you decide preview should not mark read. Choose one behavior and stick to it.`,
      diagram: {
        caption: "Sync applies flag changes. It does not delete a draft that has not been acknowledged.",
        mermaid: `sequenceDiagram
  participant List
  participant API
  participant Composer
  List->>API: changes since token
  API-->>List: upserts and deletes
  Composer->>API: POST message clientId
  API-->>Composer: messageId
  Composer->>Composer: drop draft`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Virtualization and selection

Rows are keyed by thread id. The selection ring follows the id. A sync that inserts three new threads at the top changes indexes and must not change which thread is open. The virtualizer’s scroll offset is preserved unless the user clicks the new-mail control.

## Draft races

Two tabs can edit one draft. Last-write-wins on \`updatedAt\` is acceptable if you show “updated in another window” when the server copy is newer than what you typed from. Silent overwrite of a longer body is the bug. Include a version or timestamp and refuse to PUT an older body over a newer one without the user confirming.

## Search versus browse

Search results can be incomplete while the index lags. Show that. Do not display a folder count as if it were the search count. Leaving search returns to the folder window you had, including its cursor, which you kept.

## Hostile content

Remote images in HTML are a tracking and a safety issue. Block them until the reader allows them for that message. Strip scripts. Links are real links with the URL visible on focus. Attachments are downloaded with a type you do not execute inline. This is part of the client design, not only a gateway’s problem, because the client decides what to preview.`,
    },
  ],
};
