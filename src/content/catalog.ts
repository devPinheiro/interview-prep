import type { CatalogEntry, Question } from "@/lib/types";
import { allAuthoredQuestions } from "@/lib/content-registry";
import bulk1999 from "./bulk-1999.json";

/**
 * Harvested topic titles from public lists (Toptal, GFG, GFE 75, Blind/Grind75 themes).
 * Status stub = title + sources only until originally authored.
 */
const harvested: CatalogEntry[] = [
  { id: "cat-hoisting", track: "quiz", level: "beginner", canonicalTopic: "hoisting", title: "Explain hoisting in JavaScript", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }, { site: "toptal-js", url: "https://www.toptal.com/developers/javascript/interview-questions" }], tags: ["javascript"] },
  { id: "cat-prototypes", track: "quiz", level: "mid", canonicalTopic: "prototypes", title: "Prototypal inheritance vs class syntax", status: "stub", sourceRefs: [{ site: "toptal-js", url: "https://www.toptal.com/developers/javascript/interview-questions" }], tags: ["javascript"] },
  { id: "cat-event-delegation", track: "quiz", level: "mid", canonicalTopic: "event-delegation", title: "What is event delegation?", status: "stub", sourceRefs: [{ site: "toptal-js", url: "https://www.toptal.com/developers/javascript/interview-questions" }], tags: ["dom"] },
  { id: "cat-cors", track: "quiz", level: "mid", canonicalTopic: "cors", title: "Explain CORS and simple vs preflight requests", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["networking"] },
  { id: "cat-cookies-storage", track: "quiz", level: "beginner", canonicalTopic: "web-storage", title: "Cookies vs localStorage vs sessionStorage", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }], tags: ["browser"] },
  { id: "cat-critical-css", track: "quiz", level: "senior", canonicalTopic: "critical-css", title: "What is critical CSS?", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["css", "performance"] },
  { id: "cat-bfc", track: "quiz", level: "mid", canonicalTopic: "bfc", title: "Block formatting context — why it matters", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }], tags: ["css"] },
  { id: "cat-centering", track: "quiz", level: "beginner", canonicalTopic: "css-centering", title: "Ways to center a div", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }], tags: ["css"] },
  { id: "cat-react-fiber", track: "quiz", level: "senior", canonicalTopic: "react-fiber", title: "What problem does React Fiber solve?", status: "stub", sourceRefs: [{ site: "toptal-react", url: "https://www.toptal.com/developers/react/interview-questions" }], tags: ["react"] },
  { id: "cat-react-concurrent", track: "quiz", level: "senior", canonicalTopic: "concurrent-react", title: "startTransition and concurrent rendering", status: "stub", sourceRefs: [{ site: "toptal-react", url: "https://www.toptal.com/developers/react/interview-questions" }], tags: ["react"] },
  { id: "cat-redux-vs-context", track: "quiz", level: "mid", canonicalTopic: "state-management", title: "Context vs Redux/Zustand — when each", status: "stub", sourceRefs: [{ site: "toptal-react", url: "https://www.toptal.com/developers/react/interview-questions" }], tags: ["react", "state"] },
  { id: "cat-controlled-inputs", track: "quiz", level: "beginner", canonicalTopic: "controlled-inputs", title: "Controlled vs uncontrolled inputs", status: "stub", sourceRefs: [{ site: "toptal-react", url: "https://www.toptal.com/developers/react/interview-questions" }], tags: ["react", "forms"] },
  { id: "cat-virtual-dom", track: "quiz", level: "beginner", canonicalTopic: "virtual-dom", title: "What is the virtual DOM?", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }], tags: ["react"] },
  { id: "cat-hydration", track: "quiz", level: "senior", canonicalTopic: "hydration", title: "Explain hydration mismatches", status: "stub", sourceRefs: [{ site: "toptal-react", url: "https://www.toptal.com/developers/react/interview-questions" }], tags: ["ssr"] },
  { id: "cat-csrf", track: "quiz", level: "mid", canonicalTopic: "csrf", title: "CSRF — how frontends participate in defense", status: "stub", sourceRefs: [{ site: "gfg", url: "https://www.geeksforgeeks.org/interview-prep/front-end-developer-interview-questions/" }], tags: ["security"] },
  { id: "cat-csp", track: "quiz", level: "senior", canonicalTopic: "csp", title: "Content Security Policy basics for FE", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["security"] },
  { id: "cat-aria-live", track: "quiz", level: "mid", canonicalTopic: "aria-live", title: "aria-live regions — when to use", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["a11y"] },
  { id: "cat-prefers-reduced-motion", track: "quiz", level: "mid", canonicalTopic: "reduced-motion", title: "Respecting prefers-reduced-motion", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["a11y"] },
  { id: "cat-module-federation", track: "quiz", level: "staff", canonicalTopic: "module-federation", title: "Module federation trade-offs", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["architecture"] },
  { id: "cat-microfrontends", track: "quiz", level: "staff", canonicalTopic: "microfrontends", title: "When microfrontends are worth it", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["architecture"] },
  { id: "cat-contains-duplicate", track: "dsa", level: "beginner", canonicalTopic: "contains-duplicate", title: "Contains Duplicate", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["arrays"] },
  { id: "cat-best-time-stock", track: "dsa", level: "beginner", canonicalTopic: "best-time-stock", title: "Best Time to Buy and Sell Stock", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["arrays"] },
  { id: "cat-product-except-self", track: "dsa", level: "mid", canonicalTopic: "product-except-self", title: "Product of Array Except Self", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["arrays"] },
  { id: "cat-max-subarray", track: "dsa", level: "mid", canonicalTopic: "max-subarray", title: "Maximum Subarray (Kadane)", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["arrays"] },
  { id: "cat-3sum", track: "dsa", level: "mid", canonicalTopic: "3sum", title: "3Sum", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["two-pointers"] },
  { id: "cat-container-water", track: "dsa", level: "mid", canonicalTopic: "container-water", title: "Container With Most Water", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["two-pointers"] },
  { id: "cat-valid-parentheses", track: "dsa", level: "beginner", canonicalTopic: "valid-parentheses", title: "Valid Parentheses", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["stack"] },
  { id: "cat-merge-intervals", track: "dsa", level: "mid", canonicalTopic: "merge-intervals", title: "Merge Intervals", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["intervals"] },
  { id: "cat-linked-list-cycle", track: "dsa", level: "mid", canonicalTopic: "linked-list-cycle", title: "Linked List Cycle", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["linked-list"] },
  { id: "cat-invert-tree", track: "dsa", level: "beginner", canonicalTopic: "invert-binary-tree", title: "Invert Binary Tree", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["trees"] },
  { id: "cat-level-order", track: "dsa", level: "mid", canonicalTopic: "level-order", title: "Binary Tree Level Order Traversal", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["trees", "bfs"] },
  { id: "cat-number-of-islands", track: "dsa", level: "mid", canonicalTopic: "number-of-islands", title: "Number of Islands", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["graphs", "dfs"] },
  { id: "cat-clone-graph", track: "dsa", level: "mid", canonicalTopic: "clone-graph", title: "Clone Graph", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["graphs"] },
  { id: "cat-course-schedule", track: "dsa", level: "mid", canonicalTopic: "course-schedule", title: "Course Schedule", status: "stub", sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }], tags: ["graphs"] },
  { id: "cat-throttle", track: "dsa", level: "mid", canonicalTopic: "throttle", title: "Implement throttle", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["javascript"] },
  { id: "cat-promisify", track: "dsa", level: "mid", canonicalTopic: "promisify", title: "Promisify a callback API", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["javascript"] },
  { id: "cat-flatten", track: "dsa", level: "mid", canonicalTopic: "flatten-array", title: "Flatten nested arrays", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["javascript"] },
  { id: "cat-curry", track: "dsa", level: "senior", canonicalTopic: "curry", title: "Implement curry", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["javascript"] },
  { id: "cat-ui-modal", track: "dsa", level: "mid", canonicalTopic: "ui-modal", title: "UI: Accessible modal dialog", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["ui-coding", "a11y"] },
  { id: "cat-ui-tabs", track: "dsa", level: "mid", canonicalTopic: "ui-tabs", title: "UI: Tabs component", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["ui-coding"] },
  { id: "cat-ui-dropdown", track: "dsa", level: "mid", canonicalTopic: "ui-dropdown", title: "UI: Dropdown menu", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["ui-coding"] },
  { id: "cat-ui-infinite-scroll", track: "dsa", level: "senior", canonicalTopic: "ui-infinite-scroll", title: "UI: Infinite scroll list", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["ui-coding"] },
  { id: "cat-ui-form-validation", track: "dsa", level: "mid", canonicalTopic: "ui-form-validation", title: "UI: Form with validation", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }], tags: ["ui-coding"] },
  { id: "cat-sd-image-carousel", track: "system-design", level: "mid", canonicalTopic: "image-carousel", title: "Design an image carousel", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["widgets"] },
  { id: "cat-sd-chat", track: "system-design", level: "senior", canonicalTopic: "chat-ui", title: "Design a chat application UI", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["realtime"] },
  { id: "cat-sd-photo-share", track: "system-design", level: "senior", canonicalTopic: "photo-sharing", title: "Design a photo sharing app UI", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["media"] },
  { id: "cat-sd-ecommerce", track: "system-design", level: "senior", canonicalTopic: "ecommerce-storefront", title: "Design an e-commerce storefront", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["commerce"] },
  { id: "cat-sd-rich-text", track: "system-design", level: "staff", canonicalTopic: "rich-text-editor", title: "Design a collaborative rich text editor", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["collab"] },
  { id: "cat-sd-analytics-dashboard", track: "system-design", level: "staff", canonicalTopic: "analytics-dashboard", title: "Design an analytics dashboard", status: "stub", sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/questions/system-design" }], tags: ["data-viz"] },
  { id: "cat-beh-disagreement", track: "behaviour", level: "senior", canonicalTopic: "disagreement-senior", title: "Disagreement with a strong senior engineer", status: "stub", sourceRefs: [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" }], tags: ["conflict"] },
  { id: "cat-beh-failed-project", track: "behaviour", level: "mid", canonicalTopic: "failure", title: "Tell me about a failure", status: "stub", sourceRefs: [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" }], tags: ["growth"] },
  { id: "cat-beh-tight-deadline", track: "behaviour", level: "mid", canonicalTopic: "deadline", title: "Delivering under a tight deadline", status: "stub", sourceRefs: [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" }], tags: ["ownership"] },
  { id: "cat-beh-cross-team", track: "behaviour", level: "staff", canonicalTopic: "cross-team-launch", title: "Leading a cross-team launch", status: "stub", sourceRefs: [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" }], tags: ["leadership"] },
  { id: "cat-beh-saying-no", track: "behaviour", level: "senior", canonicalTopic: "saying-no", title: "Pushing back on a product request", status: "stub", sourceRefs: [{ site: "frontend-atlas", url: "https://frontendatlas.com/guides/behavioral/intro" }], tags: ["judgment"] },
  { id: "cat-neg-competing", track: "negotiation", level: "senior", canonicalTopic: "competing-offers", title: "Using competing offers ethically", status: "stub", sourceRefs: [{ site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" }], tags: ["offers"] },
  { id: "cat-neg-sign-on", track: "negotiation", level: "mid", canonicalTopic: "sign-on", title: "Negotiating sign-on bonus", status: "stub", sourceRefs: [{ site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" }], tags: ["offers"] },
  { id: "cat-neg-remote", track: "negotiation", level: "mid", canonicalTopic: "remote-flexibility", title: "Negotiating remote / flexibility", status: "stub", sourceRefs: [{ site: "hbs", url: "https://online.hbs.edu/blog/post/salary-negotiation-tips" }], tags: ["non-cash"] },
  { id: "cat-neg-equity-refresh", track: "negotiation", level: "senior", canonicalTopic: "equity-refresh", title: "Asking about equity refreshers", status: "stub", sourceRefs: [{ site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" }], tags: ["equity"] },
];

function questionToCatalog(q: Question): CatalogEntry {
  return {
    id: `ready-${q.id}`,
    track: q.track,
    level: q.level,
    canonicalTopic: q.canonicalTopic,
    title: q.title,
    sourceRefs: q.sourceRefs,
    status: q.status,
    tags: q.tags,
  };
}

/** Deduped catalog: ready wins, then hand harvest, then bulk-1999 stubs */
export function buildCatalog(): CatalogEntry[] {
  const ready = allAuthoredQuestions().map(questionToCatalog);
  const byTopic = new Map<string, CatalogEntry>();

  const bulk = (bulk1999.entries ?? []) as CatalogEntry[];
  for (const entry of bulk) {
    byTopic.set(`${entry.track}:${entry.canonicalTopic}`, entry);
  }
  for (const entry of harvested) {
    byTopic.set(`${entry.track}:${entry.canonicalTopic}`, entry);
  }
  for (const entry of ready) {
    byTopic.set(`${entry.track}:${entry.canonicalTopic}`, entry);
  }
  return [...byTopic.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export const catalogEntries: CatalogEntry[] = buildCatalog();
