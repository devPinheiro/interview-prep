import {
  musicGuide,
  foodDeliveryGuide,
  slidesGuide,
  issueTrackerGuide,
  whiteboardGuide,
  cursorsGuide,
  adminGuide,
  featureFlagsGuide,
  cmsGuide,
  blogGuide,
  pdpGuide,
  notificationsGuide,
  driveGuide,
  formBuilderGuide,
  pollGuide,
  hotelGuide,
  flightGuide,
  composerGuide,
  storiesGuide,
  forumGuide,
  vaultGuide,
  webinarGuide,
} from "@/content/sd-articles";
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

export const systemDesignWave2: Question[] = [
  design({
    id: "sd-music-player",
    topic: "sd-music-player--design-the-frontend-for",
    level: "senior",
    title: "Design a music player",
    tags: ["media", "audio"],
    prompt:
      "Design the frontend for a music player: queue, shuffle, gapless or crossfade playback, and lock-screen controls while a track is playing.",
    hints: [
      "The queue order and the audio clock are different objects.",
      "Shuffle is a permutation you can step backward through.",
    ],
    approach:
      "Separate the session (order, index, repeat) from the engine (the clock and the next buffer). Use Media Session for the OS. Prefetch the next track.",
    solution:
      "A session owns the queue, a shuffle permutation, repeat mode, and the index. An engine plays the current source and preloads the next one. Gapless playback schedules the next buffer on a Web Audio clock. A plain audio element is enough when a small gap is acceptable. Media Session publishes title, art, and transport actions so lock-screen controls work when the tab is hidden. Resume stores the index and offset per playlist. A failed track skips once and does not tight-loop. Autoplay starts from a user gesture.",
    interviewerNotes:
      "Listen for session versus engine, a shuffle that can go back, and prefetch. Random-next on every track is a miss.",
    radioSteps: {
      requirements: ["Queue, shuffle, repeat, and resume", "Gapless or crossfade, named as a choice", "Background and media keys"],
      architecture: ["Session owns order", "Engine owns the clock", "Prefetch of the next source"],
      data: ["Track sources and a private playback snapshot", "Shuffle order distinct from album order"],
      interface: ["Transport buttons and a labeled scrubber", "Count of failures before skip"],
      observability: ["Stall rate", "Time-to-next-track", "Play failures by track id"],
    },
    systemDesignGuide: musicGuide,
  }),
  design({
    id: "sd-food-delivery",
    topic: "sd-food-delivery-tracking--design-the-frontend-for",
    level: "senior",
    title: "Design a food delivery tracking screen",
    tags: ["maps", "realtime"],
    prompt:
      "Design the frontend for food delivery tracking: order phase, ETA, and a courier on a map without treating GPS as the order status.",
    hints: [
      "The order document is the source of truth. The map is a view.",
      "Location samples can be late, jumpy, or absent.",
    ],
    approach:
      "Render phase and ETA from the order snapshot. Filter location samples. Refetch on reconnect. Push covers background phase changes.",
    solution:
      "Phases move only when the server says so. Courier samples carry a timestamp, heading, and accuracy. The client interpolates between good samples and drops impossible jumps or stale points, showing “location delayed” without rewinding the phase. The route polyline and ETA are server fields. The status text renders before the map SDK. A lost socket refetches the order. Cancel is an idempotent command. Samples are dropped after delivery.",
    interviewerNotes:
      "The senior signal is phase versus location, and a map that can fail without hiding the order state.",
    radioSteps: {
      requirements: ["Which phases exist", "When the courier is visible", "Background updates"],
      architecture: ["Order store separate from location samples", "Map as a lazy view", "Refetch on reconnect"],
      data: ["Order snapshot with phase and ETA", "Samples with sentAt and accuracy"],
      interface: ["Status as text", "Cancel with a confirm"],
      observability: ["Stale location rate", "Socket reconnects", "Time from push to phase paint"],
    },
    systemDesignGuide: foodDeliveryGuide,
  }),
  design({
    id: "sd-slides",
    topic: "sd-presentation-slides--design-the-frontend-for",
    level: "staff",
    title: "Design a presentation editor",
    tags: ["collab", "editor"],
    prompt:
      "Design the frontend for a slide deck: editing, reorder, presenter mode, and two people changing the deck without losing a slide.",
    hints: [
      "Slide order and slide bodies are different documents.",
      "The audience window follows a slide id, not a screen share, unless you say otherwise.",
    ],
    approach:
      "Model a deck as ordered ids plus a scene per slide. Ship ops. Prefetch the next slide. Undo is per author.",
    solution:
      "The deck stores order, size, and theme. Each slide is a list of objects in slide coordinates. Reorder is one operation on the id list. Text uses a scoped CRDT or OT. Object frames can be last-write-wins. Presenter mode publishes the current slide id to an audience view and prefetches the next slide’s assets. Thumbnails virtualize. Presence is not in the document log. A joining client loads a snapshot plus the op tail.",
    interviewerNotes:
      "Staff signal is order versus body, and a presenter path that does not replay the editor selection model.",
    radioSteps: {
      requirements: ["Editing, presenting, and collaboration", "What a slide contains", "Export left out or named"],
      architecture: ["Deck order plus slide scenes", "Op log", "Audience follow channel"],
      data: ["Object frames and text runs", "Idempotent ops and a snapshot"],
      interface: ["Filmstrip reorder without a mouse", "Presenter notes hidden from the audience"],
      observability: ["Op conflict rate", "Time to advance", "Failed asset loads on the next slide"],
    },
    systemDesignGuide: slidesGuide,
  }),
  design({
    id: "sd-issue-tracker",
    topic: "sd-issue-tracker--design-the-frontend-for",
    level: "senior",
    title: "Design an issue tracker",
    tags: ["workflow", "lists"],
    prompt:
      "Design the frontend for an issue tracker: filters, a workflow status, comments, and a shared view of a large project.",
    hints: [
      "A board is a view. The issue is the record.",
      "Illegal transitions are the server’s job to reject.",
    ],
    approach:
      "Put the query in the URL. Load summaries in the list and one issue in the detail. Transition with a version. Keep comment drafts on conflict.",
    solution:
      "The list is a cursor query with filters and sort reproduced in the URL. The detail is one issue plus a paged timeline. Status changes follow a workflow graph and send the issue version. A 409 replaces the document and leaves the comment draft. Comments are idempotent and store mentions as user ids. Bulk edit is a job with per-issue failures. Custom fields render from a project schema. Realtime patches rows, and dirty fields show that someone else changed them.",
    interviewerNotes:
      "Listen for query URLs, versioned transitions, and a list that is not the full issue body.",
    radioSteps: {
      requirements: ["List, detail, workflow, comments", "Shared views", "Bulk edit"],
      architecture: ["Query cache and a document cache", "Commands with version", "Job for bulk"],
      data: ["Issue version and field schema", "Timeline events"],
      interface: ["Filters in the URL", "Conflict that keeps the draft"],
      observability: ["Transition conflicts", "Query latency", "Bulk job failures"],
    },
    systemDesignGuide: issueTrackerGuide,
  }),
  design({
    id: "sd-whiteboard",
    topic: "sd-whiteboard--design-the-frontend-for",
    level: "staff",
    title: "Design a whiteboard",
    tags: ["canvas", "collab"],
    prompt:
      "Design the frontend for a shared whiteboard: ink, eraser, pan and zoom, and a board that reloads without replaying every point.",
    hints: [
      "World coordinates and the camera are different.",
      "Your own stroke paints before the server agrees.",
    ],
    approach:
      "Store strokes by id. Render a canvas from the viewport. Compact the log into snapshots. Undo only your own ops.",
    solution:
      "Pointer events append a local stroke immediately. On pointer up, a commit operation with a stable id is sent and peers draw it once. Points are simplified before persistence. The camera is local pan and zoom. The renderer culls to the viewport. Persistence is a snapshot plus a tail, optionally tiled. An eraser deletes stroke ids so undo can restore them. A pure canvas is not an accessible tree, so shapes and notes also exist in a list. Viewers do not have to receive every provisional point.",
    interviewerNotes:
      "Staff signal is local ink, idempotent stroke ids, and compaction. Replaying the raw log on every join is a miss.",
    radioSteps: {
      requirements: ["Tools in scope and how many people draw", "Reload behavior", "What is accessible"],
      architecture: ["Document versus camera", "Local provisional stroke", "Snapshot plus tail"],
      data: ["Stroke id and simplified points", "Per-user undo stack"],
      interface: ["Tools as named buttons", "Object list for notes and shapes"],
      observability: ["Stroke commit failures", "Frame time while drawing", "Snapshot size"],
    },
    systemDesignGuide: whiteboardGuide,
  }),
  design({
    id: "sd-multiplayer-cursors",
    topic: "sd-figma-like-multiplayer-cursor--design-the-frontend-for",
    level: "staff",
    title: "Design multiplayer cursors",
    tags: ["presence", "collab"],
    prompt:
      "Design the frontend presence layer for a shared design surface: cursors and selections that stay smooth and disappear when someone leaves, without writing them into the document.",
    hints: [
      "Cursors are lossy. Document edits are not.",
      "Send world coordinates, throttled, and expire them.",
    ],
    approach:
      "Put presence on a sidecar channel keyed by client id. Throttle. Filter by viewport. Interpolate remotely. Do not persist.",
    solution:
      "Local pointer movement renders immediately and a 10 to 20 Hz ticker publishes the latest world-space sample, replacing any unsent sample. Receivers keep the newest sequence per client and interpolate. A stale timeout or an explicit bye removes the cursor. Selections travel on change and share the client id. Viewport rectangles decide who receives whom so a large room does not fan out every pointer. Follow is an explicit subscription. Hidden tabs do not emit. The document log never contains cursor points.",
    interviewerNotes:
      "The staff signal is the split from the document log, interest management, and last-write-wins with expiry.",
    radioSteps: {
      requirements: ["Cursors, selections, and follow", "Room size", "What is persisted"],
      architecture: ["Awareness channel beside the op log", "Throttle and coalesce", "Viewport filter"],
      data: ["Client id, sequence, world cursor, selection", "No database row for the pointer"],
      interface: ["Overlay that does not take pointer events", "Participant list as the accessible surface"],
      observability: ["Outbound message rate", "Dropped stale cursors", "Fan-out per subscriber"],
    },
    systemDesignGuide: cursorsGuide,
  }),
  design({
    id: "sd-admin-console",
    topic: "sd-admin-console--design-the-frontend-for",
    level: "senior",
    title: "Design an admin console",
    tags: ["admin", "permissions"],
    prompt:
      "Design the frontend for an internal admin console: search, a record, and privileged actions that are audited and safe to retry.",
    hints: [
      "Search hits are not the source of truth.",
      "The button hiding is not the authorization check.",
    ],
    approach:
      "Scope every query to the operator. Act on a versioned source record with a reason and an idempotency key. Show the server’s audit event.",
    solution:
      "Search returns ids the operator is allowed to see. The detail page refetches the source record and a permission set. Commands send the version, a reason, and an idempotency key. A 409 shows the latest record. A 403 removes the action. Refunds and suspends cannot double-apply. Bulk actions submit a filter as a job. Impersonation, if present, is a short-lived scoped view with a banner and an actor that stays the operator, not a copied customer cookie. Audit before-and-after comes from the server.",
    interviewerNotes:
      "Listen for server-side checks, idempotent dangerous commands, and an audit the UI renders rather than invents.",
    radioSteps: {
      requirements: ["Which actions exist and who can run them", "Search scale", "Impersonation or not"],
      architecture: ["Search index versus source read", "Command with version and reason", "Audit timeline"],
      data: ["Record version and permission flags", "Idempotency keys on money actions"],
      interface: ["Confirm that quotes the target", "Focus moved to the new status"],
      observability: ["403 and 409 rates", "Duplicate suppression", "Time on privileged screens"],
    },
    systemDesignGuide: adminGuide,
  }),
  design({
    id: "sd-feature-flags",
    topic: "sd-feature-flag-console--design-the-frontend-for",
    level: "staff",
    title: "Design a feature flag console",
    tags: ["platform", "release"],
    prompt:
      "Design the frontend for a feature flag console: drafts, targeting, publish to an environment, and a kill switch apps actually observe.",
    hints: [
      "A draft is not live.",
      "Percentage buckets need a stable hash, not Math.random.",
    ],
    approach:
      "Edit a draft, publish an immutable snapshot per environment, and have SDKs read that snapshot. Keep a separate kill path with a short staleness bound.",
    solution:
      "Flags have a key, a type, and rules ordered as overrides, segments, percentage, then default. Percentage uses a hash of flag key, salt, and user id. Publish copies a draft version into an environment snapshot and writes an audit diff. Prod publish is a separate permission. Preview calls the evaluator and does not publish. SDKs fetch a versioned snapshot or an evaluated map. Client-side evaluation leaks rules, so a public app should get evaluated variants. The kill switch publishes a safe default immediately and does not wait on a long TTL. Rollback republishes an old version.",
    interviewerNotes:
      "Staff signal is draft versus published, stable bucketing, and kill-switch latency. A console that only writes a JSON file with no version is thin.",
    radioSteps: {
      requirements: ["Flag types, environments, and who may publish", "Evaluation on client or server", "Kill switch staleness"],
      architecture: ["Draft, publish, snapshot, evaluator", "SDK cache with a version"],
      data: ["Ordered rules and a salt", "Audit from version to version"],
      interface: ["Environment always visible", "Kill does not ship the dirty draft"],
      observability: ["Clients still on an old version", "Publish conflicts", "Kill to observed propagation"],
    },
    systemDesignGuide: featureFlagsGuide,
  }),
  design({
    id: "sd-cms",
    topic: "sd-cms-content-editor--design-the-frontend-for",
    level: "senior",
    title: "Design a CMS editor",
    tags: ["content", "publishing"],
    prompt:
      "Design the frontend for a CMS: schema-driven entries, draft versus published, and a preview that matches production.",
    hints: [
      "The public cache and the draft API are different reads.",
      "Autosave needs a version or you will drop a paragraph.",
    ],
    approach:
      "Render the form from a schema. Save drafts with a version. Publish an immutable snapshot and purge only that content key. Preview uses a short-lived token.",
    solution:
      "Content types define fields. The editor is a generated form. References store ids, not copies. Assets upload to signed URLs and require alt to publish. Draft saves send a version and surface 409. Publish freezes that version, validates required fields, and invalidates the public cache key. Readers hit the published API only. Preview renders with the same components against draft data, noindex, and uncached. Schema changes are migrations, not a client-only rename. Rich text is structured or sanitized.",
    interviewerNotes:
      "Listen for publish snapshots, preview cache leaks, and a conflict policy on autosave.",
    radioSteps: {
      requirements: ["Entry types, locales, and preview", "Who can publish", "Media rules"],
      architecture: ["Schema-driven form", "Draft store and published versions", "Shared renderer"],
      data: ["Draft version", "Asset id plus alt", "Slug and redirects"],
      interface: ["Field errors that block publish", "Locale switch that confirms a dirty draft"],
      observability: ["409 rate on save", "Purge failures", "Preview token errors"],
    },
    systemDesignGuide: cmsGuide,
  }),
  design({
    id: "sd-blog",
    topic: "sd-blog-platform--design-the-frontend-for",
    level: "mid",
    title: "Design a blog platform",
    tags: ["content", "performance"],
    prompt:
      "Design the frontend for a blog: a fast article page, tag indexes, a feed, and comments that do not slow the article.",
    hints: [
      "The article HTML should be cacheable.",
      "Comments are a different resource.",
    ],
    approach:
      "Server-render published posts, purge the URL on publish, and load or page comments separately. Keep personalized UI off the shared cache key.",
    solution:
      "A slug returns cached HTML with the body already rendered, a reserved hero, and a real document outline. Tag pages and the feed are derived from published posts and update when visibility changes. Drafts and preview are uncached and authorized. Comments use a cursor, render as sanitized text, and rate-limit writes. The shared CDN does not vary the article on cookies. Unpublish purges. A missed purge heals because the cache lifetime is finite.",
    interviewerNotes:
      "A mid-level answer that server-renders the article and isolates comments is on track. A client-only markdown fetch is not.",
    radioSteps: {
      requirements: ["Article, indexes, feed, comments", "Drafts", "What is personalized"],
      architecture: ["Cached HTML for published posts", "Separate comment API", "Purge on publish"],
      data: ["Slug, rendered body, hero dimensions", "Comment status"],
      interface: ["One h1 and a real pager", "Comment errors on the field"],
      observability: ["Cache hit rate", "Comment 429s", "Stale page after unpublish"],
    },
    systemDesignGuide: blogGuide,
  }),
  design({
    id: "sd-pdp",
    topic: "sd-e-commerce-pdp--design-the-frontend-for",
    level: "senior",
    title: "Design a product detail page",
    tags: ["commerce", "performance"],
    prompt:
      "Design the frontend for a product detail page: gallery, variants, price, stock, and an add-to-cart that survives a double click and a sold-out race.",
    hints: [
      "The selected SKU belongs in the URL.",
      "The cached HTML and the live stock are different freshness.",
    ],
    approach:
      "Server-render the default SKU. Resolve option picks to a SKU. POST the cart line with an idempotency key and handle sold-out and price changes.",
    solution:
      "The product document lists option axes and SKUs with price, availability, and images. Selection updates the URL only when a SKU exists, and unavailable combos stay visible as unavailable. The hero image is the LCP with known dimensions. Add to cart sends sku id, quantity, and an idempotency key. A 409 sold-out refreshes availability instead of incrementing the badge. Public HTML can be cached, with a live availability read for hot SKUs. Reviews and recommendations stay off the critical path. Swatches have text names.",
    interviewerNotes:
      "Listen for SKU identity, idempotent add, and a split between cached content and live stock.",
    radioSteps: {
      requirements: ["Variants, gallery, and cart handoff", "What is cached", "Reviews in or out"],
      architecture: ["Product document selects a SKU", "Cart command", "Lazy secondary content"],
      data: ["SKU price and image ids", "Idempotency key on the line"],
      interface: ["Radio groups per option axis", "Button reason when no SKU matches"],
      observability: ["Add-to-cart conflict rate", "LCP element", "Unavailable combination rate"],
    },
    systemDesignGuide: pdpGuide,
  }),
  design({
    id: "sd-notifications",
    topic: "sd-notification-center",
    level: "senior",
    title: "Design a notification center",
    tags: ["inbox", "realtime"],
    prompt:
      "Design the frontend for an in-app notification center: a correct unread badge, a paged list, mark-all-read, and optional browser push.",
    hints: [
      "The badge count is not the length of the loaded page.",
      "Mark-all-read is a cursor, not a loop over loaded ids.",
    ],
    approach:
      "Keep a server unread count. Page the list. Mark read optimistically and reconcile. Ask for push only after a real gesture, and deep-link to the same URL.",
    solution:
      "The badge reads unreadCount. The panel pages notification entities, grouped by the server. Mark-all-read sends the cursor at click time so a newer item stays unread. Realtime prepends only when the panel is at the top, and otherwise bumps the badge. A failed fetch does not zero the badge. Push permission is requested in context. The service worker opens the target URL and is not a second inbox. Rows are links, and the button name includes the unread count.",
    interviewerNotes:
      "Listen for the count versus the page, and for mark-all as a cursor. Asking for push on first paint is a product miss.",
    radioSteps: {
      requirements: ["Badge, list, read state, push or not", "Grouping", "Deleted targets"],
      architecture: ["Count endpoint plus a paged list", "Realtime prepend rules", "Service worker as a deep link"],
      data: ["Unread count and read cursor", "Notification target url"],
      interface: ["Panel focus trap that restores", "Unread not color alone"],
      observability: ["Badge drift versus server", "Push permission grants", "Mark-read failures"],
    },
    systemDesignGuide: notificationsGuide,
  }),
  design({
    id: "sd-drive",
    topic: "sd-file-storage-drive",
    level: "senior",
    title: "Design a file drive",
    tags: ["files", "uploads"],
    prompt:
      "Design the frontend for a cloud drive: folders, resumable upload, move and rename, sharing, and preview.",
    hints: [
      "A folder listing is a cursor, not the whole tree.",
      "Upload progress comes from acknowledged bytes.",
    ],
    approach:
      "Cache metadata by folder id. Run uploads as resumable sessions beside the list. Treat search and preview as different reads. Send ACL changes explicitly.",
    solution:
      "The URL holds the folder id. Children are paged and virtualized if needed. Sort is server-side. Uploads create a session, PUT chunks from the last offset, and complete into the folder. The queue survives navigation inside the app and does not pretend it can resume after the file handle is gone. Rename and move use a version and surface name conflicts. Sharing edits roles and optional expiring links. Preview picks a viewer by mime after the shell. Soft delete goes to trash. Write actions hide when canWrite is false and still handle 403.",
    interviewerNotes:
      "Listen for resumable uploads, folder pagination, and permissions that the server still enforces.",
    radioSteps: {
      requirements: ["Browse, upload, share, preview", "Conflict rule on names", "Trash or hard delete"],
      architecture: ["Metadata cache and an upload queue", "Search as its own API", "Preview by mime"],
      data: ["File version and parent id", "Upload offset", "ACL entries"],
      interface: ["Keyboard selection and a real upload button", "Share roles spelled out"],
      observability: ["Upload failure and resume", "403 after a stale ACL", "Folder query latency"],
    },
    systemDesignGuide: driveGuide,
  }),
  design({
    id: "sd-form-builder",
    topic: "sd-form-builder",
    level: "staff",
    title: "Design a form builder",
    tags: ["forms", "a11y"],
    prompt:
      "Design the frontend for a form builder: a schema, conditional logic, a published version, and an accessible form that respondents actually fill.",
    hints: [
      "Publish freezes a version so later edits do not rewrite old answers.",
      "Logic is data, not author-supplied JavaScript.",
    ],
    approach:
      "One schema feeds the builder and the respondent renderer. Submit answers against the version id. Validate again on the server and return errors by field id.",
    solution:
      "Fields have stable ids, types, labels, and rules. Reorder changes order, not identity. Logic is a small interpreter shared by preview and production, with cycles rejected. Publishing copies the draft to an immutable version. Responses store answers and a label snapshot keyed by field id. Hidden fields follow one rule the server shares. The runtime is a real form with labels, described help, and error summaries. File fields upload first and submit asset ids. Abuse control sits on the server. Changing a field’s type means a new field, not a silent cast.",
    interviewerNotes:
      "Staff signal is versioned responses, shared logic evaluation, and a runtime that is accessible. A canvas of absolute inputs is a miss.",
    radioSteps: {
      requirements: ["Field types, logic, and multi-page or not", "What publish freezes", "Abuse control"],
      architecture: ["Schema, shared renderer, published version", "Answer map by field id"],
      data: ["Stable field ids", "Response label snapshot", "Logic AST"],
      interface: ["Labeled controls and an error summary", "Builder field list beyond drag and drop"],
      observability: ["Submit validation failures", "Logic cycle rejects", "Upload failures on file fields"],
    },
    systemDesignGuide: formBuilderGuide,
  }),
  design({
    id: "sd-poll",
    topic: "sd-live-poll",
    level: "mid",
    title: "Design a live poll",
    tags: ["realtime", "voting"],
    prompt:
      "Design the frontend for a live poll: one vote each, totals that move, and a close that freezes the result.",
    hints: [
      "The total on screen is a server snapshot.",
      "A local plus-one plus a snapshot double counts.",
    ],
    approach:
      "Record a ballot keyed by voter. Broadcast full tallies with a version. Close seals the poll. Deduplicate in the server, not with a disabled button alone.",
    solution:
      "GET returns the poll, the tally, and this voter’s choice. POST is idempotent and unique per voter. The response and the live channel both carry counts, total, and a version. The client applies only a newer version and recomputes percent from that total. Large rooms coalesce broadcasts. Closing rejects further ballots and publishes a final snapshot. Reconnect uses GET so a missed close does not leave the buttons active. Options are labeled, and results include text, not only bars.",
    interviewerNotes:
      "Listen for idempotent ballots and snapshot versions. Optimistic increments without replacement are the bug.",
    radioSteps: {
      requirements: ["Who may vote once", "Whether votes can change", "Audience size"],
      architecture: ["Ballot store and an aggregate", "Versioned tally snapshots", "Host close command"],
      data: ["Unique voter key", "Counts and total"],
      interface: ["Labeled options", "Closed state without vote controls"],
      observability: ["Duplicate vote rejections", "Snapshot lag", "Votes after close"],
    },
    systemDesignGuide: pollGuide,
  }),
  design({
    id: "sd-hotel",
    topic: "sd-hotel-booking",
    level: "senior",
    title: "Design a hotel booking flow",
    tags: ["commerce", "search"],
    prompt:
      "Design the frontend for hotel search and booking: dates, room rates, a hold on the last room, and a payment that does not double-book.",
    hints: [
      "Stay dates are calendar dates at the hotel, not instants.",
      "The hold is the price you may charge.",
    ],
    approach:
      "Keep search criteria in the URL. Create a short hold that freezes a rate. Book that hold with an idempotency key. Re-quote when it expires.",
    solution:
      "Search returns summaries and a from-price for the date range. The property page lists room rates for the same dates. A hold reserves inventory until expiresAt and returns the server price breakdown. Checkout counts down from that timestamp and refetches if the tab was hidden. Booking posts the hold id and an idempotency key and retries return the same confirmation. Expired or sold-out holds return to offers. Date math uses date strings. A slow search is abortable when criteria change. Card entry stays in the processor’s frame.",
    interviewerNotes:
      "Listen for holds, date-only nights, and idempotent booking. Decrementing a client-side room count is a miss.",
    radioSteps: {
      requirements: ["Search, rates, hold, pay", "Time zone of the stay", "What expires"],
      architecture: ["URL criteria", "Hold then book", "Abortable search"],
      data: ["Date strings and a price breakdown", "Hold id and expiry"],
      interface: ["Keyboard calendar", "Policy and total before pay"],
      observability: ["Hold expiry before pay", "Duplicate booking suppression", "Search abort rate"],
    },
    systemDesignGuide: hotelGuide,
  }),
  design({
    id: "sd-flight-search",
    topic: "sd-flight-search",
    level: "senior",
    title: "Design a flight search",
    tags: ["search", "commerce"],
    prompt:
      "Design the frontend for flight search: slow results, fare brands, and a price that must be rechecked before purchase.",
    hints: [
      "Abort the previous search when the criteria change.",
      "A fare brand is an offer id, not a price you add up yourself.",
    ],
    approach:
      "Put criteria in the URL. Virtualize itineraries. Filter locally only if the result set is complete. Revalidate the offer, then book with an idempotency key.",
    solution:
      "Airport autocomplete stores a code. One search runs at a time, aborted on change. Rows show slices, segments, and the lowest fare. Brands are offers on the same flights with rules as text. If the server paginates relevance, filters are new queries. Flexible dates are one matrix endpoint. Times display as airport-local. Before pay, revalidate returns the current price or unavailable. A change requires confirm. Booking retries reuse the key. The form stays usable while results load.",
    interviewerNotes:
      "Listen for abort, offer identity, and revalidation. A client-side cartesian product of brands is a miss.",
    radioSteps: {
      requirements: ["One way, return, and brands", "Complete results or not", "What is rechecked"],
      architecture: ["Abortable search", "Virtualized rows", "Revalidate then book"],
      data: ["Itinerary slices and offer ids", "Airport-local times"],
      interface: ["Results announced when they land", "Price change shown before pay"],
      observability: ["Search latency and aborts", "Revalidate price-change rate", "Duplicate bookings"],
    },
    systemDesignGuide: flightGuide,
  }),
  design({
    id: "sd-composer",
    topic: "sd-post-composer",
    level: "mid",
    title: "Design a post composer",
    tags: ["composer", "drafts"],
    prompt:
      "Design the frontend for a short-post composer: a character limit, mentions, attachments, link previews, and a draft that posts once.",
    hints: [
      "Count graphemes, and let the server enforce the same rule.",
      "The client post id is the idempotency key.",
    ],
    approach:
      "Keep a draft of text plus mention entities plus asset ids. Upload before submit. POST once with a stable client id. Clear the draft only on success.",
    solution:
      "A textarea holds plain text. Length uses grapheme segmentation. Mentions insert a user id and a range from an accessible combobox. Media uploads immediately with progress and alt text. Unfurl runs on the server and must not block submit. The client post id is minted per composer session and reused on retry so a double click is one post. Optimistic feed rows use that id until the server id arrives. Rate-limit and validation errors keep the draft. Two tabs do not share one client post id. Autosave of text uses a separate draft version.",
    interviewerNotes:
      "Listen for the limit definition, idempotent publish, and drafts that survive failure.",
    radioSteps: {
      requirements: ["Limit, mentions, media, drafts", "Reply or a new post", "Alt text required or not"],
      architecture: ["Draft model", "Upload then attach", "Create command with a client id"],
      data: ["Mention entities", "Asset ids and alt", "Client post id"],
      interface: ["Count announced near the limit", "Disabled post with a reason"],
      observability: ["Duplicate posts suppressed", "Upload failures", "Server rejections for length"],
    },
    systemDesignGuide: composerGuide,
  }),
  design({
    id: "sd-stories",
    topic: "sd-stories-viewer",
    level: "senior",
    title: "Design a stories viewer",
    tags: ["media", "a11y"],
    prompt:
      "Design the frontend for a stories viewer: a tray, ordered segments, prefetch, seen state, and controls that are not swipe-only.",
    hints: [
      "Prefetch the next segment, not every friend’s video.",
      "Pause must pause the video element.",
    ],
    approach:
      "Model a user index and a segment index. Prefetch N+1. Mark seen on advance. Provide buttons, mute by default, and respect reduced motion.",
    solution:
      "The tray is an ordered list of users with unseen counts. The viewer loads one user’s segments and starts at the first unseen. Image progress uses timestamps minus paused time. Video progress uses the element, started muted. Next and previous are buttons as well as edge taps. Prefetch covers the next segment and, near the end, the next user’s first segment. Save-Data skips eager video. Seen posts are idempotent and do not block playback. Expiry or a 404 skips. Focus returns to the tray on close. Reply pauses the story.",
    interviewerNotes:
      "Listen for a prefetch budget, a real pause, and a state machine. Autoplay with sound is a miss.",
    radioSteps: {
      requirements: ["Tray, segments, reply, expiry", "Seen definition", "Reduced motion and sound"],
      architecture: ["Viewer state machine", "Prefetch of the next segment", "Seen as a side write"],
      data: ["Segment duration and urls", "Viewer index and pause clock"],
      interface: ["Named next, previous, pause, and close", "2 of 5 as text"],
      observability: ["Segment load failures", "Prefetch bytes", "Seen write failures"],
    },
    systemDesignGuide: storiesGuide,
  }),
  design({
    id: "sd-forum",
    topic: "sd-forum",
    level: "senior",
    title: "Design a forum thread",
    tags: ["lists", "ugc"],
    prompt:
      "Design the frontend for a forum thread: a paged comment tree, votes, permalinks, and removed comments that keep their replies.",
    hints: [
      "Cap depth and page the roots. Do not mount the entire tree.",
      "A vote sets a value. It does not increment a stale score.",
    ],
    approach:
      "Normalize comments by id. Render a depth-capped tree. Vote and reply against one id. Load ancestors when the URL targets a comment.",
    solution:
      "The post is server-rendered. Roots use a cursor. Children come along to a depth, then a continue control fetches the rest. Votes PUT a value and replace the score and myVote. Replies name a parent id and an idempotency key and insert under that parent. Sort mode is in the URL and is not a local reorder of a partial page. Permalinks fetch the ancestor chain, expand it, and move focus to the comment. Removed comments arrive as placeholders without the body. Bodies are sanitized. Collapse does not have to be the only way to reach a child.",
    interviewerNotes:
      "Listen for normalization, depth caps, and permalinks. Offset paging on a “top” sort will skip and duplicate.",
    radioSteps: {
      requirements: ["Tree, votes, permalink, moderation", "Sort modes", "How deep is rendered"],
      architecture: ["Flat map plus root cursors", "Reply command", "Focus path for a comment id"],
      data: ["Parent id, score, myVote, state", "Sanitized or structured body"],
      interface: ["Reply named by author", "Vote state in the button name"],
      observability: ["Vote conflicts", "Permalink misses", "Comment submit failures"],
    },
    systemDesignGuide: forumGuide,
  }),
  design({
    id: "sd-password-vault",
    topic: "sd-password-vault",
    level: "staff",
    title: "Design a password vault",
    tags: ["security", "crypto"],
    prompt:
      "Design the frontend for a password manager vault: unlock, list, copy, and edit, with the server unable to read secrets.",
    hints: [
      "The master password is a KDF input. It is not a request body.",
      "XSS in the unlocked page can still read memory. Say that.",
    ],
    approach:
      "Authenticate the account normally. Derive and unwrap the vault key locally. Download ciphertext, decrypt in memory, and upload only ciphertext. Drop the key on lock.",
    solution:
      "The vault header has a salt, KDF parameters, a wrapped key, and a verifier. Unlock runs PBKDF2 or Argon2id in the browser and never POSTs the master password. Items are nonce plus ciphertext. Search runs on decrypted titles in memory for a personal vault, which means the server cannot search plaintext. Copy uses the clipboard and clears it best-effort. Reveal is temporary. Saves PUT ciphertext and a version. The key lives in memory and is cleared on lock, idle timeout, and sign-out. Recovery is a user-held kit. A breached server gets ciphertext and must guess the password. XSS can still steal an unlocked key, so CSP and no HTML in notes matter. Sharing, if in scope, wraps the item key to a recipient public key.",
    interviewerNotes:
      "Staff signal is the threat model: ciphertext at rest, key never sent, recovery that does not escrow, and an honest XSS limit.",
    radioSteps: {
      requirements: ["Unlock, list, edit, copy, recovery", "What the server can see", "Sharing or not"],
      architecture: ["Local KDF and unwrap", "Ciphertext sync", "In-memory decrypted store"],
      data: ["KDF header", "Item nonce and ciphertext", "Version on save"],
      interface: ["Copy without putting the secret in the accessible name", "Lock timeout"],
      observability: ["Unlock failures without logging the password", "409 on item save", "Lock events"],
    },
    systemDesignGuide: vaultGuide,
  }),
  design({
    id: "sd-webinar",
    topic: "sd-webinar-room",
    level: "staff",
    title: "Design a webinar room",
    tags: ["webrtc", "realtime"],
    prompt:
      "Design the frontend for a webinar room: a stage, a large audience, chat, raise hand, and an obvious recording state.",
    hints: [
      "The audience subscribes. It does not publish, and it does not mesh.",
      "Host mute should be enforced where the media is forwarded.",
    ],
    approach:
      "Join with a role token. Panelists publish to an SFU and everyone else subscribes to the stage. Keep chat and hands on signaling. Rejoin with the same participant id.",
    solution:
      "A join snapshot carries role, roster, stage, recording, and captions. Panelists publish camera and microphone through an SFU. Audience members only subscribe, so fan-out is the server’s problem. Hand raise is signaling. Promotion changes the token and starts a publish. Host mute is applied in the SFU and reflected in the UI. Reconnect reuses the participant id so you do not get two tiles. Leaving stops tracks. Recording is text in a persistent banner, included for late joiners. Chat has its own idempotent send and does not depend on the media peer connection. Captions are a toggle. Stage audio does not autoplay with sound.",
    interviewerNotes:
      "Staff signal is subscribe-versus-publish, server-enforced host mute, and reconnect identity. A mesh of every viewer is a miss.",
    radioSteps: {
      requirements: ["Roles, stage, chat, recording", "Audience size", "Captions"],
      architecture: ["Signaling plus SFU", "Audience subscribe only", "Separate chat"],
      data: ["Participant id and role", "Recording flag in the snapshot", "Client message id"],
      interface: ["Mute state in the button name", "Recording as text", "Device labels after permission"],
      observability: ["Reconnect success", "Publish failures", "Time with recording indicator hidden"],
    },
    systemDesignGuide: webinarGuide,
  }),
];
