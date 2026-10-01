import type { SystemDesignGuide } from "@/lib/types";

export const platformGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `The company has many frontend apps, a legacy stack that still takes traffic, and teams that will route around any mandate. The outcome you are designing for is shorter lead time, a lower change-fail rate, and Core Web Vitals that you can show next to those numbers. The toolchain is how you get there.

Facts you need before a diagram:

- How many apps, which frameworks, and which ones carry revenue or compliance risk.
- What actually hurts: slow CI, inconsistent auth, incidents, or hiring against a stack nobody wants to maintain.
- Who may step off the golden path, and what support they give up when they do.
- What “done” means in two years. Some legacy surfaces will still exist then. Name them.

The paved road includes scaffolding, required CI checks, the design system, a default data client, RUM and error reporting, and security headers. It does not include every feature component those apps will write.

Success metrics, said to an executive without a slide of logos: lead time for a small change, change-fail rate, LCP and INP on the top routes, and the percent of production deploys running the current golden path.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Treat the platform as a product with a versioned path, not a wiki.

The starter creates an app with lint, test, preview, auth, CSP, and RUM already wired. CI required checks live in one workflow template so a team does not copy an old yaml and miss the security step. Shared auth and telemetry are SDKs with a compatibility promise and a changelog. A grab bag of helpers is how every app gets a slightly different bug.

The migration is a strangler at the route layer. A gateway or the edge routes a path to the legacy app or the new one. Each route has an owner and a removal date. Dual-running is temporary and has an exit test: error rate and task success match, then the legacy route is deleted. If the date slips, re-scope the slice. Do not leave two UIs as a lifestyle.

Organization: a small platform team keeps the road. Embedded champions in product teams do the adoption. A central team that only reviews pull requests becomes a queue. An escape hatch is logged. It is unsupported for problems the road already solves.

Inventory is a table the program is sequenced from: app, framework, revenue, risk, path version, owner. Enthusiasm is not the sort key. Compliance and revenue are.`,
      diagram: {
        caption: "Teams deploy through a versioned path. The edge sends each route to legacy or new until the legacy copy is removed.",
        mermaid: `flowchart LR
  Devs[Product teams]
  Path[Golden path and CI]
  Edge[Edge router]
  Next[New apps]
  Legacy[Legacy apps]
  Score[Scorecard]
  Devs --> Path
  Path --> Next
  Edge --> Next
  Edge --> Legacy
  Next --> Score
  Legacy --> Score`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `The data the platform owns is inventory and telemetry, not the product databases.

- App: id, owner, framework, risk tier, revenue tier, golden-path version, exception notes.
- Route flag: path, target (legacy or next), owner, removal date, parity status.
- Scorecard rollup: lead time, change-fail rate, LCP, INP, percent of deploys on the current path.

RUM events use one schema: app, route, metric, value, release. Apps that step off the path still send it if they want to appear in the comparison. The comparison is how you argue, so refusing telemetry is an explicit exception, not an accident.

Schema for product APIs is not owned here unless you also own a BFF standard. If you do, the contract is “product teams own their resources, the default client retries idempotent GETs, and auth is a shared SDK”. Do not pretend the platform rewrites every backend.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `The interface teams feel is the starter and the CI contract.

\`\`\`
create-app
  → repo with lint, test, preview, auth, CSP, RUM
CI required checks named in one template
  typecheck, tests, bundle budget, dependency audit

Route flag
  path, target, owner, removalDate
GET /app/{section} → legacy | next
\`\`\`

SDK compatibility: a minor never breaks a call. A major is announced with the same dual-run habit as the design system. Apps pin a path version so a platform release on Tuesday does not surprise a launch on Wednesday.

Docs are the other interface. A task-shaped page (“add a route”, “read an experiment flag”) beats a reference dump. If the happy path takes longer than the escape hatch, people will take the hatch, and your metrics will say so.`,
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Sequencing the migration

Do not rewrite the company. Pick a vertical slice behind the gateway: one revenue path, both stacks, measured parity, then delete. The second slice reuses the starter and the flag format. A big-bang rewrite concentrates risk into a date nobody believes. Say that the legacy stack lives longer because the platform team is small. That honesty is the principal signal.

## What you refuse

You refuse a second design system, a second auth SDK, and a mandate with no escape hatch. You refuse to staff feature work inside product apps except as a champion embedded for a slice. You refuse to call the program done because the starter exists. Done is the scorecard moving.

## The executive narrative

Report apps on the path against apps off it, for the same four numbers, every month. A platform that cannot show lead time and incidents is a cost center arguing taste. Adoption is the percentage of production deploys on the current path version, not the number of slack reactions to the announcement.`,
    },
  ],
};
