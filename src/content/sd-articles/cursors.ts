import type { SystemDesignGuide } from "@/lib/types";

export const cursorsGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `On a shared design surface, show where other people are pointing and what they have selected, without storing that as part of the document and without melting the session when the room gets large.

What you commit to:

- Presence is ephemeral. A refresh does not restore cursors from the database. A disconnected client disappears within a few seconds.
- Your own cursor does not wait for a round trip. Everyone else’s is interpolated from samples.
- You send a throttled sample, on the order of 10 to 20 times a second while the pointer is moving, and a final sample when it stops. You do not send a message per pointer event.
- Clients outside your view can be omitted. Following someone is an explicit action, not the default.
- Selections and cursors share a presence channel and a client id, and they are not operations in the document log.

Scale: a design file might have dozens of editors and, if you are careless, a link that a thousand people open. The design must say who receives whom. “Broadcast every cursor to everybody” is the failure mode you are here to reject.

Out of scope: the object model of the canvas and the text CRDT. Those exist underneath. This design is the presence layer. Name the document path in one sentence so the interviewer knows you are not mixing the two logs.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A presence session per document, keyed by a client id that lives for the tab.

Local loop: pointer moves update your render immediately. A scheduler emits a sample \`{ x, y, pageOrCamera }\` at the throttle rate, in document coordinates, not screen pixels. On blur or \`pagehide\`, send a leave so you vanish before the timeout.

Remote loop: a map of client id to last sample, name, color, and selection. A render loop interpolates from the previous point to the latest over a short window so the motion is continuous even though samples are coarse. If no sample arrives before the stale timeout, drop that cursor. Do not leave ghosts.

Transport: a websocket or a provider’s awareness channel. Messages are unordered and last-write-wins per client id, with a clock so an old packet does not move someone backward. This is the opposite of the document log, which is ordered and durable.

Interest management: include your viewport rectangle in the presence state at a much lower rate than the pointer. The server, or the client if the room is small, forwards cursor samples that fall inside or near a subscriber’s viewport. Outside a small room, the server must do this. A browser should not be the fan-out node.

## Selection

Selection is a set of object ids, updated on change, not on a timer. It is drawn as outlines on those objects. It can be larger than the viewport. Send it when it changes, and also fold the latest selection into the cursor sample so a new subscriber learns it without a second protocol.

## Follow

Follow sets your camera to track another client’s viewport or cursor. It is a local mode plus a subscription that asks for that client even if they are outside the normal interest set. Stop following on the user’s next explicit pan.`,
      diagram: {
        caption: "Document ops and presence are different pipes. Presence is last-write-wins and expires.",
        mermaid: `flowchart LR
  Pointer[Local pointer]
  Self[Immediate self render]
  Tick[Throttle 10 to 20 Hz]
  Awareness[Presence channel]
  Remote[Remote cursor map]
  View[Viewport interest]
  DocLog[Durable document log]
  Pointer --> Self
  Pointer --> Tick
  Tick --> Awareness
  View --> Awareness
  Awareness --> Remote
  DocLog --> Self`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Presence record: \`{ clientId, userId, name, color, cursor, selection, viewport, updatedAt }\`.

\`cursor\` is \`{ x, y }\` in document space or null if the pointer left the surface. \`selection\` is \`string[]\` of object ids. \`viewport\` is \`{ x, y, w, h, zoom }\`.

Color comes from a stable hash of the user id so it does not change every refresh, and it is not the only label. The name is drawn. Do not rely on hue alone.

Clock: a logical clock or the sender’s monotonic sequence. Receivers keep the max sequence per client. Stale timeout is local wall clock since the last accepted sample. Say five seconds, or whatever you pick, and that hidden tabs might get timers throttled so the leave message matters more than the timeout.

You do not persist this map. You may keep names in a user cache that came from the member list, which is durable. The member list is “who can open the file.” Presence is “who is here now.”

Privacy: do not emit presence from a tab that is hidden, and do not include text the user is merely hovering if that leaks content off-screen to people outside the ACL. Presence stays inside the document’s authorized channel.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
WS doc:{id}/presence
hello { clientId, name, color }
state { cursor, selection, viewport, seq }
bye { clientId }

Server may send:
peers { records[] }
filtered state for your viewport
\`\`\`

Hello on connect, then state updates, then bye. A snapshot of current peers arrives on hello so you do not wait for everyone to wiggle their mouse.

There is no REST call that stores the cursor. If you add one for debugging, it is not the source of truth.

The overlay is absolutely positioned on the canvas, \`pointer-events: none\`, so it never steals the pen. Names are text. A list of participants, separate from the cursors, is the accessible surface: “Alex, viewing,” “Sam, selected 2 objects.” Do not expect a screen reader to track moving cursors. Live regions announce joins and leaves, not coordinates.

Reduced motion: snap or shorten interpolation. The data model does not change.`,
      diagram: {
        caption: "Samples are throttled and expire. The document log is not on this path.",
        mermaid: `sequenceDiagram
  participant A
  participant Channel
  participant B
  A->>Channel: hello
  Channel-->>A: current peers
  A->>Channel: cursor seq 40
  Channel-->>B: cursor if in viewport
  Note over B: drop A if silent past timeout
  A->>Channel: bye`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Why this is not the document protocol

Document operations must not drop. A lost cursor sample is replaced by the next one. If you push cursors through the same ordered log as shapes, you bloat history, slow down compaction, and risk head-of-line blocking behind a pointer flood. Split them. Yjs-style awareness is the usual reference: a sidecar map with a client id and a clock, garbage-collected when the client leaves.

## Coordinates

Screen positions are useless to a peer with a different zoom and pan. Convert to world space before send, and convert back with the receiver’s camera. If the product has pages, include the page id and do not draw a cursor for a page you are not looking at. Optionally show an off-page chip “Alex on page 3” from the presence record without drawing a false pointer.

## Fan-out math

Twenty editors at 20 Hz is 400 messages a second before fan-out. A hundred lurkers each receiving all of that is tens of thousands of deliveries. Viewport filtering and a server fan-out cut that to “cursors near me.” Also coalesce: if the outbound buffer already has a cursor state for a client, replace it instead of queueing. Latest only.

## Selection versus cursor

A selection of far-away objects still matters to the person editing them, and it matters less as a moving sprite. Send selections on change. Render outlines only for objects you have loaded in the viewport. If an object is not in memory, the participant list still shows the count. Do not fetch the whole document to paint a remote selection box.`,
    },
  ],
};
