import type { Question } from "@/lib/types";

export const dsaQuestions: Question[] = [
  {
    id: "two-sum",
    track: "dsa",
    level: "beginner",
    title: "Two Sum",
    tags: ["arrays", "hashmap"],
    status: "ready",
    canonicalTopic: "two-sum",
    pattern: "Hash map",
    prompt:
      "Given an array of numbers and a target, return indices of two numbers that add up to target. Assume exactly one solution. Implement `twoSum(nums, target)`.",
    hints: ["Brute force is O(n²).", "Store complements in a Map while iterating."],
    approach:
      "For each value x, check if target-x was seen. If yes, return indices. Otherwise store x → index.\nTime O(n), space O(n).",
    solution:
      "```ts\nexport function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need)!, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n```",
    interviewerNotes: "Communicate complexity; ask about duplicates and no-solution cases.",
    sourceRefs: [
      { site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" },
      { site: "gfg", url: "https://www.geeksforgeeks.org/data-structures/" },
    ],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function twoSum(nums: number[], target: number): number[] {
  // Your implementation
  return [];
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { twoSum } from './index';

test('example', () => {
  expect(twoSum([2,7,11,15], 9).sort()).toEqual([0,1]);
});

test('another', () => {
  expect(twoSum([3,2,4], 6).sort()).toEqual([1,2]);
});
`,
        },
      ],
    },
  },
  {
    id: "valid-anagram",
    track: "dsa",
    level: "beginner",
    title: "Valid Anagram",
    tags: ["strings", "hashmap"],
    status: "ready",
    canonicalTopic: "valid-anagram",
    pattern: "Hash map",
    prompt: "Return true if `t` is an anagram of `s`. Implement `isAnagram(s, t)`.",
    hints: ["Same length required.", "Count characters."],
    approach: "Count freq of s; decrement with t; all zero → true. Or sort both.",
    solution:
      "```ts\nexport function isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const counts = new Map<string, number>();\n  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);\n  for (const c of t) {\n    const n = counts.get(c);\n    if (!n) return false;\n    counts.set(c, n - 1);\n  }\n  return true;\n}\n```",
    interviewerNotes: "Unicode / case sensitivity clarifying questions are a plus.",
    sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function isAnagram(s: string, t: string): boolean {
  return false;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { isAnagram } from './index';
test('yes', () => expect(isAnagram('anagram','nagaram')).toBe(true));
test('no', () => expect(isAnagram('rat','car')).toBe(false));
`,
        },
      ],
    },
  },
  {
    id: "debounce",
    track: "dsa",
    level: "mid",
    title: "Implement debounce",
    tags: ["javascript", "timing"],
    status: "ready",
    canonicalTopic: "debounce",
    pattern: "UI utilities",
    prompt:
      "Implement `debounce(fn, wait)` that delays invoking `fn` until `wait` ms have elapsed since the last call. Preserve `this` and arguments.",
    hints: ["Clear the previous timer on each call.", "Return a wrapped function."],
    approach: "Closure over timer id; clearTimeout + setTimeout on each invocation.",
    solution:
      "```ts\nexport function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {\n  let t: ReturnType<typeof setTimeout> | undefined;\n  return function (this: unknown, ...args: Parameters<T>) {\n    clearTimeout(t);\n    t = setTimeout(() => fn.apply(this, args), wait);\n  };\n}\n```",
    interviewerNotes: "Ask about leading vs trailing edge and cancel().",
    sourceRefs: [
      { site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" },
      { site: "toptal-js", url: "https://www.toptal.com/developers/javascript/interview-questions" },
    ],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  // implement
  return fn;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { debounce } from './index';

test('debounce collapses calls', () => {
  jest.useFakeTimers();
  const fn = jest.fn();
  const d = debounce(fn, 100);
  d(); d(); d();
  expect(fn).not.toHaveBeenCalled();
  jest.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});
`,
        },
      ],
    },
  },
  {
    id: "deep-clone",
    track: "dsa",
    level: "mid",
    title: "Deep clone (JSON-safe values)",
    tags: ["javascript", "objects"],
    status: "ready",
    canonicalTopic: "deep-clone",
    pattern: "UI utilities",
    prompt:
      "Implement `deepClone(value)` for plain objects, arrays, and primitives (no functions/DOM/cycles required for the tests).",
    hints: ["Recurse on objects/arrays.", "Handle null."],
    approach: "Type-switch; map arrays; copy own enumerable keys for objects.",
    solution:
      "```ts\nexport function deepClone<T>(value: T): T {\n  if (value === null || typeof value !== 'object') return value;\n  if (Array.isArray(value)) return value.map((v) => deepClone(v)) as T;\n  const out: Record<string, unknown> = {};\n  for (const [k, v] of Object.entries(value as object)) out[k] = deepClone(v);\n  return out as T;\n}\n```",
    interviewerNotes: "Mention structuredClone, cycles, Map/Date as follow-ups.",
    sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function deepClone<T>(value: T): T {
  return value;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { deepClone } from './index';
test('nested', () => {
  const a = { x: [1, { y: 2 }] };
  const b = deepClone(a);
  expect(b).toEqual(a);
  expect(b).not.toBe(a);
  expect(b.x).not.toBe(a.x);
});
`,
        },
      ],
    },
  },
  {
    id: "event-emitter",
    track: "dsa",
    level: "mid",
    title: "Event Emitter",
    tags: ["javascript", "design"],
    status: "ready",
    canonicalTopic: "event-emitter",
    pattern: "UI utilities",
    prompt:
      "Implement a tiny EventEmitter with `on`, `off`, and `emit`. Multiple listeners per event; `off` removes one listener reference.",
    hints: ["Map from event name to Set of callbacks.", "emit should call a snapshot of listeners."],
    approach: "Store listeners in Map<string, Set<fn>>; emit iterates a copy.",
    solution:
      "```ts\nexport class EventEmitter {\n  private map = new Map<string, Set<(...args: unknown[]) => void>>();\n  on(event: string, fn: (...args: unknown[]) => void) {\n    if (!this.map.has(event)) this.map.set(event, new Set());\n    this.map.get(event)!.add(fn);\n  }\n  off(event: string, fn: (...args: unknown[]) => void) {\n    this.map.get(event)?.delete(fn);\n  }\n  emit(event: string, ...args: unknown[]) {\n    [...(this.map.get(event) ?? [])].forEach((fn) => fn(...args));\n  }\n}\n```",
    interviewerNotes: "GFE classic — discuss once(), error isolation, async emit.",
    sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export class EventEmitter {
  on(event: string, fn: (...args: unknown[]) => void) {}
  off(event: string, fn: (...args: unknown[]) => void) {}
  emit(event: string, ...args: unknown[]) {}
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { EventEmitter } from './index';
test('on/emit/off', () => {
  const ee = new EventEmitter();
  const fn = jest.fn();
  ee.on('ping', fn);
  ee.emit('ping', 1);
  expect(fn).toHaveBeenCalledWith(1);
  ee.off('ping', fn);
  ee.emit('ping', 2);
  expect(fn).toHaveBeenCalledTimes(1);
});
`,
        },
      ],
    },
  },
  {
    id: "sliding-window-max-sum",
    track: "dsa",
    level: "mid",
    title: "Max sum of subarray of size K",
    tags: ["arrays", "sliding-window"],
    status: "ready",
    canonicalTopic: "sliding-window",
    pattern: "Sliding window",
    prompt: "Given `nums` and `k`, return the maximum sum of any contiguous subarray of length k.",
    hints: ["Maintain a running window sum.", "Slide by subtracting left and adding right."],
    approach: "O(n) sliding window; avoid recomputing each window from scratch.",
    solution:
      "```ts\nexport function maxSum(nums: number[], k: number): number {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  for (let i = k; i < nums.length; i++) {\n    sum += nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n  }\n  return best;\n}\n```",
    interviewerNotes: "Pattern recognition for FE interviews that still include DSA.",
    sourceRefs: [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }],
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function maxSum(nums: number[], k: number): number {
  return 0;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { maxSum } from './index';
test('basic', () => expect(maxSum([2,1,5,1,3,2], 3)).toBe(9));
`,
        },
      ],
    },
  },
  {
    id: "ui-counter",
    track: "dsa",
    level: "beginner",
    title: "UI: Counter component",
    tags: ["react", "ui-coding"],
    status: "ready",
    canonicalTopic: "ui-counter",
    pattern: "UI coding",
    prompt: "Build a React counter with Increment and Decrement buttons showing the current count starting at 0.",
    hints: ["useState(0)", "Wire onClick handlers"],
    approach: "Local state; two buttons; display count.",
    solution:
      "```tsx\nexport default function App() {\n  const [n, setN] = useState(0);\n  return (\n    <div>\n      <p data-testid=\"count\">{n}</p>\n      <button onClick={() => setN(n+1)}>Inc</button>\n      <button onClick={() => setN(n-1)}>Dec</button>\n    </div>\n  );\n}\n```",
    interviewerNotes: "Warm-up for machine coding rounds.",
    sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }],
    sandbox: {
      template: "react-ts",
      files: [
        {
          path: "/App.tsx",
          active: true,
          code: `import { useState } from 'react';

export default function App() {
  return <div>Build the counter</div>;
}
`,
        },
      ],
    },
  },
  {
    id: "ui-todo",
    track: "dsa",
    level: "mid",
    title: "UI: Todo list",
    tags: ["react", "ui-coding"],
    status: "ready",
    canonicalTopic: "ui-todo",
    pattern: "UI coding",
    prompt:
      "Build a todo list: text input + Add button, list items with Delete. New todos append. Empty input should not add.",
    hints: ["Store array of {id, text}", "Filter on delete"],
    approach: "Controlled input; immutable updates; keys by id.",
    solution:
      "Use useState for text and todos. On add, trim and append with crypto.randomUUID or incrementing id. Map todos to rows with delete buttons.",
    interviewerNotes: "Watch for key stability and immutable state updates.",
    sourceRefs: [{ site: "greatfrontend", url: "https://www.greatfrontend.com/interviews/gfe75" }],
    sandbox: {
      template: "react-ts",
      files: [
        {
          path: "/App.tsx",
          active: true,
          code: `import { useState } from 'react';

export default function App() {
  return <div>Todo list goes here</div>;
}
`,
        },
      ],
    },
  },
];
