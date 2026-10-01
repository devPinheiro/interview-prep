import type { SystemDesignGuide } from "@/lib/types";

export const chatGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A multi-conversation chat client: timelines, a composer, attachments, typing indicators, and a connection that drops.

Guarantees you must state:

- The server orders messages. Client clocks do not.
- Send is optimistic and idempotent. A retry does not create a second bubble.
- History is a window. Opening a conversation loads a page, and scrolling up loads older pages without jumping the reader.
- If the reader is at the tail, new messages stick to the bottom. If they have scrolled up, they stay, and a “New messages” control appears.
- Typing and presence are ephemeral. They are not stored as messages.
- Drafts survive a route change. Offline send is either supported with a visible pending state or explicitly out of scope. Pick one. The default below is: drafts persist, sends require a connection, and a failed send stays in the thread with retry.

Accessibility: the log is a region that announces new messages without re-reading the history, and the composer is a labeled text field with a real send button.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `HTTP loads history and accepts sends. A websocket (or SSE) delivers events. Reconnect uses a resume cursor. If the gap is too large, refetch the latest window and merge by id.

The conversation list reads summaries. The open route reads one timeline. The timeline is virtualized: only rows near the viewport exist in the DOM, with a sticky composer. Prepending older pages is the layout bug everyone ships once. Measure the previous anchor row and restore its offset after the prepend.

The composer writes a draft keyed by conversation id, local first. Send creates a message with \`clientMessageId\` and status \`sending\`. The acknowledgement maps that id to the server message. Failure sets \`failed\` and leaves the body in place.

Attachments upload on a separate request and return an id the send payload references. Upload progress is not the same state as message acknowledgement.

The connection manager is app-wide. Typing events are a projection on top of it, throttled, and discarded after a short TTL. They never enter the message map.`,
      diagram: {
        caption: "History and sends use HTTP. The socket streams events and resumes from the last sequence.",
        mermaid: `flowchart TB
  List[Conversation list]
  Timeline[Virtualized timeline]
  Composer[Composer]
  Store[Message store]
  HTTP[History and send HTTP]
  Socket[Event socket]
  List --> Store
  Timeline --> Store
  Composer --> Store
  HTTP --> Store
  Socket --> Store`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Message {
  id: string            // server id once acked
  clientMessageId: string
  conversationId: string
  sequence: number
  body: string
  attachmentIds: string[]
  status: "sending" | "sent" | "failed"
}
\`\`\`

The timeline query stores \`{ ids in order, olderCursor, latestSequence }\`, not an unstructured array you sort by \`Date.now()\` on the client. Duplicates collapse on server id, and the optimistic row collapses on \`clientMessageId\` when the ack arrives.

Draft: \`{ conversationId, text, updatedAt }\` in memory and in local persistence. Pending sends are the messages still in \`sending\` or \`failed\`. A reconnect must not wipe them.

Typing: \`{ conversationId, userId, expiresAt }\` outside the message store. Read state, if you show receipts, is a watermark sequence per member, not a boolean on every row that you fan out blindly. A receipt advances the watermark.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /conversations/{id}/messages?before={cursor}&limit=50
→ { messages, nextBefore, latestSequence }

POST /conversations/{id}/messages
{ clientMessageId, body, attachmentIds }
→ { messageId, sequence, createdAt }

event message.created { conversationId, message, sequence }
event resume { afterSequence }
\`\`\`

\`clientMessageId\` is generated once per send attempt group, not once per retry click. The server treats a repeat as the same message.

\`latestSequence\` is the resume point. On reconnect, ask for events after that sequence. If the server says the gap expired, replace the window via the GET and keep any local rows whose \`clientMessageId\` is still unacknowledged.

The composer’s send control is disabled only while the current attempt is in flight, and a failed row has its own retry. Do not block the whole conversation on one attachment.`,
      diagram: {
        caption: "An optimistic row is reconciled by client id. A reconnect that missed events refetches instead of guessing.",
        mermaid: `sequenceDiagram
  participant Composer
  participant Store
  participant API
  participant Socket
  Composer->>Store: row with clientMessageId
  Composer->>API: POST message
  API-->>Store: messageId and sequence
  Store->>Store: merge by clientMessageId
  Socket-->>Store: later events after sequence`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Ordering and duplicates

Events can arrive twice and can arrive after the optimistic insert. Deduplicate by server id. Order by server sequence. If a client timestamp disagrees, the sequence wins. Say that in the interview before anyone asks. A tie-break on time is how two devices render different orders.

## Scroll anchoring

At the tail, appending a row should keep the tail in view. Scrolled up, do not snap. When older history is prepended, the pixels above the current row change height. Capture the first visible row and its offset, render, then set scroll so that row stays put. Virtualized lists that use index as the key will animate the wrong rows. Key by message id.

## Attachments and drafts

Upload first to a short-lived slot, then send the message with the returned ids. A failed upload leaves retry and remove on that attachment, and the text draft remains. Persist drafts locally with a retention window you can explain. A shared computer should not keep another person’s unsent text forever. Clear drafts on sign-out.

## Announcements

A live region can say “New message from Ada” when the conversation is open and the reader is not in the middle of the history. It must not dump the entire log. Typing indicators are polite and easily silenced. Receipts do not need to be announced on every tick.`,
    },
  ],
};
