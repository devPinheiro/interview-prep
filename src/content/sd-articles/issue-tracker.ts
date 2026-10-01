import type { SystemDesignGuide } from "@/lib/types";

export const issueTrackerGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A project tracker: a filterable list of issues, a detail view with a workflow status, comments, and attachments. People share views. A board is one visualization, not the data model.

What you commit to:

- An issue has a status that belongs to a workflow. The client may show only legal transitions. The server rejects the rest.
- The list is a query: filters, sort, and a cursor. The URL can reproduce the view. A saved view is that query plus a name.
- Comments are an append-only timeline with edits that keep history. A draft comment survives a refresh.
- Bulk change is a job with progress, not a loop of a thousand optimistic patches that half-fail.
- Two people can view the same issue. If the status changes under a composer, the composer stays and the header updates. You do not discard the draft.

Scale: projects with tens of thousands of issues. The list is a window. The detail payload is one issue, not the project.

Out of scope: sprint planning math, time tracking, and a full notification product. Mentions can enqueue a notification you only name.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Read path and write path are different shapes.

The list reads a query endpoint and virtualizes rows. Each row is a summary: key, title, status, assignee, updated time. Selecting a row loads the issue by id into a detail cache. The list does not hold descriptions.

The detail view is a document plus a timeline. Status, assignee, and fields are a form bound to the document. The timeline is comments, status changes, and field changes in order. Load the first page of the timeline with the issue, and page older events separately if histories get long.

Workflow is data: for this project, from status A you may go to B or C. The control renders those edges. Submitting a transition POSTs the target status and the issue version. On conflict, show the server issue and let the user reapply. Do not merge two statuses.

Search and filters hit the query API. Typing in a text filter debounces. Facets that you cannot compute locally (assignee counts for the whole project) come back with the page. Do not filter a single page client-side and pretend the project is filtered.

## Commands

Create, comment, transition, and edit fields are commands with idempotency keys. Attachments upload to a signed URL, then the issue stores the asset id. A comment can reference attachments. Sending the comment before the upload finishes stays pending and disables submit, or the UI shows the uploading file inside the draft.

## Realtime

A project channel emits issue summaries that changed. If the open query would include them, patch the row or mark the list stale and refetch the cursor. Do not reorder the user’s viewport on every keystroke of a remote editor. Detail view for the open issue applies the patch unless a field is dirty. Dirty fields stay dirty and show “changed by someone else.”`,
      diagram: {
        caption: "The query fills the list. The issue id fills the detail. Commands return the next version.",
        mermaid: `flowchart TB
  List[Virtualized list]
  Query[Saved query in the URL]
  Detail[Issue detail]
  Doc[Issue document]
  Timeline[Timeline pages]
  API[Query and command API]
  RT[Project channel]
  Query --> API
  API --> List
  List --> Detail
  Detail --> Doc
  Detail --> Timeline
  API --> Doc
  RT --> List
  RT --> Doc`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Issue: \`{ id, key, projectId, type, title, description, status, assigneeId, fields, version, updatedAt }\`. \`fields\` is a map of custom field id to a typed value. The schema for those fields is project configuration, cached separately.

Workflow: \`{ statuses: [{ id, name, category }], transitions: [{ from, to }] }\`.

Timeline event: \`{ id, kind, actorId, at, payload }\`. Kinds include comment, status, field, and attachment. A comment payload is \`{ body, mentions, version }\`. An edited comment keeps prior bodies or a version number you can open.

Query: \`{ text, status[], assignee[], sort, cursor }\`. Serialize it to the URL in a stable way. A saved view stores that object server-side and the URL holds the view id plus local overrides.

Draft comment: \`{ issueId, body, updatedAt }\` in local storage or IndexedDB, keyed so a second issue does not clobber it.

Bulk job: \`{ id, command, progress, failures[] }\`. The client polls or subscribes. Failures name the issue key and the reason, and they are a list the user can export or retry.

Permissions are part of the read model: \`{ canTransition, canEditFields, canComment }\`. Hide controls the server will reject, and still handle a 403 because permissions change.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /issues?project=&query=&cursor=
→ { issues, facets, nextCursor }

GET /issues/{id}
→ { issue, timeline, workflow, permissions }

POST /issues/{id}/transitions
{ to, version }
→ { issue } or 409 { issue }

POST /issues/{id}/comments
Idempotency-Key: {key}
{ body, mentions }
→ { event }

POST /bulk
{ issueIds, command }
→ { jobId }
\`\`\`

409 on transition means your version lost. Replace the document and explain which field moved. The comment draft is untouched.

The list is a grid or a list of links with a predictable focus order. The filter button opens a dialog that does not trap the list permanently. Status is text and a color, never color alone. The timeline is a list with headings or times. Comment compose is a labeled textbox. Mentions are a combobox, and the stored mention is a user id, not only the typed name.

Loading the detail does not wipe the list scroll position. The selected issue id is in the URL so refresh and share work.`,
      diagram: {
        caption: "A transition either commits the next version or returns the winning document.",
        mermaid: `sequenceDiagram
  participant User
  participant UI
  participant API
  User->>UI: move to In progress
  UI->>API: transition with version
  alt version matches
    API-->>UI: issue
  else someone else wrote
    API-->>UI: 409 current issue
    UI->>User: show their change, keep draft
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Board versus list

A kanban of this data is a group-by status over the same query, with a column cursor each or one query that returns ids per column. Dragging is a transition command. If the workflow forbids that edge, the card snaps back. Do not maintain a second store of “card position” unless rank within a column is a real field. If rank exists, it is fractional and updated in the same command as the status change when both change.

## Custom fields without a bespoke form per company

The project schema lists field definitions: id, type, options, required. The detail form maps over them. Unknown types render as read-only text so an old client does not crash. Validation runs client-side for speed and server-side as authority. Required-to-transition is a workflow rule, not a red asterisk you only check in the browser.

## Comments and mentions

Store the body as a structured document or markdown that you sanitize on render. Mentions are entities \`{ userId, offset }\` so a display name change does not break the link. Notify from the server when the comment commits. Optimistic comment appends with a pending state and removes it if the POST fails. A retry uses the same idempotency key.

## Query correctness

Autocomplete of assignees searches users. It does not scan loaded issues. Counts on facets match the query, not the loaded page. If the server cannot return exact counts cheaply, say the count is approximate. Sharing the URL is part of the product. If you hide filters only in component state, you failed that requirement.`,
    },
  ],
};
