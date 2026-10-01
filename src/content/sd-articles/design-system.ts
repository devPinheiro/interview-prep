import type { SystemDesignGuide } from "@/lib/types";

export const designSystemGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `You own a design system used by about fifteen product teams. They need a shared visual language, accessible primitives, and a way to ship a breaking change without stopping the company.

Pin these down:

- One core brand, with room for a second theme later via semantic tokens. Not fifteen forks.
- WCAG 2.2 AA is a release gate, not a slogan.
- Teams can contribute, and a component that only one team needs stays in that app until a second team has the same problem.
- Versions follow semver. A major has a codemod, a dual-run window, and an end date.
- Docs are a product: keyboard behavior, not only a happy-path screenshot.

Success is the share of interface built from current primitives, the time a team spends restyling a button, and the age of the oldest major still in production. Download counts are not adoption.

Out of scope: a visual brand redesign in the same quarter as the package split. Tokens can preview it. The migration of fifteen apps is its own program.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Package boundaries are the architecture.

- \`tokens\`: color, space, type, radius, motion as data. Outputs CSS variables and a typed JS map, generated from one schema.
- \`primitives\`: button, field, dialog, menu. They consume semantic tokens. They pass native attributes through.
- \`patterns\`: composed flows (form row, page header) that change faster than primitives and are easier to fork. Keep them few.
- \`icons\` and \`docs\` as their own packages so an icon fix is not a primitive major.
- \`codemods\`: transforms for the last major.

Distribution is a private npm registry. Each package is tree-shakeable. CSS is published beside the component, not injected in a way that breaks server rendering. The docs site is a real app that imports the packages the way product apps do, so a broken export fails the docs build.

Contribution path: RFC describes the user need, accessibility, and which app will dogfood it. Design and engineering both review. The release train publishes on a cadence. An escape hatch, a documented \`className\` or slot, is allowed. Undocumented copies of the source are how you lose the system.

CI for every package: unit tests, visual regression on the primitives, axe on the docs examples, and a bundle-size budget.`,
      diagram: {
        caption: "Product apps depend on patterns and primitives. Both depend on tokens. Codemods sit beside the release, not inside the runtime.",
        mermaid: `flowchart TB
  Apps[Product apps]
  Patterns[patterns]
  Primitives[primitives]
  Tokens[tokens]
  Docs[docs site]
  Codemods[codemods]
  Apps --> Patterns
  Apps --> Primitives
  Patterns --> Primitives
  Primitives --> Tokens
  Docs --> Primitives
  Codemods --> Apps`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `The token schema is the data model that matters.

A token has a name, a value per theme, and a layer: reference or semantic. Product code may only read semantic names such as \`color.bg.default\` and \`space.3\`. Reference values (\`blue.600\`) stay inside the schema so a rebrand does not chase class names through applications.

\`\`\`
{
  "color.bg.default": { "light": "{blue.50}", "dark": "{blue.950}" },
  "space.3": { "all": "12px" }
}
\`\`\`

Theme is applied by setting CSS variables on a single root, or a nested root for a canvas that embeds another brand. Do not let each app invent a second theme context.

Adoption data is a separate dataset, not in the package. Each app reports the major it has installed and, if you can do it honestly, the fraction of interactive elements that come from primitives. The platform reads that. It does not scrape bundles and guess.

An RFC record: status, owner, dogfood app, and the package version that closed it. That is what the next team plans against. A Figma file alone is not the API.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `Primitive APIs stay narrow.

\`\`\`
Button extends button attributes
  variant: "primary" | "quiet" | "danger"
  size: "sm" | "md"

Dialog
  open: boolean
  onClose: () => void
  title: string
\`\`\`

Variants do not encode every marketing layout. Composition does. A prop explosion is how a design system becomes unusable and still gets bypassed.

Focus is part of the interface. Dialog traps focus, restores it on close, and labels itself from \`title\`. Button is a real button. If you need a link, it is a link with button styles, not a div.

Release interface:

\`\`\`
major → codemod + changelog + dual-run window
visual regression required on the docs matrix
\`\`\`

A release that only bumps a version and hopes is a rollback waiting to happen. The codemod covers renames. Visual regression covers spacing and color. Neither covers a product that reached into DOM structure, which is why structure is not the API.`,
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Shipping a breaking change

Publish the new major beside the old one. Both install. The codemod opens the first pull request. Apps that do not convert stay on the old major until the published end date, and the dashboard shows them. An open-ended “we support both” means you staff two systems. Put the date in the RFC before you merge the major.

## Quality gates that teams will accept

Axe in CI on the documented examples, plus a keyboard script for dialog, menu, and combobox. A snapshot of color contrast per theme. Bundle budget per package so an icon import does not drag the docs runtime into a product button. These fail the release, not the blog post.

## Escape hatches and contribution

Measure use of \`className\` overrides and copied components. A hatch used by six teams is a missing API, not a discipline problem. The next RFC should absorb it. A hatch used once can stay local.

The failure mode of “anyone can add a component” is a storybook of one-off product screens. The rule is two consumers, an owner, and an accessibility review. The platform team can still say no and help the product ship locally. That no is the job.`,
    },
  ],
};
