import { autocompleteGuide, newsFeedGuide, designSystemGuide, platformGuide } from "@/content/sd-articles";
import type { Question } from "@/lib/types";

export const systemDesignQuestions: Question[] = [
  {
    id: "sd-autocomplete",
    track: "system-design",
    level: "mid",
    title: "Design an autocomplete typeahead",
    tags: ["search", "performance"],
    status: "ready",
    canonicalTopic: "sd-autocomplete--design-the-frontend-for",
    prompt:
      "Design the frontend for a search typeahead that suggests results as the user types. Cover UX, data fetching, caching, accessibility, and failure modes.",
    hints: [
      "Debounce input; cancel in-flight requests.",
      "Keyboard navigation and ARIA combobox pattern.",
    ],
    approach:
      "Treat typeahead as a race between keystrokes and the network. Debounce, abort stale responses, and keep the combobox contract.",
    solution:
      "Component tree: SearchBox → SuggestionsList → SuggestionItem.\nFetch with debounce (150–300ms) and AbortController.\nCache recent queries in memory (LRU).\nA11y: role=combobox, aria-activedescendant, arrow keys, Enter to select.\nErrors: show retry; never block typing.\nPerf: virtualize if >100 results; prioritize LCP of the page shell separately.",
    interviewerNotes:
      "Strong candidates discuss race conditions (out-of-order responses) and a11y without prompting.",
    sourceRefs: [
      { site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" },
    ],
    radioSteps: {
      requirements: [
        "Latency target for suggestions (e.g. <200ms perceived)",
        "Mobile + desktop keyboard flows",
        "Empty / error / offline states",
        "Analytics needs (query, click-through)",
      ],
      architecture: [
        "Controlled input + listbox composition",
        "Where ranking runs (client vs edge vs API)",
        "Feature flags for new ranking models",
      ],
      data: [
        "Request/response shape for suggestions",
        "Client cache key = normalized query",
        "Prefetch popular queries?",
      ],
      interface: [
        "Debounce + AbortController",
        "Virtualization threshold",
        "ARIA combobox pattern",
      ],
      observability: [
        "Time-to-first-suggestion",
        "Error rate / abort rate",
        "Click-through by rank position",
      ],
    },
    systemDesignGuide: autocompleteGuide,
  },
  {
    id: "sd-news-feed",
    track: "system-design",
    level: "senior",
    title: "Design a social news feed UI",
    tags: ["feed", "infinite-scroll", "realtime"],
    status: "ready",
    canonicalTopic: "sd-news-feed--design-the-frontend-for",
    prompt:
      "Design a Facebook/Twitter-like feed: infinite scroll, mixed media, likes, and near-realtime updates. Focus on frontend architecture.",
    hints: [
      "Pagination cursor + virtualization",
      "Optimistic updates for likes",
      "Realtime via websocket or polling",
    ],
    approach:
      "Separate feed domain store from presentational list.\nDiscuss CSR/SSR for first page, then client pagination.\nTrade-offs: infinite scroll vs page numbers for a11y/SEO.",
    solution:
      "Architecture: FeedPage → VirtualizedList → PostCard → media/actions.\nData: cursor-based pagination; normalized entities (posts, users).\nState: server cache (React Query) + optimistic like mutations.\nRealtime: websocket invalidates or patches post; reconcile with pagination.\nPerf: virtualize, responsive images, defer below-fold media.\nA11y: prefer 'Load more' control in addition to scroll for keyboard users.",
    interviewerNotes: "Listen for normalization, optimistic UI rollback, and CWV impacts.",
    sourceRefs: [
      { site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" },
    ],
    radioSteps: {
      requirements: [
        "First contentful feed paint goals",
        "Realtime freshness expectations",
        "Media types supported",
        "Accessibility for infinite content",
      ],
      architecture: [
        "SSR first page vs CSR-only",
        "Virtualized list strategy",
        "Boundary between feed and post detail routes",
      ],
      data: [
        "Cursor pagination contract",
        "Normalized store for posts/users",
        "Optimistic mutation + rollback",
      ],
      interface: [
        "Image CDN + srcset",
        "Skeleton vs spinner",
        "IntersectionObserver load trigger",
      ],
      observability: [
        "Feed LCP / INP",
        "Pagination error rates",
        "Realtime disconnect recovery",
      ],
    },
    systemDesignGuide: newsFeedGuide,
  },
  {
    id: "sd-design-system",
    track: "system-design",
    level: "staff",
    title: "Design a multi-team design system",
    tags: ["design-systems", "platform"],
    status: "ready",
    canonicalTopic: "design-system",
    prompt:
      "You own a design system used by 15 product teams. Design packaging, tokens, contribution, versioning, and migration strategy.",
    hints: [
      "Tokens first, components second",
      "Semver + codemods",
      "Adoption metrics",
    ],
    approach:
      "Treat DS as a product with paved roads.\nDiscuss monorepo packages, docs site, RFC process, and escape hatches.",
    solution:
      "Packages: tokens, primitives, patterns, icons, docs.\nDistribution: npm with semver; visual regression CI.\nContribution: RFC → review → release train.\nMigrations: codemods, dual-running major versions, adoption dashboard.\nGovernance: design+eng partnership; measure % of UI using DS components.",
    interviewerNotes: "Staff bar: org mechanics and migration economics.",
    sourceRefs: [
      { site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" },
    ],
    radioSteps: {
      requirements: [
        "Team count and release cadence",
        "Brand flexibility vs consistency",
        "Accessibility WCAG target",
      ],
      architecture: [
        "Token → primitive → pattern layers",
        "Package boundaries and tree-shaking",
        "Docs as a first-class app",
      ],
      data: [
        "Token schema (color, space, type)",
        "Theme switching model",
      ],
      interface: [
        "Component API consistency",
        "Composition over variants explosion",
      ],
      observability: [
        "Adoption telemetry",
        "A11y audit CI",
        "Bundle size budgets per package",
      ],
    },
    systemDesignGuide: designSystemGuide,
  },
  {
    id: "sd-fe-platform",
    track: "system-design",
    level: "principal",
    title: "Design a frontend platform for the company",
    tags: ["platform", "dx", "governance"],
    status: "ready",
    canonicalTopic: "fe-platform",
    prompt:
      "As principal engineer, design the frontend platform: CI templates, framework standard, observability, and multi-year migration off a legacy stack.",
    hints: [
      "Golden paths beat mandates",
      "Measure developer throughput and incident rate",
      "Strangler-fig migrations",
    ],
    approach:
      "Define outcomes (ship speed, reliability, consistency).\nPropose paved road: starter kits, lint, CI, RUM.\nMigration: strangler pattern, risk tiers, executive narrative.",
    solution:
      "Platform pillars: scaffolding, CI/CD, design system, data-fetching standards, RUM/error tracking, security defaults.\nOrg: platform team as product; embedded champions.\nMigration: inventory apps by risk/revenue; strangler routes; dual-write period; kill criteria for legacy.\nSuccess metrics: lead time, change fail rate, CWV, % on golden path.",
    interviewerNotes: "Principal: strategy, influence, multi-year sequencing.",
    sourceRefs: [
      { site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" },
    ],
    radioSteps: {
      requirements: [
        "Business risk of legacy stack",
        "Team skill distribution",
        "Compliance/security constraints",
      ],
      architecture: [
        "Golden path starter + optional escapes",
        "Module federation / monorepo decision",
        "Shared auth and telemetry SDKs",
      ],
      data: [
        "Service contracts and BFF patterns",
        "Schema ownership",
      ],
      interface: [
        "DX docs and templates",
        "CI required checks",
      ],
      observability: [
        "RUM + error budgets for UI",
        "Platform adoption KPIs",
        "Migration burn-down",
      ],
    },
    systemDesignGuide: platformGuide,
  },
];
