import type { SystemDesignGuide } from "@/lib/types";

export const analyticsGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `An analytics dashboard for a multi-tenant product. People open it to see a few metrics over a range, filter, and sometimes export. They do not run arbitrary warehouse queries from the browser.

Pin the product rules:

- Every query is scoped to a tenant the viewer may see. The client-sent tenant id is not the authority.
- Time range, timezone, and currency are visible. A chart without a unit is a wrong chart.
- Panels load independently. One slow metric does not blank the page.
- Data can be stale. Show the freshness timestamp. Do not pretend a nightly rollup is live.
- Large breakdowns are paged or bucketed on the server. The browser does not draw a million points.
- Accessible alternatives: a chart has a title, a non-color encoding, and a table or textual summary.

Saved views can come later. The URL holds the current filters so a link reproduces the question. Saved named views, if you add them, are server records with permissions, not only a bookmark.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A shell lays out panels. Each panel owns its query key and its states: loading, ready, empty, error, forbidden, stale. The shell does not await all panels.

A backend-for-frontend accepts the semantic query (metric, range, filters, granularity) and returns a small series plus metadata. It checks auth, applies the tenant, hits a cache or a rollup store, and refuses unbounded group-bys. The warehouse is not on the browser’s critical path.

Charts are a presentation of that series. The same data feeds a table. Export, if needed, is an async job that runs the same query with a higher cap and emails or polls a file. It does not freeze the tab while generating a spreadsheet.

URL state is the shareable view. Changing a filter updates the URL and the query keys. Debounce free-text filters. Abort the previous query.

Code-split the chart library so the first paint of the KPI numbers does not wait on the biggest dependency.`,
      diagram: {
        caption: "Panels request shaped series through a BFF. The warehouse stays behind that boundary.",
        mermaid: `flowchart LR
  Shell[Dashboard shell]
  Panel[Panel]
  BFF[BFF]
  Cache[Query cache]
  Warehouse[Rollups]
  Shell --> Panel
  Panel --> BFF
  BFF --> Cache
  BFF --> Warehouse`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `The query key is the data model the client must get right.

\`\`\`
{
  tenant, metric, dimensions,
  filters, from, to, timezone, granularity
}
\`\`\`

The response:

\`\`\`
{
  points: [{ t, value }],
  unit, currency?,
  freshness, comparison?
}
\`\`\`

Cache the response under the full key, including tenant and timezone. A cache key that omits tenant will leak a chart across customers. Treat that as a security bug, not a performance footnote.

Distinguish zero, no rows, and forbidden. They are different payloads or statuses, and the panel renders different copy. An empty line chart for “you may not see this” is how people make bad decisions.

Granularity is chosen by the server from the range if the client asks for “auto”, and the response says which bucket size was used. The UI prints it.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
POST /queries
{ metric, from, to, timezone, filters, granularity }
→ { points, unit, freshness } | 403 | 429

POST /exports
{ same query }
→ { jobId }

GET /exports/{jobId}
→ { status, url? }
\`\`\`

The BFF derives the tenant from the session. A tenant field in the body is ignored or checked to match, never trusted.

429 means the panel backs off and shows a retry. It does not loop.

Charts: render from \`points\` only. Do not let a chart component call the network itself, or you will not be able to share a response with the table and the export.`,
      diagram: {
        caption: "Each panel aborts its previous query when filters change. Export is a job, not a bigger chart.",
        mermaid: `sequenceDiagram
  participant Panel
  participant BFF
  participant Store
  Panel->>BFF: query A
  Panel->>BFF: abort A
  Panel->>BFF: query B
  BFF->>Store: bounded rollup
  Store-->>Panel: points and freshness`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Freshness and honesty

Print “Updated 06:00 UTC” from the payload. If the panel is older than the metric’s promise, mark it stale and offer refresh. Mixing a live counter and a nightly cohort on one chart without labels is a product bug. The design allows different freshness per metric, and the panel reads the field instead of assuming.

## High cardinality

The BFF rejects a group-by that would return too many series. The UI offers search inside a dimension and a top-N, not an unbounded legend. A table under the chart is paged by cursor. Virtualize it. Debounce the filter input so you are not issuing a warehouse query per character.

## Multi-tenant isolation

Test that a user in tenant A cannot read tenant B’s cache entry, export, or saved view. Log denials. The browser bundle containing another tenant’s series is already an incident. Cache keys and CDN caches must vary on the authorization, or you skip shared caches for query responses entirely.

## Accessibility

Every chart has text that states the latest value and the comparison. Color is not the only encoding of up versus down. The table is in the DOM, not trapped in a canvas with no alternative. Keyboard users can change the range without dragging a mystery handle only.`,
    },
  ],
};
