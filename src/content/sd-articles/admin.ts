import type { SystemDesignGuide } from "@/lib/types";

export const adminGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `An internal console for operators: search people or records, open one, and run a small set of privileged actions (suspend, refund, impersonate-with-reason, edit a setting). It is not the customer product with an “admin” skin.

What you commit to:

- Every screen is authorized. A missing permission is a hidden or disabled action plus a server check. The client is not the security boundary.
- Lists are queries with cursors and filters in the URL. Operators share links to the same queue.
- Destructive actions require a reason, show the current record version, and are idempotent. A double click does not refund twice.
- Audit is visible in the product: who did what, when, and the before and after that the server stored. You do not reconstruct that only from browser logs.
- Impersonation, if it exists, is explicit, time-boxed, bannered, and not a way to copy the user’s session token into this origin by accident.

Scale: tables of millions of rows, of which the UI holds one page. Detail is one record. Actions are rare compared with reads.

Out of scope: the customer-facing app, a generic BI tool, and building a permission language from scratch. You consume roles the platform already has.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A shell with navigation by area (customers, orders, flags), a results list, and a detail drawer or route.

The list never downloads a table. It calls a search API that already enforces the operator’s scope (this region, this tenant). Filters that cannot be expressed should not be offered. If search is eventually consistent, say the index lags and show a “go to id” path that reads the source record.

The detail route loads the record from the source of truth, not from the search hit. The search hit can be stale. Actions POST to command endpoints and then refetch the source record.

Dangerous commands use a confirm step that quotes the target (email, amount) and a reason field that is part of the body, not a toast you forget to send. The button stays pending until the response. On success, append the audit event you got back. On conflict, show the latest record.

The shell does not embed the customer app in an iframe for “impersonation” unless you have a purpose-built token, a visible banner, and a way to exit that returns to the operator. Prefer deep links that open the customer surface in a separate session over sharing cookies on the same origin.

## Tenant and environment

If this console spans tenants, the tenant is in the URL and in every request header or path. Changing tenant clears the list. Production and staging are different hosts or a hard switch that changes the API base. A styled badge is not enough if both talk to prod.

## Performance

Virtualize long pages only if you really return more than a short page. Operators need exact rows and focus more than infinite scroll. Prefetch the detail on hover if records are heavy. Do not preload every row’s audit log.`,
      diagram: {
        caption: "Search finds ids. The source record feeds the detail. Commands write audit and return the next record.",
        mermaid: `flowchart TB
  Shell[Admin shell]
  Search[Scoped search]
  Detail[Source record]
  Cmd[Command API]
  Audit[Audit trail]
  Shell --> Search
  Search --> Detail
  Detail --> Cmd
  Cmd --> Detail
  Cmd --> Audit
  Audit --> Detail`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Search hit: \`{ id, type, title, snippet, updatedAt }\`. Enough to pick a row, not enough to act.

Record: typed per area. Example customer \`{ id, email, status, version, flags }\`. Always include \`version\` and the permission set \`{ canSuspend, canRefund }\` computed for this operator.

Command body: \`{ version, reason, payload, idempotencyKey }\`. Response: \`{ record, auditEvent }\`.

Audit event: \`{ id, actorId, action, targetId, reason, before, after, at }\`. Show it in the timeline. Do not let the client supply \`actorId\`.

Idempotency keys live for the retry window of that action. Refunds and payouts use a key derived from the operator click, stable across retries, not a new UUID per attempt.

PII: the list shows the minimum. Full payment instruments do not render. Copy-to-clipboard of secrets is an action you audit. Session storage does not keep a page of customer records after logout. Wipe the cache on sign-out.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /admin/search?q=&type=&cursor=
→ { hits, nextCursor }

GET /admin/customers/{id}
→ { record, permissions, audit }

POST /admin/customers/{id}/suspend
Idempotency-Key: {key}
{ version, reason }
→ { record, auditEvent } or 409 { record }
\`\`\`

403 means the role changed. Remove the button. 409 means the record moved. Do not retry a suspend blindly against the new version without showing it.

Tables have captions or a heading, and row actions are buttons named with the record. Status is text. The reason field is required and labeled. Errors name the field.

Focus starts in search on the home route, and in the heading of a detail route. After a successful command, move focus to the status text so the new state is announced. Do not refresh the whole app shell.`,
      diagram: {
        caption: "A privileged command sends the version and a reason. Conflict returns the record someone else wrote.",
        mermaid: `sequenceDiagram
  participant Op as Operator
  participant UI
  participant API
  Op->>UI: Suspend with reason
  UI->>API: POST version plus reason
  alt current
    API-->>UI: record and audit event
  else stale
    API-->>UI: 409 record
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Authorization in the UI

Build the action set from the permission payload, not from a role name you hard-code. Roles change shape. Also assume the payload can be stale: the server still checks. Hiding a button is usability. The 403 handler is the safety net you mention out loud.

## Impersonation

The dangerous design is “set the customer’s session cookie on this browser.” You then have an operator who is the user, with no audit, on the wrong origin. If you must view as the user, issue a short-lived, read-only, scoped token, paint a sticky banner, disable mutating customer UI, log the start and stop, and expire it. Support tools that edit as the user should be first-class admin commands instead, so the actor stays the operator.

## Bulk actions

Selecting every row on every page is a filter, not a bag of ids in the browser. “Suspend everyone in this query” submits the query and becomes a job with a preview count, a confirm, and a progress record. Show failures per id. Cap the count. An unbounded checkbox select will time out and double-apply.

## Audit that operators trust

Render the server’s before and after. Do not diff two client copies you hope are accurate. If the payload is large, show the changed paths. Timestamp in absolute time plus a zone. The operator’s own clock is a poor audit trail.`,
    },
  ],
};
