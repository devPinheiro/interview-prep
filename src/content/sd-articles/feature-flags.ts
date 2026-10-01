import type { SystemDesignGuide } from "@/lib/types";

export const featureFlagsGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A console where operators define flags, target who sees them, and publish to an environment. The runtime SDK that apps use is a client of the published snapshot, not of this editing UI.

What you commit to:

- A flag has a key, a type (boolean or variant), a default, and rules. Draft edits are not live. Publish creates an immutable version for that environment.
- Production publish is a distinct permission from editing a draft. The UI shows that, and the server enforces it.
- Kill switch is a single action that sets the default off (or to a safe variant) and publishes immediately, audited.
- Evaluation for a real user happens on published data. The console can preview “as this user,” and that preview is not a side door that writes the live snapshot.
- Apps cache a snapshot with a version and a TTL. You have a story for stale clients: polling or a push, and a maximum age you will tolerate.

Scale: thousands of flags, a handful of environments, publishes that must be boring. The hot path is read-heavy in the apps, not in this console.

Out of scope: building the experiment statistics pipeline. You can attach an experiment id and link out. Rule evaluation that needs secrets stays on the server. Do not ship raw allow-lists of user ids to a public CDN.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Separate the editor, the published snapshot, and the evaluator.

The editor loads a flag definition and a draft. Changing a rule updates the draft. Nothing in the applications moves until publish. Publish copies the draft to a versioned snapshot for one environment and appends an audit record (actor, diff, timestamp).

The snapshot service is what SDKs fetch: \`{ version, flags: [{ key, type, default, rules }] }\` already stripped of notes and of any targeting data you do not want in the client. There are two delivery shapes. Server-side evaluation returns a small map of key to variant for this user, and the browser never sees the rules. Client-side evaluation ships the rules and evaluates locally, which is fast offline and leaks the rule set. Say which you ship, and for a public consumer app prefer server evaluation or a signed, minimized payload.

The console’s preview calls the same evaluator with a supplied attribute bag and shows the variant plus which rule matched. It does not write.

## Rules

A rule is an ordered list: individual overrides, then segment matches, then a percentage, then the default. Percentage bucketing is a stable hash of flag key plus user id, not \`Math.random\` on each page view. The console explains that a user stays in the bucket when you do not change the salt.

## Environments

Dev, staging, and prod are separate snapshots. Cloning a draft from staging to prod is an explicit action, not a shared database row you edit in two places. The header names the environment in text, and prod publish uses a stronger confirm.

## Stale SDKs

Clients send the version they have. If you publish, either the next poll picks up the version or a stream tells them to refetch. The kill switch should not wait for a one-hour TTL. Say the max staleness for normal rules, and a shorter path for the kill switch.`,
      diagram: {
        caption: "Drafts stay in the console. SDKs read a published snapshot. Preview uses the evaluator and does not publish.",
        mermaid: `flowchart TB
  Editor[Flag editor]
  Draft[Draft]
  Publish[Publish command]
  Snap[Environment snapshot]
  Audit[Audit log]
  SDK[App SDK]
  Preview[Preview as user]
  Eval[Evaluator]
  Editor --> Draft
  Draft --> Publish
  Publish --> Snap
  Publish --> Audit
  Snap --> SDK
  Snap --> Eval
  Preview --> Eval`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Flag: \`{ key, description, type, variants[], archived }\`. Key is immutable after create, because apps already compiled it in.

Draft and version share a body: \`{ default, rules[], salt }\`. Rule: \`{ id, kind, clauses[], variant, rolloutPct? }\`. Clause: attribute, operator, values. Keep this structured. A free-form code box is a support incident.

Snapshot: \`{ env, version, publishedAt, publishedBy, flags }\`. SDKs store \`version\` next to the map they evaluated.

Audit: \`{ actor, env, fromVersion, toVersion, diff, at }\`. The console renders the diff, not a raw blob, but the blob is stored so you can roll back by republishing an old version.

Overrides for a single user are rules, and they are sensitive. They belong in the server-side snapshot. If an operator pastes a thousand user ids, that is a segment maintained elsewhere, not a textarea in the client bundle.

Local UI state: which environment, the open flag, unsaved draft. Warn on navigation if the draft is dirty. Do not write drafts to localStorage if descriptions contain customer identifiers.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /flags/{key}?env=
→ { flag, draft, published }

PUT /flags/{key}/draft
{ rules, default }
→ { draft }

POST /flags/{key}/publish
{ env, draftVersion }
→ { snapshotVersion, audit }

POST /flags/{key}/kill
{ env, reason }
→ { snapshotVersion }

POST /evaluate
{ env, flagKey, attributes }
→ { variant, matchedRuleId }

GET /sdk/snapshot?env=&version=
→ 304 or { version, flags }
\`\`\`

Publish sends the draft version so you cannot publish over a teammate’s unpublished view by accident. If the draft moved, return 409 and reload it.

The rule list is reorderable and readable as sentences (“if country is DE, serve variant B”). Percentage is a number input with the bucket explanation next to it. The environment is a control with the current name always visible, not only a color.

Kill switch is a button that states the resulting variant. It is available even if you are mid-edit, and it publishes the safe default rather than your half-finished draft. Say that explicitly so an editor does not accidentally ship a broken rule while trying to turn a flag off.

Archive hides the flag from new evaluates after a publish, and keeps history.`,
      diagram: {
        caption: "Editing saves a draft. Publishing is a second step. Kill skips the draft and writes a safe version.",
        mermaid: `sequenceDiagram
  participant Op as Operator
  participant API
  participant SDK
  Op->>API: save draft
  Op->>API: publish draft version
  API-->>SDK: new snapshot version
  Op->>API: kill switch
  API-->>SDK: safe snapshot now`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Client evaluation versus server evaluation

Client evaluation is resilient when the network blips and is easy to reason about in a prototype. It also reveals who you are targeting and can be toggled in devtools. Server evaluation (or an edge evaluate) returns only the variant, keeps allow-lists private, and puts PII attributes in one place. Cost is a request on startup or on navigation. A hybrid caches the evaluated map for the session and revalidates on focus. For a staff-level answer, prefer the hybrid and say what must never be in the cached map (other users’ identities).

## Percentage rollouts that do not reshuffle

Hash \`flagKey + salt + userId\` into a bucket. Changing the percentage moves the boundary, so some users enter or leave, but you do not reshuffle everyone if the salt stays. Changing the salt is a reshuffle and the console should warn. Anonymous users need a stable id (first-party cookie) or they flip every call. Say that.

## Kill switch latency

A one-hour cached snapshot makes a kill switch a slogan. Give the SDK a short poll, a push, or a dedicated fast path for flags marked urgent. The console shows “version N is published; clients older than N are stale,” even if the number is estimated from heartbeats. If you cannot see staleness, say so, and still set the TTL.

## Permissions and audit

Edit, publish to staging, and publish to prod are different capabilities. The audit row is the feature, not a log line. Rollback republishes a prior version and is itself audited. Two operators publishing the same flag: the second request with an old draft version fails and must reopen the diff.`,
    },
  ],
};
