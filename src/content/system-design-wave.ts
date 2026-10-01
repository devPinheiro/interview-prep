import { videoGuide, cartGuide, emailGuide, calendarGuide, kanbanGuide, rideGuide, spreadsheetGuide, canvasGuide } from "@/content/sd-articles";
import type { Level, Question } from "@/lib/types";

const refs = [
  { site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" },
];

type Guide = NonNullable<Question["systemDesignGuide"]>;
type Radio = NonNullable<Question["radioSteps"]>;

function design(input: {
  id: string;
  topic: string;
  level: Level;
  title: string;
  tags: string[];
  prompt: string;
  hints: string[];
  approach: string;
  solution: string;
  interviewerNotes: string;
  radioSteps: Radio;
  systemDesignGuide: Guide;
}): Question {
  return {
    id: input.id,
    track: "system-design",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.interviewerNotes,
    sourceRefs: refs,
    radioSteps: input.radioSteps,
    systemDesignGuide: input.systemDesignGuide,
  };
}

export const systemDesignWave: Question[] = [
  design({
    id: "sd-video-player",
    topic: "sd-video-streaming-player--design-the-frontend-for",
    level: "senior",
    title: "Design a video streaming player",
    tags: ["media", "performance"],
    prompt:
      "Design the frontend for a video streaming player: playback, quality switches, captions, and resume across a slow network.",
    hints: [
      "The player is a state machine, not a video tag with buttons.",
      "Buffer and bitrate are separate from the visible controls.",
    ],
    approach:
      "Name the playback states first, then the controls and the media source. Put captions and resume on the contract before adaptive bitrate.",
    solution:
      "A shell owns play, pause, seek, volume, and caption selection. The media element (or MSE buffer) reports current time, buffered ranges, and errors. Quality changes are suggested by bandwidth and applied at a segment boundary so the picture does not restart. Resume stores the last position per title and asks before jumping. Captions are a timed-text track, not burned into the video. Keyboard and a visible control bar remain available when the pointer hides.",
    interviewerNotes:
      "Listen for the state machine, stall handling, and captions. Bitrate ladders without a recovery path are incomplete.",
    radioSteps: {
      requirements: [
        "Live versus on-demand, and whether resume or DVR is in scope",
        "Captions, audio tracks, and quality selection",
        "Keyboard, captions, and reduced-motion for animated overlays",
      ],
      architecture: [
        "Control shell separate from the media engine",
        "Segment buffer with a quality policy at boundaries",
        "Error and stall path that does not destroy the session",
      ],
      data: [
        "Manifest: renditions, caption tracks, duration",
        "Session: position, chosen caption, volume, last quality",
      ],
      interface: [
        "Play, seek, captions, and a visible focus order",
        "Buffering and offline states that leave the controls usable",
      ],
      observability: ["Startup time", "Rebuffer count", "Caption-track errors"],
    },
    systemDesignGuide: videoGuide,
  }),
  design({
    id: "sd-commerce-cart",
    topic: "sd-e-commerce-cart--design-the-frontend-for",
    level: "senior",
    title: "Design an e-commerce cart",
    tags: ["commerce", "checkout"],
    prompt:
      "Design the frontend for a shopping cart: quantity edits, sold-out lines, price changes, and a checkout handoff that cannot double-charge.",
    hints: [
      "The server prices the cart. The client displays it.",
      "A cart id and an idempotency key are different.",
    ],
    approach:
      "Separate the bag from checkout. Every mutation returns the new priced cart. Optimistic quantity edits must roll back when inventory disagrees.",
    solution:
      "The cart is a list of lines keyed by a stable line id, plus totals computed on the server. Changing quantity sends the cart version; a conflict returns the fresh cart instead of silently merging. Sold-out lines stay visible and block checkout with a reason. The checkout button creates an order with an idempotency key so a double click does not place two orders. Guest carts merge into the account cart on sign-in by explicit rules, not by appending blindly.",
    interviewerNotes:
      "The senior signal is price and inventory authority, plus a checkout that is safe to retry.",
    radioSteps: {
      requirements: [
        "Guest versus signed-in carts, and the merge rule",
        "Which line changes are allowed after price or stock moves",
        "What checkout must guarantee on a double submit",
      ],
      architecture: [
        "Cart view reads a server-priced document",
        "Mutations return the whole cart, not a patched quantity",
        "Checkout is a separate command with its own key",
      ],
      data: [
        "Line: id, sku, quantity, unit price, availability",
        "Cart version for conflict detection",
      ],
      interface: [
        "Quantity controls with a pending state per line",
        "Blocked checkout that names the offending line",
      ],
      observability: ["Cart mutation failures", "Checkout duplicate suppression", "Abandonment after a price change"],
    },
    systemDesignGuide: cartGuide,
  }),
  design({
    id: "sd-email-client",
    topic: "sd-email-client--design-the-frontend-for",
    level: "senior",
    title: "Design an email client",
    tags: ["mail", "lists"],
    prompt:
      "Design the frontend for an email client: a large inbox, threads, search, and a composer that survives a refresh.",
    hints: [
      "The inbox is a window, not every message in the DOM.",
      "A draft is local state until send succeeds.",
    ],
    approach:
      "Normalize messages, virtualize the list, and treat send as an idempotent command. Search is a separate query from the folder cursor.",
    solution:
      "Folders address a cursor of thread summaries. Opening a thread loads its messages by id. The list is virtualized and keeps selection stable when new mail arrives at the top. The composer saves a draft locally and on the server, and send uses a client message id so a retry does not duplicate. Search hits an index and does not reuse the folder cursor. Offline shows the last synced window and queues send until the network returns, with a visible pending state.",
    interviewerNotes: "Listen for virtualization, draft durability, and a send that is safe to retry.",
    radioSteps: {
      requirements: [
        "Folders, threads, and expected inbox size",
        "Draft and send behavior when offline",
        "Search versus browsing",
      ],
      architecture: [
        "Summary list separate from the open thread",
        "Composer with a durable draft",
        "Sync cursor for new mail that does not jump the reader",
      ],
      data: [
        "Thread summary versus full message bodies",
        "Client id on outgoing mail",
      ],
      interface: [
        "Keyboard traversal of the list and the message",
        "Unread changes announced without rereading the whole inbox",
      ],
      observability: ["List scroll jank", "Send failure rate", "Search latency"],
    },
    systemDesignGuide: emailGuide,
  }),
  design({
    id: "sd-calendar",
    topic: "sd-calendar--design-the-frontend-for",
    level: "mid",
    title: "Design a calendar",
    tags: ["calendar", "time"],
    prompt:
      "Design the frontend for a calendar: month and week views, overlapping events, time zones, and creating an event without losing the draft.",
    hints: [
      "Render a visible window of events, not a year of DOM nodes.",
      "Store instants in UTC and format in the viewer’s zone.",
    ],
    approach:
      "Choose the visible range first. Events are interval data. Overlaps are a layout problem on top of that data, not a second source of truth.",
    solution:
      "The view state is a range plus a mode (month, week, day). Fetch events that intersect the range. Layout stacks overlapping intervals into columns so two meetings at 10:00 both show. All instants are UTC; the grid labels use the selected zone, and a timezone change relayouts without editing the stored events. Creating an event opens a draft bound to the selected slot and saves with a conflict check if the slot was taken. Dragging to reschedule is a mutation of start and end that can fail and snap back.",
    interviewerNotes: "Mid-level signal is the range query and overlap layout. Time zones are the follow-up that separates a real answer.",
    radioSteps: {
      requirements: [
        "Views in scope and how far ahead users look",
        "Time zones, all-day events, and recurring events",
        "Create, drag, and conflict behavior",
      ],
      architecture: [
        "Range-driven fetch",
        "Layout pass for overlaps separate from event data",
        "Draft create that is not an event until save",
      ],
      data: [
        "Event: id, start, end, zone, title",
        "View range as the cache key",
      ],
      interface: [
        "Keyboard move across days and a visible now line",
        "All-day row that does not stretch timed events",
      ],
      observability: ["Range fetch latency", "Failed reschedules", "Drag-layout long tasks"],
    },
    systemDesignGuide: calendarGuide,
  }),
  design({
    id: "sd-kanban",
    topic: "sd-kanban-board--design-the-frontend-for",
    level: "mid",
    title: "Design a kanban board",
    tags: ["board", "dnd"],
    prompt:
      "Design the frontend for a kanban board: columns, ordered cards, drag and drop, and two people moving the same card.",
    hints: [
      "Order is a property of the column, not of the mouse.",
      "A drag can fail and the card must return.",
    ],
    approach:
      "Model columns of card ids. Drag is optimistic with a version. A rejected move restores the previous order.",
    solution:
      "The board holds columns, each an ordered list of card ids, plus a card entity map. Dragging previews the new index locally and commits with the board version. If another client moved that card, the server returns the current board and the preview snaps back. Filtering is a view over the same ids, not a second board. A large column virtualizes its cards. Keyboard users get a move menu so drag is not the only path.",
    interviewerNotes: "Look for order as data, optimistic rollback, and a non-drag alternative.",
    radioSteps: {
      requirements: [
        "Who may reorder, and is the board live between users",
        "Column limits, WIP, and filters",
        "Keyboard path for moving a card",
      ],
      architecture: [
        "Column order separate from card entities",
        "Optimistic move with version check",
        "Virtualized column for long lists",
      ],
      data: [
        "Board: columns of ids and a version",
        "Card: id, title, column, rank",
      ],
      interface: [
        "Drag preview that is not the committed order",
        "Move-to menu for keyboard and assistive tech",
      ],
      observability: ["Move conflicts", "Drag long tasks", "Board load time"],
    },
    systemDesignGuide: kanbanGuide,
  }),
  design({
    id: "sd-ride-map",
    topic: "sd-ride-sharing-map-ui--design-the-frontend-for",
    level: "senior",
    title: "Design a ride-sharing map",
    tags: ["maps", "realtime"],
    prompt:
      "Design the frontend for a ride-sharing map: pickup, nearby cars, a live trip, and a connection that drops mid-ride.",
    hints: [
      "The map is a view of a trip state machine.",
      "Car positions are stale samples, not truth.",
    ],
    approach:
      "Define trip phases first. Stream location only while it changes the decision the rider can make. Reconnect must recover the phase, not only the last coordinate.",
    solution:
      "Phases are choosing, matching, waiting, on-trip, and completed. The map shows pickup, destination, and a car marker whose position is a timestamped sample. The client interpolates between samples and drops a marker that is too old. A websocket carries phase changes and locations; on disconnect the UI says the link is stale and refetches the trip rather than inventing motion. Selecting a pickup is a confirmed pin, not the raw GPS dot, so a bad fix can be corrected before request.",
    interviewerNotes: "Senior signal is phase versus coordinates, and a reconnect that restores the trip.",
    radioSteps: {
      requirements: [
        "Which trip phases the rider sees",
        "How fresh a car location must be",
        "What the rider can do offline or on a stale link",
      ],
      architecture: [
        "Trip store as the source of truth",
        "Map as a renderer of pins and one route",
        "Reconnect that refetches the trip",
      ],
      data: [
        "Location sample: lat, lng, heading, observedAt",
        "Trip: phase, pickup, dropoff, car id",
      ],
      interface: [
        "A confirmed pickup pin separate from the GPS dot",
        "Stale and reconnecting states on the map chrome",
      ],
      observability: ["Location lag", "Reconnect success", "Time in matching"],
    },
    systemDesignGuide: rideGuide,
  }),
  design({
    id: "sd-spreadsheet",
    topic: "sd-spreadsheet--design-the-frontend-for",
    level: "staff",
    title: "Design a spreadsheet",
    tags: ["grid", "editor"],
    prompt:
      "Design the frontend for a spreadsheet: a large grid, formulas, editing one cell, and a sheet that does not mount every cell.",
    hints: [
      "Window the grid. Cells outside the viewport are data, not DOM.",
      "A formula’s value and its source text are different.",
    ],
    approach:
      "Separate the cell store, the viewport window, and the formula evaluator. Editing is a single active cell. Recalculation names its dependencies so one edit does not repaint the sheet.",
    solution:
      "Cells live in a sparse map keyed by coordinate. The viewport renders the visible window plus a small overscan and recycles DOM nodes on scroll. A cell stores either a literal or a formula string, plus a computed value and an error. Edits commit on blur or Enter and enqueue a recompute of the dependency subgraph. Cycles surface as a cell error rather than a frozen UI. Collaboration, if in scope, sends committed cell patches with a version, not keystrokes, unless you deliberately choose a finer mode.",
    interviewerNotes:
      "Staff signal is the windowed grid and dependency-scoped recompute. Painting a million divs is an automatic miss.",
    radioSteps: {
      requirements: [
        "Sheet size, formulas, and whether collaboration is in scope",
        "What a cycle or a bad reference should show",
        "Keyboard editing and frozen headers",
      ],
      architecture: [
        "Sparse cell store",
        "Virtualized viewport",
        "Evaluator that walks dependencies",
      ],
      data: [
        "Cell: coord, raw, value, error",
        "Dependency edges from formula parse",
      ],
      interface: [
        "One active editor",
        "Recycled cells and sticky headers",
      ],
      observability: ["Recompute time", "Scroll long tasks", "Formula error rate"],
    },
    systemDesignGuide: spreadsheetGuide,
  }),
  design({
    id: "sd-design-canvas",
    topic: "sd-design-tool-canvas--design-the-frontend-for",
    level: "staff",
    title: "Design a design-tool canvas",
    tags: ["canvas", "collab"],
    prompt:
      "Design the frontend for a design-tool canvas: objects, selection, viewport pan and zoom, and live cursors that do not corrupt the document.",
    hints: [
      "Scene objects and the camera are different state.",
      "Cursors are presence. They are not operations on the document.",
    ],
    approach:
      "Model a scene graph, a camera, and a selection. Persist operations on objects. Broadcast cursors on a lossy channel.",
    solution:
      "Objects have ids, geometry, and a z-order. The camera is pan and zoom local to the client. Hit-testing uses the camera to map pointer position to scene coordinates. Moves commit as operations on object ids so two people can edit different objects. The same object uses a version or a CRDT field so a conflicting drag does not drop either edit silently. Cursors and selections of other people render in screen space from a presence channel and are discarded if they stop. The document does not contain cursor points.",
    interviewerNotes:
      "Staff signal is separating the document, the camera, and presence. A single JSON blob of the whole canvas on every mouse move is a miss.",
    radioSteps: {
      requirements: [
        "Object types in scope and whether collaboration is live",
        "Pan, zoom, and multi-select",
        "What must survive a reload versus what is ephemeral",
      ],
      architecture: [
        "Scene store of objects",
        "Local camera",
        "Presence channel for cursors",
      ],
      data: [
        "Object ops with ids and versions",
        "Cursor samples that are not persisted",
      ],
      interface: [
        "Hit testing in scene coordinates",
        "Selection chrome that stays usable while zoomed",
      ],
      observability: ["Op apply failures", "Presence message rate", "Frame time while dragging"],
    },
    systemDesignGuide: canvasGuide,
  }),
];
