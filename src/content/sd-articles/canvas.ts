import type { SystemDesignGuide } from "@/lib/types";

export const canvasGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A design-tool canvas: frames and shapes, selection, pan and zoom, and live cursors. Two people can edit different objects without corrupting the file. The same object needs a rule.

Separate three lifetimes, because mixing them is the usual failure:

- The document (objects, z-order, parents) survives reload.
- The camera (pan and zoom) is local. Another designer’s viewport is not your viewport.
- Presence (cursors, remote selections) is ephemeral and lossy. It is not written into the file.

Hit testing uses the camera to turn a pointer position into scene coordinates. Zoom does not change the document.

Undo of your own operations is in scope. Full history across two editors is the follow-up, not the first diagram.

Text editing inside a shape can be named and then deferred. If you include it, it uses the same operation log as geometry, not a side HTML string.

Offline edits are out of scope unless you have already explained the op log. A refresh reloads the document and drops cursors. That is acceptable and you should say it.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The scene store holds objects by id: geometry, style, parent, z-order, version. The view renders the set that intersects the camera, not necessarily every object on a huge file. Culling by bounds matters once a file leaves the dozens.

The camera is \`{ x, y, zoom }\` on the client. Rendering applies that transform. Selection chrome is drawn in screen space so handles stay usable when zoomed out, while hit testing still happens in scene space.

Edits are operations on one object id: create, update patch, delete, reorder. The server accepts an op with the version you read. A conflict returns the current object. Unrelated objects do not share a single document blob on every mouse move. Sending the whole file on drag is the design you are here to reject.

Presence is a second channel, throttled. Latest sample per user wins. No persistence, no ordering guarantee. A cursor position can be in scene coordinates so the other client can project it through their own camera.

If two people edit one object, the version (or a CRDT on that object’s geometry) decides. Averaging two x positions is not a merge. State last-writer with version, or a field-level merge, and pick one. Last-writer with a refetch on conflict is the simpler staff answer and it is honest.`,
      diagram: {
        caption: "Document ops are durable. The camera stays on the client. Cursors are a lossy channel.",
        mermaid: `flowchart TB
  Scene[Scene store]
  Camera[Local camera]
  View[Canvas view]
  Ops[Object operations]
  Presence[Cursor channel]
  Scene --> View
  Camera --> View
  View --> Ops
  Ops --> Scene
  View --> Presence`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Object {
  id, type, parentId,
  x, y, width, height, rotation,
  style, z,
  version
}

Op {
  objectId, patch, baseVersion, clientId
}

CursorSample {
  userId, x, y, t
}
\`\`\`

\`z\` or an ordered child list on the parent defines stacking. Reorder is an op on that list, not a full document rewrite.

The camera is not in \`Object\`. If you save “where I was looking”, it is a per-user view record, still not the shared file.

Presence samples are keyed by user id in a map with a received-at time. The render loop drops entries older than a few seconds. They are not in the snapshot you persist.

Selection is local ids, plus an optional presence broadcast of those ids so others can see your outline. Their outline is paint. It does not lock the object unless you add an explicit lock, which you should not sneak in.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /files/{id}
→ { objects }

POST /files/{id}/ops
{ objectId, patch, baseVersion }
→ { version } | { conflict, object }

WS presence { userId, x, y, selectionIds, t }
\`\`\`

Apply a successful op to that object only. On conflict, replace that object from the response and drop the local preview of the drag. Other objects in the file stay as they were.

Throttle presence to something like 10–20 samples a second per client. The server can fan out the latest and drop the rest. A client that falls behind should not buffer a minute of cursor replay. Jump to the latest.

Auth on every op: the user can edit this file. A view-only socket can send presence if you want “I’m looking” and must not send ops. Enforce that on the server.`,
      diagram: {
        caption: "A drag commits one object version. A conflicting drag refetches that object and leaves the rest of the file alone.",
        mermaid: `sequenceDiagram
  participant You
  participant API
  participant Them
  You->>API: patch object A version 2
  API-->>You: version 3
  Them->>API: patch object A version 2
  API-->>Them: conflict current A
  Note over Them: object B unchanged`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Hit testing and zoom

Screen point to scene point is the inverse camera transform. Walk objects from front to back using z-order and bounds. The first hit wins. Handles around a selection are hit in screen space so they stay large enough to grab. If you hit-test handles in scene space at 10% zoom, they become impossible. That split is worth saying.

## Why cursors are not operations

Cursor traffic dominates by count and is worthless after a second. Put it on a lossy channel. If you append it to the op log, the file grows without a design change, replay on load takes forever, and undo becomes nonsense. Drop stale samples. Never create an object because a cursor event arrived.

## Same object, two drags

Different objects commute: apply both. The same object’s geometry does not. Version check, reject the loser, refetch, discard the preview. If you need both edits (you changed fill and they changed x), that is field-level last-writer, which you can add once the single-version rule is clear. Do not average coordinates.

## History as the next question

Undo locally by inverting your last op and sending that inverse, mapped if the object version moved. A global history timeline across editors is a log of ops you can replay, compacted into snapshots. Offer that if they want a second staff topic. Do not pretend local undo is already multiplayer history.`,
    },
  ],
};
