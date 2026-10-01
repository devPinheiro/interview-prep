import type { SystemDesignGuide } from "@/lib/types";

export const whiteboardGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `An infinite board where people draw strokes, erase, and drop a few objects (sticky notes, shapes). Several people can draw at once. The board comes back after a refresh.

What you commit to:

- Document coordinates and the camera are different. Pan and zoom do not rewrite strokes.
- A stroke has an id and is idempotent to apply. Redraws and late packets do not duplicate it.
- Input uses pointer events, including coalesced points, so a fast pen does not become a polygon.
- Persistence is a snapshot plus new strokes since that snapshot. Joining clients do not replay an hour of points if a compacted picture exists.
- Undo removes your own latest stroke or object. It does not wipe the room.

Scale: a board can hold a large drawing. You render what intersects the viewport, plus a margin. Stroke points are simplified before you store them forever.

Out of scope: a full vector design tool with components, constraints, and export to production assets. A structured design canvas is a different product. This one is ink-first. Sticky notes and rectangles exist so the board is usable, and they follow the same id-and-op rules.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Camera, document, and input.

The camera is \`{ x, y, zoom }\` local to the client. Gesture or wheel updates it. The renderer transforms world points to screen with it. Remote users have their own cameras. You do not sync cameras unless someone hits “follow.”

The document is a set of strokes and objects by id, plus a z order. A stroke is a tool, a color, a width, and a polyline in world space. Eraser is either a stroke that covers with the background, or a delete of points it hits. Prefer a stroke object you can undo to “deleting whatever was underneath,” unless you truly compute a boolean cut. Say which.

Input: pointer down starts a local stroke with a client id. Pointer move appends points. You render the live stroke immediately. On pointer up, you commit an operation. While the pointer is down you may stream partial points so others see the ink, marked provisional until the commit id lands.

Rendering is canvas (2D or WebGL). DOM for thousands of points will fall over. Hit testing for selection uses simplified geometry or a spatial index of bounding boxes, not a pixel readback on every move.

## Sync

Send operations: begin stroke, append points, commit, delete, transform object. Each op has \`{ clientId, seq }\`. The server orders or the clients apply a CRDT set of strokes. Ink tolerates eventual consistency better than a text document, but a stroke id must still be unique and sticky.

Presence of cursors can ride along at a lower rate. It is not part of the stroke log.

## Compaction

When the log passes a threshold, the server stores a snapshot (stroke list already simplified, or a set of tiles) and drops compacted ops. Clients that connect later download the snapshot and only the tail. Tiles help if one corner of the board is dense: fetch tiles that intersect the camera.`,
      diagram: {
        caption: "Local ink is instant. The log stores committed strokes. The camera never enters the document.",
        mermaid: `flowchart TB
  Pointer[Pointer events]
  Live[In progress stroke]
  Doc[Stroke and object map]
  Cam[Local camera]
  Canvas[Canvas renderer]
  Log[Op log and snapshots]
  Peers[Other clients]
  Pointer --> Live
  Live --> Canvas
  Live --> Log
  Log --> Doc
  Doc --> Canvas
  Cam --> Canvas
  Log --> Peers
  Peers --> Doc`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Stroke: \`{ id, authorId, tool, color, width, points: [{x,y,p}] }\`. \`p\` is pressure if the pen reports it. Simplify with a point-reduction pass (a Ramer–Douglas–Peucker style tolerance, named as a choice) before the commit is stored, and keep the raw points only for the in-progress stroke.

Object: \`{ id, type, x, y, w, h, text }\` for a note or a shape.

Op: \`{ id, clientId, seq, kind, strokeId, points? }\`. Append ops can be merged into the stroke for storage. The wire form can be noisy. The stored form should not be.

Camera is not persisted as board state. You may remember the last camera locally so reopen feels familiar.

Permissions: a board token says view or draw. Viewers receive ops and do not send them. A 403 on send disables tools and says so.

Bounds: a session that never compacts will exhaust memory. State a cap and a snapshot policy. Also cap points per stroke so a stuck pointer cannot grow without limit.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /boards/{id}?snapshot=latest
→ { snapshot, tail }

WS board:{id}
op { clientId, seq, kind, ... }
cursor { clientId, x, y }

POST /boards/{id}/ops
{ ops }
→ { accepted }
\`\`\`

Provisional points and the committed stroke share an id so peers replace the preview instead of drawing it twice.

The toolbar is buttons with the tool name. Color is not the only signal. The board region is labeled. Keyboard: undo, redo, tool switch, delete selection. A pure canvas has no accessible tree for arbitrary ink. Provide a list of objects (notes and shapes) that keyboard users can focus and edit, and do not claim the ink itself is a text equivalent. If the meeting needs an equivalent, notes are the path.

Zoom controls are buttons as well as the wheel. Pinch-zoom uses pointer events and does not fight browser zoom in a way you cannot explain.`,
      diagram: {
        caption: "A pen stroke paints locally, then commits once. Peers apply the same stroke id.",
        mermaid: `sequenceDiagram
  participant Pen
  participant Local
  participant Log
  participant Peer
  Pen->>Local: pointer down and move
  Local->>Local: draw provisional
  Pen->>Local: pointer up
  Local->>Log: commit stroke id
  Log-->>Peer: stroke
  Peer->>Peer: draw once`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Latency while drawing

If you wait for the server to show your own ink, the pen feels broken. Local preview is mandatory. The commit confirms the id. If the server rejects it, remove the preview and surface the error. Echoed ops with your own id are ignored so you do not double-draw.

## Viewport culling

Transform the camera bounds into world bounds and draw strokes whose boxes intersect them. A spatial hash or a simple grid is enough to say out loud. During pan, request tiles for the new area and keep the previous frame until they arrive. Do not clear the canvas to blank on every move.

## Eraser and undo

Model eraser as \`deleteStroke\` ids you hit, or as a mask. Delete-id is easier to undo: undo restores the stroke id. A mask is harder to invert. Per-user undo stacks store inverse ops. A remote delete of your stroke does not have to be undoable by you. Define that. Redo stops applying once a new local stroke is committed.

## Collaboration pressure

A lecture with hundreds of viewers should not have hundreds of cursors and stroke streams at 60 Hz. Drawers are few. Viewers subscribe to commits, not to every provisional point, or you coarsen provisional updates. Say the interest set. A board that broadcasts every coalesced point to every client will fall over before the ink looks pretty.`,
    },
  ],
};
