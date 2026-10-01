import type { SystemDesignGuide } from "@/lib/types";

export const slidesGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A deck editor and a presenting mode. Authors edit slides, reorder them, and present to an audience view that can sit on another screen. More than one author can edit, with last-seen cursors and a history that can undo their own work.

What you commit to:

- A deck is an ordered list of slide ids plus a document per slide. Reordering does not rewrite every slide body.
- Presenting does not use the editor’s selection model. The audience window shows the current slide id only. Notes and the next thumbnail stay on the presenter window.
- Transitions are a view concern. Reduced motion shows a cut.
- Fonts, images, and the next slide are warm before the presenter advances, so the audience does not watch a spinner.
- Collaboration converges. Two people editing different slides do not block each other. Two people editing the same text box reconcile with a documented strategy.

Scale: decks of up to a few hundred slides. The filmstrip virtualizes. Only the active slide, its neighbors, and visible thumbnails are fully rendered.

Out of scope: a full design-tool pen engine, video calls, and a server-side animation runtime. Export to PDF or PPT is a job you name, not a client screenshot of the DOM.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Four pieces.

The deck model holds order, slide size, theme tokens, and the map of slides. Each slide is a scene: a list of objects with type, frame, and payload (text, image, shape). Frames are in slide coordinates, not screen pixels.

The editor mounts one slide scene, a filmstrip, and a property panel. Objects are addressable. Selection is local. Text editing can be a contenteditable or a canvas text run. Either way, the stored model is the structured object, not the HTML.

The collab layer ships operations: insert or delete a slide, move an object, set text. Slide order is its own sequence, so a reorder is one operation on the list. Text on a slide uses the same OT or CRDT approach you would defend for a doc, scoped to that object. Presence (cursors, the slide someone is viewing) is ephemeral and is not part of the document log.

Presenting opens a second view. \`BroadcastChannel\` is enough for two windows on one machine. A follow mode over the network is the same message, \`{ slideId, step }\`, published by the presenter. The audience client renders that slide from the same deck document. It does not screen-share pixels unless you are explicitly in a fallback.

## Rendering thumbnails

Thumbnails are either a cheap DOM scaled with CSS, or a raster generated when the slide changes and cached by version. Full fidelity DOM for 200 slides will jank. Say which you pick. Raster thumbnails can be stale for a moment. Mark them dirty when the scene version changes.

## Undo

Undo is a stack of inverse operations for this client, trimmed to their own ops if the product promises that. A remote reorder is not something your local undo silently reverses. If you cannot invert it, drop it from the stack and say so.`,
      diagram: {
        caption: "Editor and audience both read the deck. Only the editor writes operations. Presence is a side channel.",
        mermaid: `flowchart TB
  Editor[Editor view]
  Audience[Audience view]
  Deck[Deck order and slides]
  Ops[Operation log]
  Presence[Presence channel]
  Assets[Fonts and images]
  Editor --> Deck
  Audience --> Deck
  Editor --> Ops
  Ops --> Deck
  Editor --> Presence
  Audience --> Presence
  Deck --> Assets`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Deck: \`{ id, title, width, height, themeId, slideIds, version }\`.

Slide: \`{ id, objects, notes, version }\`. Object: \`{ id, type, x, y, w, h, z, payload }\`. Text payload stores runs, not a blob of HTML you cannot migrate. Image payload stores an asset id and crop, not the pixels.

Theme: \`{ fonts, colors, typeScale }\` referenced by id so a theme change does not rewrite every object.

Operations look like \`{ clientId, seq, slideId | null, kind, payload }\`. Idempotent on \`(clientId, seq)\`. A snapshot plus a tail of ops is how a joining client catches up. Compact the log server-side so a year of edits does not replay in the browser.

Presenter session: \`{ deckId, slideId, step, presenterId }\`. It is live state. If the presenter disconnects, the audience holds the last slide.

Assets are uploaded to signed URLs and referenced. A slide that still says “uploading” is not presentable. The advance control waits or skips with a reason.

Local recovery: persist the last snapshot and any unacked ops in IndexedDB so a refresh does not lose a sentence. On reconnect, send the unacked ops first, then pull the server tail.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /decks/{id}
→ { deck, slides, version }

POST /decks/{id}/ops
{ ops: [...] }
→ { applied, head }

WS deck:{id}
ops { op }
presence { clientId, slideId, cursor }
present { slideId, step }

POST /assets
→ { uploadUrl, assetId }
\`\`\`

Applying ops is ordered per object. A gap in \`seq\` waits briefly, then resyncs from the snapshot rather than guessing.

The filmstrip is a listbox. Reorder is keyboard accessible, not only drag. Presenter mode is a button that names the second window. Audience view hides notes. Notes are on the presenter side and are text, not an image.

Focus: editing text traps keys the way a text field should, and Escape returns to object selection so arrow keys move between objects again instead of typing arrows. Presenter advance is a specific key, and it does not fire while a text box is focused in the editor.

Images use a reserved box from \`w/h\` so the slide does not reflow when the file arrives.`,
      diagram: {
        caption: "An edit becomes an op. The other author applies it. Presenting is a separate message.",
        mermaid: `sequenceDiagram
  participant Author
  participant Log
  participant Peer
  participant Audience
  Author->>Log: text op
  Log-->>Peer: op
  Peer->>Peer: apply to slide
  Author->>Audience: present slide id
  Audience->>Audience: render that slide only`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Why slides are not one giant canvas

A design canvas stores freeform objects in world space. A deck has a discrete index, a fixed artboard, and a present order. Modeling slides as frames on one infinite canvas fights the filmstrip, the audience follow pointer, and per-slide permissions. Share objects through components in the theme if you need reuse. Do not make the user pan across a poster of every slide.

## Conflict on one text box

If you pick last-write-wins on the whole object, say that a slow network can erase a sentence. Prefer a text CRDT or OT scoped to the text payload, and last-write-wins only for the frame (x, y, w, h). Two people dragging the same box can tolerate a jump. Two people typing cannot tolerate dropped characters. Name that split.

## Presenter and the next slide

When the presenter is on slide N, the audience window and your own presenter chrome prefetch N+1 assets. Advance is instant if the slide scene is already in memory. If N+1 has an unready font, show the previous slide until the font loads or fall back to a theme stack you already have. Do not FOIT a live audience.

## Performance of the filmstrip

Virtualize the strip. Render nearby slides as light DOM. Far slides are rasters or even placeholders with the slide number. Dragging to reorder updates \`slideIds\` in one op after drop, and shows a local preview during the drag so you do not spam the log with every pointer move.`,
    },
  ],
};
